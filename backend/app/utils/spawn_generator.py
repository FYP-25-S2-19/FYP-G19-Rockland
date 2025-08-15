# app/utils/spawn_generator.py

import random
import math
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from functools import lru_cache
from typing import List, Tuple, Optional
import traceback

from sqlalchemy import and_

from app.models import db
from app.entity.rock import Rock
from app.entity.rock_spawn import RockSpawn
from app.entity.zone_profile import ZoneProfile
from app.utils.spawn_logic import get_weighted_rock_choices

# -----------------------------------
# Tunables
# -----------------------------------
MIN_DISTANCE_METERS = 20          # minimum spacing between spawns
NEARBY_RADIUS_METERS = 1000       # user-visible radius for dynamic spawns
MIN_NEARBY_SPAWNS = 5             # ensure at least this many near user


# In-memory per-process cooldown tracking (per zone_name)
last_spawn_times = {}  # { "zone_name": datetime }


# -----------------------------------
# Distances
# -----------------------------------
def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Meters between two WGS84 points."""
    R = 6371000.0
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


# -----------------------------------
# Rock list cache
# -----------------------------------
@lru_cache(maxsize=1)
def get_all_rocks() -> List[Rock]:
    """Cached rock fetch to avoid repeated DB calls."""
    try:
        print(f"🔍 Fetching all rocks from database...")
        rocks = Rock.query.all()
        print(f"✅ Found {len(rocks) if rocks else 0} rocks in database")
        
        # FIXED: Ensure all rock attributes are loaded before returning
        if rocks:
            for rock in rocks:
                try:
                    # Access all attributes we need to force loading
                    _ = rock.rock_name
                    _ = rock.rock_id
                    _ = rock.rarity
                    _ = rock.rock_type
                except Exception as e:
                    print(f"⚠️ Error accessing rock attributes: {e}")
            
            # Expunge from session to avoid detached instance issues
            for rock in rocks:
                db.session.expunge(rock)
        
        return rocks if rocks else []
    except Exception as e:
        print(f"❌ Error fetching rocks from database: {e}")
        print(f"❌ Traceback:\n{traceback.format_exc()}")
        return []


def clear_rock_cache():
    """Call this manually if rocks are updated."""
    get_all_rocks.cache_clear()


# -----------------------------------
# Spawn count by density
# -----------------------------------
def get_spawn_count_for_zone(zone: ZoneProfile) -> int:
    """
    Decide spawn count dynamically from zone density & admin max.
    (final cap is still zone.max_spawn_count and available free slots)
    """
    density_map = {"low": 0.5, "medium": 1.0, "high": 1.5}
    density_factor = density_map.get(zone.density, 1.0)
    base = zone.max_spawn_count
    return max(0, int(base * density_factor))


# -----------------------------------
# Polygon-aware sampling
# -----------------------------------
def _sample_point_in_zone(zone: ZoneProfile, max_tries: int = 2000) -> Optional[Tuple[float, float]]:
    """Rejection sample inside zone bbox; accept only if inside polygon (if present)."""
    for _ in range(max_tries):
        lat = random.uniform(zone.lat_min, zone.lat_max)
        lng = random.uniform(zone.lng_min, zone.lng_max)
        if zone.contains(lat, lng):  # polygon-aware; falls back to bbox if no polygon
            return lat, lng
    return None


def _sample_point_near_user_in_zone(
    user_lat: float,
    user_lng: float,
    zone: ZoneProfile,
    max_radius_m: float = NEARBY_RADIUS_METERS,
    max_tries: int = 2000,
) -> Optional[Tuple[float, float]]:
    """
    Sample a point randomly within max_radius_m of the user (great-circle),
    accepting only if the point falls inside the zone.
    """
    R = 6371000.0
    for _ in range(max_tries):
        d = random.uniform(0, max_radius_m)
        br = radians(random.uniform(0, 360))
        lat1 = radians(user_lat)
        lng1 = radians(user_lng)

        lat2 = math.asin(math.sin(lat1) * math.cos(d / R) + math.cos(lat1) * math.sin(d / R) * math.cos(br))
        lng2 = lng1 + math.atan2(
            math.sin(br) * math.sin(d / R) * math.cos(lat1),
            math.cos(d / R) - math.sin(lat1) * math.sin(lat2),
        )
        cand_lat = math.degrees(lat2)
        cand_lng = math.degrees(lng2)

        if zone.contains(cand_lat, cand_lng):
            return cand_lat, cand_lng
    return None


# -----------------------------------
# Safe rock dictionary creation
# -----------------------------------
def create_rock_by_name_dict(rock_list: List[Rock]) -> dict:
    """Safely create rock_by_name dictionary with error handling."""
    try:
        if not rock_list:
            print(f"❌ Spawn Generator: No rocks provided to create dictionary")
            return {}
            
        print(f"🔍 Spawn Generator: Creating rock dictionary from {len(rock_list)} rocks")
        
        rock_by_name = {}
        valid_rocks = 0
        invalid_rocks = 0
        
        for i, r in enumerate(rock_list):
            try:
                if r is None:
                    print(f"⚠️ Spawn Generator: Rock at index {i} is None")
                    invalid_rocks += 1
                    continue
                
                # FIXED: More careful attribute access
                try:
                    rock_name = getattr(r, 'rock_name', None)
                    rock_id = getattr(r, 'rock_id', None)
                except Exception as attr_error:
                    print(f"⚠️ Spawn Generator: Cannot access attributes for rock {i}: {attr_error}")
                    invalid_rocks += 1
                    continue
                    
                if not rock_name:
                    print(f"⚠️ Spawn Generator: Rock at index {i} has empty rock_name")
                    invalid_rocks += 1
                    continue
                    
                if not rock_id:
                    print(f"⚠️ Spawn Generator: Rock at index {i} has no rock_id")
                    invalid_rocks += 1
                    continue
                    
                rock_by_name[rock_name] = r
                valid_rocks += 1
                
            except Exception as e:
                print(f"⚠️ Spawn Generator: Error processing rock at index {i}: {e}")
                invalid_rocks += 1
                continue
        
        print(f"✅ Spawn Generator: Created dictionary with {valid_rocks} valid rocks, {invalid_rocks} invalid")
        
        if not rock_by_name:
            print(f"❌ Spawn Generator: No valid rocks found for dictionary")
            return {}
            
        return rock_by_name
        
    except Exception as e:
        print(f"❌ Spawn Generator: Critical error creating rock dictionary: {e}")
        print(f"❌ Traceback:\n{traceback.format_exc()}")
        return {}


# -----------------------------------
# Dynamic spawn generation (around user)
# -----------------------------------
def generate_dynamic_spawn(user_lat: float, user_lng: float, zone: ZoneProfile) -> None:
    """
    Ensure at least MIN_NEARBY_SPAWNS within NEARBY_RADIUS_METERS of the user, spawning
    INSIDE the zone polygon. Respects cooldown and max_spawn_count.
    """
    try:
        print(f"🔍 Dynamic Spawn: Starting for zone {zone.zone_name}")
        now = datetime.utcnow()

        # Cooldown per zone
        last_time = last_spawn_times.get(zone.zone_name)
        if last_time and (now - last_time) < timedelta(minutes=zone.spawn_cooldown_minutes):
            print(f"⏳ Skipping {zone.zone_name} — cooldown active.")
            return

        # Count live spawns in zone
        total_live_in_zone = (
            RockSpawn.query.filter(
                RockSpawn.location_name == zone.zone_name,
                RockSpawn.expires_at > now,
            )
            .count()
        )

        # Count nearby to user
        nearby = RockSpawn.fetch_nearby_uncollected(user_id=None, lat=user_lat, lng=user_lng, radius_m=NEARBY_RADIUS_METERS)
        nearby_count = len(nearby)
        if nearby_count >= MIN_NEARBY_SPAWNS:
            print(f"✅ Enough nearby spawns ({nearby_count} ≥ {MIN_NEARBY_SPAWNS}), skip.")
            return

        # How many can/should we add?
        spawn_needed = MIN_NEARBY_SPAWNS - nearby_count
        free_slots = max(0, zone.max_spawn_count - total_live_in_zone)
        spawn_count = min(spawn_needed, free_slots)
        if spawn_count <= 0:
            print(f"🚫 Zone {zone.zone_name} full (max {zone.max_spawn_count}).")
            return

        # FIXED: Safer rock list handling
        print(f"🔍 Dynamic Spawn: Fetching rock list...")
        rock_list = get_all_rocks()
        
        if not rock_list:
            print(f"❌ Dynamic Spawn: No rocks found in database")
            return
            
        print(f"🔍 Dynamic Spawn: Found {len(rock_list)} rocks")
        
        # FIXED: Use safe dictionary creation
        rock_by_name = create_rock_by_name_dict(rock_list)
        if not rock_by_name:
            print(f"❌ Dynamic Spawn: Failed to create rock dictionary")
            return
        
        # Continue with weighted choices...
        print(f"🔍 Dynamic Spawn: Getting weighted rock choices...")
        choices = get_weighted_rock_choices(
            {"key_rock": zone.key_rock, "rock_type": zone.rock_type, "geological_name": zone.geological_name},
            rock_list,
            mode="dynamic",
        )
        if not choices:
            print(f"❌ No spawn choices for zone {zone.zone_name}")
            return

        print(f"✅ Dynamic Spawn: Got {len(choices)} rock choices")

        # Prevent collisions with existing live spawns in zone and this batch
        live_pts = [
            (s.latitude, s.longitude)
            for s in RockSpawn.query.filter(
                RockSpawn.location_name == zone.zone_name,
                RockSpawn.expires_at > now,
            ).all()
        ]
        used_points: List[Tuple[float, float]] = []

        def _too_close(lat: float, lng: float) -> bool:
            return any(haversine(lat, lng, a, b) < MIN_DISTANCE_METERS for a, b in used_points) or \
                   any(haversine(lat, lng, a, b) < MIN_DISTANCE_METERS for a, b in live_pts)

        new_spawns: List[RockSpawn] = []

        for i in range(spawn_count):
            print(f"🔍 Dynamic Spawn: Attempting spawn {i+1}/{spawn_count}")
            pt = _sample_point_near_user_in_zone(user_lat, user_lng, zone, max_radius_m=NEARBY_RADIUS_METERS)
            if not pt:
                print(f"⚠️ Dynamic Spawn: Could not find valid point for spawn {i+1}")
                continue
            spawn_lat, spawn_lng = pt

            if _too_close(spawn_lat, spawn_lng):
                print(f"⚠️ Dynamic Spawn: Point too close to existing spawn {i+1}")
                continue

            rock_name = random.choice(choices)
            rock = rock_by_name.get(rock_name)
            if not rock:
                print(f"⚠️ Dynamic Spawn: Rock {rock_name} not found in dictionary")
                continue

            expires_at = RockSpawn.generate_expiration(rock.rarity)
            new_spawns.append(
                RockSpawn(
                    rock_id=rock.rock_id,
                    latitude=spawn_lat,
                    longitude=spawn_lng,
                    location_name=zone.zone_name,
                    expires_at=expires_at,
                )
            )
            used_points.append((spawn_lat, spawn_lng))
            print(f"✅ Dynamic Spawn: Created spawn {i+1} with rock {rock_name}")

        if new_spawns:
            db.session.bulk_save_objects(new_spawns)
            db.session.commit()
            last_spawn_times[zone.zone_name] = now
            print(f"✅ Spawned {len(new_spawns)} rocks near user in {zone.zone_name}")
        else:
            print(f"❌ No spawns generated for {zone.zone_name}")
            
    except Exception as e:
        print(f"❌ Dynamic Spawn: Critical error in generate_dynamic_spawn: {e}")
        print(f"❌ Dynamic Spawn traceback:\n{traceback.format_exc()}")
        return


# -----------------------------------
# Static (zone-wide) spawn — cron/refresh
# -----------------------------------
def generate_spawn_for_zone(zone: ZoneProfile, count: int = 10) -> None:
    """
    Zone-wide spawn for cron/refresh:
      - Samples INSIDE the zone polygon (not just bbox)
      - Uses density to decide target count, capped by free slots
      - Avoids collisions with live spawns and this batch
      - Uses 'static' weights
    Note: `count` is kept for compatibility but actual target is density-based.
    """
    try:
        print(f"🔍 Static Spawn: Starting for zone {zone.zone_name}")
        now = datetime.utcnow()

        # Cooldown per zone
        last_time = last_spawn_times.get(zone.zone_name)
        if last_time and (now - last_time) < timedelta(minutes=zone.spawn_cooldown_minutes):
            print(f"⏳ Skipping {zone.zone_name} — cooldown active.")
            return

        # Live in zone
        existing_live = (
            RockSpawn.query.filter(
                RockSpawn.location_name == zone.zone_name,
                RockSpawn.expires_at > now,
            )
            .count()
        )
        if existing_live >= zone.max_spawn_count:
            print(f"🚫 Skipping {zone.zone_name} — already has {existing_live} active spawns (cap {zone.max_spawn_count}).")
            return

        # FIXED: Safer rock list handling
        print(f"🔍 Static Spawn: Fetching rock list...")
        rock_list = get_all_rocks()
        
        if not rock_list:
            print(f"❌ Static Spawn: No rocks found in database")
            return
            
        print(f"🔍 Static Spawn: Found {len(rock_list)} rocks")
        
        # FIXED: Use safe dictionary creation
        rock_by_name = create_rock_by_name_dict(rock_list)
        if not rock_by_name:
            print(f"❌ Static Spawn: Failed to create rock dictionary")
            return

        # Weighted choices (static mode)
        print(f"🔍 Static Spawn: Getting weighted rock choices...")
        choices = get_weighted_rock_choices(
            {"key_rock": zone.key_rock, "rock_type": zone.rock_type, "geological_name": zone.geological_name},
            rock_list,
            mode="static",
        )
        if not choices:
            print(f"❌ No spawn choices found for zone: {zone.zone_name}")
            return

        print(f"✅ Static Spawn: Got {len(choices)} rock choices")

        # Decide target by density; cap by free slots
        target_by_density = get_spawn_count_for_zone(zone)
        free_slots = max(0, zone.max_spawn_count - existing_live)
        target = max(0, min(target_by_density, free_slots))
        if target == 0:
            print(f"🚫 Zone {zone.zone_name} full (max {zone.max_spawn_count}).")
            return

        print(f"🔍 Static Spawn: Target {target} spawns (density: {target_by_density}, free slots: {free_slots})")

        # Avoid collisions with existing live spawns and this batch
        live_pts = [
            (s.latitude, s.longitude)
            for s in RockSpawn.query.filter(
                RockSpawn.location_name == zone.zone_name,
                RockSpawn.expires_at > now,
            ).all()
        ]
        used_points: List[Tuple[float, float]] = []

        def _too_close(lat: float, lng: float) -> bool:
            return any(haversine(lat, lng, a, b) < MIN_DISTANCE_METERS for a, b in used_points) or \
                   any(haversine(lat, lng, a, b) < MIN_DISTANCE_METERS for a, b in live_pts)

        # Gather spawn positions inside polygon
        spawn_points: List[Tuple[float, float]] = []
        tries = 0
        while len(spawn_points) < target and tries < target * 8:
            tries += 1
            pt = _sample_point_in_zone(zone)
            if not pt:
                continue
            lat, lng = pt
            if _too_close(lat, lng):
                continue
            spawn_points.append((lat, lng))

        if not spawn_points:
            print(f"❌ No legal spawn points for {zone.zone_name}")
            return

        print(f"✅ Static Spawn: Found {len(spawn_points)} valid spawn points")

        # Build and commit
        new_spawns: List[RockSpawn] = []
        for i, (lat, lng) in enumerate(spawn_points):
            rock_name = random.choice(choices)
            rock = rock_by_name.get(rock_name)
            if not rock:
                print(f"⚠️ Static Spawn: Rock {rock_name} not found in dictionary")
                continue
            expires_at = RockSpawn.generate_expiration(rock.rarity)
            new_spawns.append(
                RockSpawn(
                    rock_id=rock.rock_id,
                    latitude=lat,
                    longitude=lng,
                    location_name=zone.zone_name,
                    expires_at=expires_at,
                )
            )
            print(f"✅ Static Spawn: Created spawn {i+1} with rock {rock_name}")

        if new_spawns:
            db.session.bulk_save_objects(new_spawns)
            db.session.commit()
            last_spawn_times[zone.zone_name] = now
            print(f"✅ Spawned {len(new_spawns)} rocks in {zone.zone_name} (target {target})")
        else:
            print(f"❌ No spawns generated for {zone.zone_name}")
            
    except Exception as e:
        print(f"❌ Static Spawn: Critical error in generate_spawn_for_zone: {e}")
        print(f"❌ Static Spawn traceback:\n{traceback.format_exc()}")
        return


# -----------------------------------
# Spawn all zones (cron entry)
# -----------------------------------
def spawn_all_zones() -> None:
    """
    Spawn rocks for all zones, respecting density and each zone's cap.
    """
    try:
        print("\n🌍 Spawning rocks for all zones (respecting density & caps)...")
        zones = ZoneProfile.query.all()
        total = 0
        for zone in zones:
            before = datetime.utcnow()
            generate_spawn_for_zone(zone)  # density-based; ignores incoming count
            after = datetime.utcnow()
            print(f"⏱️ Finished {zone.zone_name} in {after - before}\n")
            total += 1
        print(f"🎉 Completed spawning for {total} zones.")
    except Exception as e:
        print(f"❌ Error in spawn_all_zones: {e}")
        print(f"❌ Traceback:\n{traceback.format_exc()}")