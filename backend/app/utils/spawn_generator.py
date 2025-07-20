import random
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from functools import lru_cache

from app.models import db
from app.entity.rock import Rock
from app.entity.rock_spawn import RockSpawn
from app.entity.zone_profile import ZoneProfile
from app.utils.spawn_logic import get_weighted_rock_choices, generate_grid_sample
from sqlalchemy import and_

# Cooldown & distance thresholds
SPAWN_COOLDOWN_MINUTES = 15
MIN_DISTANCE_METERS = 20

# In-memory cooldown tracking
last_spawn_times = {}  # { "zone_name": datetime }


def haversine(lat1, lng1, lat2, lng2):
    R = 6371000  # Earth radius in meters
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


@lru_cache(maxsize=1)
def get_all_rocks():
    """Cached rock fetch to avoid repeated DB calls"""
    return Rock.query.all()


def generate_spawn_for_zone(zone, count: int = 10):
    zone_name = zone.zone_name
    now = datetime.utcnow()

    # Skip if zone recently spawned (cooldown)
    last_time = last_spawn_times.get(zone_name)
    if last_time and (now - last_time) < timedelta(minutes=SPAWN_COOLDOWN_MINUTES):
        print(f"⏳ Skipping {zone_name} — still in cooldown window.")
        return

    # Skip if this zone already has valid spawns
    existing = RockSpawn.query.filter(
        and_(
            RockSpawn.location_name == zone_name,
            RockSpawn.expires_at > now
        )
    ).count()
    if existing > 0:
        print(f"🚫 Skipping {zone_name} — already has {existing} active spawns.")
        return

    last_spawn_times[zone_name] = now

    # Define spawn bounds and rock choices
    bounds = [(zone.lat_min, zone.lng_min), (zone.lat_max, zone.lng_max)]
    rock_list = get_all_rocks()
    rock_dict = {rock.rock_name: rock for rock in rock_list}
    choices = get_weighted_rock_choices({
        "key_rock": zone.key_rock,
        "rock_type": zone.rock_type,
        "geological_name": zone.geological_name
    }, rock_list)

    if not choices:
        print(f"❌ No spawn choices found for zone: {zone_name}")
        return

    spawn_points = generate_grid_sample(bounds, count)
    used_points = []
    new_spawns = []
    valid_spawn_count = 0

    for lat, lng in spawn_points:
        if any(haversine(lat, lng, ulat, ulng) < MIN_DISTANCE_METERS for ulat, ulng in used_points):
            continue

        rock_name = random.choice(choices)
        rock = rock_dict.get(rock_name)
        if not rock:
            continue

        expires_at = RockSpawn.generate_expiration(rock.rarity)
        new_spawn = RockSpawn(
            rock_id=rock.rock_id,
            latitude=lat,
            longitude=lng,
            location_name=zone_name,
            expires_at=expires_at
        )
        new_spawns.append(new_spawn)
        used_points.append((lat, lng))
        valid_spawn_count += 1

        print(f"🪨 Spawned {rock_name} at ({lat:.5f}, {lng:.5f}) in {zone_name}")

    if new_spawns:
        db.session.bulk_save_objects(new_spawns)
        db.session.commit()
        print(f"✅ Spawned {valid_spawn_count} rocks in {zone_name}")
    else:
        print(f"❌ No valid spawn points created for {zone_name}")


def spawn_all_zones(count_per_zone: int = 10):
    print(f"\n🌍 Spawning rocks for all zones ({count_per_zone} per zone)...")
    zones = ZoneProfile.query.all()
    total = 0
    for zone in zones:
        before = datetime.utcnow()
        generate_spawn_for_zone(zone, count=count_per_zone)
        after = datetime.utcnow()
        print(f"⏱️ Finished {zone.zone_name} in {after - before}\n")
        total += 1
    print(f"🎉 Completed spawning for {total} zones.")


def clear_rock_cache():
    """Call this manually when rocks are updated"""
    get_all_rocks.cache_clear()
