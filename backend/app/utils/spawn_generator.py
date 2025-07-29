import random
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from functools import lru_cache

from app.models import db
from app.entity.rock import Rock
from app.entity.rock_spawn import RockSpawn
from app.entity.zone_profile import ZoneProfile
from app.utils.spawn_logic import get_weighted_rock_choices
from sqlalchemy import and_

# Minimum distance between spawns
MIN_DISTANCE_METERS = 20

# In-memory cooldown tracking (per zone)
last_spawn_times = {}  # { "zone_name": datetime }


# -----------------------------------
# Haversine distance
# -----------------------------------
def haversine(lat1, lng1, lat2, lng2):
    R = 6371000  # Earth radius in meters
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


# -----------------------------------
# Cached rock fetch
# -----------------------------------
@lru_cache(maxsize=1)
def get_all_rocks():
    """Cached rock fetch to avoid repeated DB calls"""
    return Rock.query.all()


# -----------------------------------
# Helper: Spawn count based on density
# -----------------------------------
def get_spawn_count_for_zone(zone: ZoneProfile):
    """Determine spawn count dynamically based on zone density & size"""
    density_map = {
        "low": 0.5,
        "medium": 1,
        "high": 1.5
    }

    density_factor = density_map.get(zone.density, 1)
    base_count = zone.max_spawn_count  # Admin-configured max

    return int(base_count * density_factor)


# -----------------------------------
# Dynamic spawn generation (around user)
# -----------------------------------
def generate_dynamic_spawn(user_lat: float, user_lng: float, zone: ZoneProfile):
    """
    Dynamic spawn: Ensures minimum 5 rocks within 1km of user.
    Rocks spawn randomly 0–1000m away (full visible radius),
    but collection enforcement (150m) is handled separately.
    """
    now = datetime.utcnow()

    # Cooldown check
    last_time = last_spawn_times.get(zone.zone_name)
    if last_time and (now - last_time) < timedelta(minutes=zone.spawn_cooldown_minutes):
        print(f"⏳ Skipping {zone.zone_name} — cooldown active.")
        return

    # Total active in zone
    total_zone_spawns = RockSpawn.query.filter(
        and_(
            RockSpawn.location_name == zone.zone_name,
            RockSpawn.expires_at > now
        )
    ).count()

    # Nearby spawns (1km radius)
    nearby_spawns = RockSpawn.get_nearby_spawns(
        user_id=None,
        lat=user_lat,
        lng=user_lng,
        radius=1000
    )[3].get("spawns", [])
    nearby_count = len(nearby_spawns)

    print(f"🌍 Zone: {zone.zone_name} | Total active: {total_zone_spawns} | Nearby: {nearby_count}")

    min_nearby = 5
    if nearby_count >= min_nearby:
        print(f"✅ Enough nearby spawns ({nearby_count} ≥ {min_nearby}), skip.")
        return

    spawn_needed = min_nearby - nearby_count
    available_slots = zone.max_spawn_count - total_zone_spawns
    spawn_count = min(spawn_needed, available_slots)
    if spawn_count <= 0:
        print(f"🚫 Zone {zone.zone_name} full (max {zone.max_spawn_count}).")
        return

    # Rock selection
    rock_list = get_all_rocks()
    rock_dict = {rock.rock_name: rock for rock in rock_list}
    choices = get_weighted_rock_choices({
        "key_rock": zone.key_rock,
        "rock_type": zone.rock_type,
        "geological_name": zone.geological_name
    }, rock_list, mode="dynamic")

    if not choices:
        print(f"❌ No spawn choices for zone {zone.zone_name}")
        return

    new_spawns = []
    used_points = []

    for _ in range(spawn_count):
        distance = random.uniform(0, 1000)  # Full 1km radius
        bearing = random.uniform(0, 360)

        lat_offset = (distance / 6371000) * (180 / 3.14159)
        lng_offset = (distance / 6371000) * (180 / 3.14159) / cos(radians(user_lat))

        spawn_lat = user_lat + lat_offset * cos(radians(bearing))
        spawn_lng = user_lng + lng_offset * sin(radians(bearing))

        # Avoid overlapping
        if any(haversine(spawn_lat, spawn_lng, ulat, ulng) < MIN_DISTANCE_METERS for ulat, ulng in used_points):
            continue

        rock_name = random.choice(choices)
        rock = rock_dict.get(rock_name)
        if not rock:
            continue

        expires_at = RockSpawn.generate_expiration(rock.rarity)
        spawn = RockSpawn(
            rock_id=rock.rock_id,
            latitude=spawn_lat,
            longitude=spawn_lng,
            location_name=zone.zone_name,
            expires_at=expires_at
        )

        new_spawns.append(spawn)
        used_points.append((spawn_lat, spawn_lng))

    if new_spawns:
        db.session.bulk_save_objects(new_spawns)
        db.session.commit()
        last_spawn_times[zone.zone_name] = now
        print(f"✅ Spawned {len(new_spawns)} rocks near user (full 1km range).")
    else:
        print(f"❌ No spawns generated for {zone.zone_name}")




