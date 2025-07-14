import random
from app.models import db
from app.entity.rock import Rock
from app.entity.rock_spawn import RockSpawn
from app.config.rock_spawn_zones import zone_profiles
from app.utils.spawn_logic import get_weighted_rock_choices, generate_grid_sample

def generate_spawn_for_zone(zone_name: str, count: int = 10):
    if zone_name not in zone_profiles:
        print(f"❌ Zone '{zone_name}' not found.")
        return

    zone = zone_profiles[zone_name]
    bounds = zone["bounds"]

    rock_list = Rock.query.all()
    choices = get_weighted_rock_choices(zone, rock_list)
    if not choices:
        print(f"❌ No spawn choices found for zone: {zone_name}")
        return

    spawn_points = generate_grid_sample(bounds, count)

    for lat, lng in spawn_points:
        rock_name = random.choice(choices)
        rock = next((r for r in rock_list if r.rock_name == rock_name), None)
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
        db.session.add(new_spawn)
        print(f"🪨 Spawned {rock_name} at ({lat:.5f}, {lng:.5f}) in {zone_name}")

    db.session.commit()
    print(f"✅ Spawned {len(spawn_points)} rocks in {zone_name}")
