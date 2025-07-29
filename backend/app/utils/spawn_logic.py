import random
from functools import lru_cache

# Cache rock list to avoid repeated DB queries
@lru_cache(maxsize=1)
def get_all_rocks():
    from app.entity.rock import Rock
    return Rock.query.all()


def get_weighted_rock_choices(zone_profile, rock_list=None, mode="static"):
    """
    Generate a weighted list of rock names for spawning in a zone.

    Modes:
    - static (zone-wide cron spawn): 75% key rock, 20% same-type, 5% wildcard
    - dynamic (on-demand near user): 90% key rock, 7% same-type, 3% wildcard
    """

    key_rock = zone_profile["key_rock"]
    rock_type = zone_profile["rock_type"]

    rock_list = rock_list or get_all_rocks()
    rocks_of_type = [r for r in rock_list if r.rock_type == rock_type]
    key_rock_exists = any(r.rock_name == key_rock for r in rock_list)

    choices = []

    # Determine weighting based on mode
    if mode == "dynamic":
        key_weight = 90
        same_type_weight = 7
        wildcard_weight = 3
    else:  # static
        key_weight = 75
        same_type_weight = 20
        wildcard_weight = 5

    if key_rock_exists:
        # Key rock weight
        choices += [key_rock] * key_weight

        # Same-type rocks (excluding key rock)
        others = [r.rock_name for r in rocks_of_type if r.rock_name != key_rock]
        if others:
            choices += random.choices(others, k=same_type_weight)
        else:
            choices += [key_rock] * same_type_weight  # fallback

        # Wildcard (different types)
        wildcard_pool = [r.rock_name for r in rock_list if r.rock_type != rock_type]
        if wildcard_pool:
            choices += random.choices(wildcard_pool, k=wildcard_weight)

    else:
        # No key rock → fallback to all same-type
        type_rocks = [r.rock_name for r in rocks_of_type]
        if not type_rocks:
            return []
        choices += random.choices(type_rocks, k=100)

    return choices


def generate_grid_sample(bounds, num_points):
    """
    Generate randomized grid points within zone bounds.
    """
    lat_min, lng_min = bounds[0]
    lat_max, lng_max = bounds[1]

    sqrt_n = int(num_points ** 0.5) + 1
    lat_step = (lat_max - lat_min) / sqrt_n
    lng_step = (lng_max - lng_min) / sqrt_n

    points = []

    for i in range(sqrt_n):
        for j in range(sqrt_n):
            if len(points) >= num_points:
                break
            base_lat = lat_min + i * lat_step
            base_lng = lng_min + j * lng_step

            # Add randomness for natural distribution
            lat = base_lat + random.uniform(0, lat_step)
            lng = base_lng + random.uniform(0, lng_step)
            points.append((lat, lng))

    return points