# -----------------------------------
# Static spawn for full zone (fallback)
# -----------------------------------
def generate_spawn_for_zone(zone, count: int = 10):
    """
    Generate static spawns filling entire zone bounds (used on server refresh or cron job).
    Uses static rarity weights (75% key rock, 20% same-type, 5% wildcard).
    """
    now = datetime.utcnow()

    last_time = last_spawn_times.get(zone.zone_name)
    if last_time and (now - last_time) < timedelta(minutes=zone.spawn_cooldown_minutes):
        print(f"⏳ Skipping {zone.zone_name} — cooldown active.")
        return

    existing = RockSpawn.query.filter(
        and_(
            RockSpawn.location_name == zone.zone_name,
            RockSpawn.expires_at > now
        )
    ).count()

    if existing >= zone.max_spawn_count:
        print(f"🚫 Skipping {zone.zone_name} — already has {existing} active spawns.")
        return

    rock_list = get_all_rocks()
    rock_dict = {rock.rock_name: rock for rock in rock_list}
    choices = get_weighted_rock_choices({
        "key_rock": zone.key_rock,
        "rock_type": zone.rock_type,
        "geological_name": zone.geological_name
    }, rock_list, mode="static")

    if not choices:
        print(f"❌ No spawn choices found for zone: {zone.zone_name}")
        return

    # Spawn grid across full zone bounds
    spawn_points = []
    lat_min, lng_min = zone.lat_min, zone.lng_min
    lat_max, lng_max = zone.lat_max, zone.lng_max
    for _ in range(count):
        lat = random.uniform(lat_min, lat_max)
        lng = random.uniform(lng_min, lng_max)
        spawn_points.append((lat, lng))

    new_spawns = []
    used_points = []

    for lat, lng in spawn_points:
        if any(haversine(lat, lng, ulat, ulng) < MIN_DISTANCE_METERS for ulat, ulng in used_points):
            continue

        rock_name = random.choice(choices)
        rock = rock_dict.get(rock_name)
        if not rock:
            continue

        expires_at = RockSpawn.generate_expiration(rock.rarity)
        spawn = RockSpawn(
            rock_id=rock.rock_id,
            latitude=lat,
            longitude=lng,
            location_name=zone.zone_name,
            expires_at=expires_at
        )

        new_spawns.append(spawn)
        used_points.append((lat, lng))

    if new_spawns:
        db.session.bulk_save_objects(new_spawns)
        db.session.commit()
        last_spawn_times[zone.zone_name] = now
        print(f"✅ Spawned {len(new_spawns)} rocks in {zone.zone_name}")
    else:
        print(f"❌ No spawns generated for {zone.zone_name}")


# -----------------------------------
# Spawn all zones (cron job)
# -----------------------------------
def spawn_all_zones():
    """
    Spawn rocks for all zones using each zone's configured max_spawn_count.
    This ensures flexibility if zones have different spawn limits.
    """
    print(f"\n🌍 Spawning rocks for all zones (respecting each zone's max_spawn_count)...")
    zones = ZoneProfile.query.all()
    total = 0

    for zone in zones:
        before = datetime.utcnow()

        
        generate_spawn_for_zone(zone, count=zone.max_spawn_count)

        after = datetime.utcnow()
        print(f"⏱️ Finished {zone.zone_name} ({zone.max_spawn_count} max) in {after - before}\n")
        total += 1

    print(f"🎉 Completed spawning for {total} zones.")


# -----------------------------------
# Clear rock cache
# -----------------------------------
def clear_rock_cache():
    """Call this manually when rocks are updated"""
    get_all_rocks.cache_clear()
