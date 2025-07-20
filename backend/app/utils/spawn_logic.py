import random
from functools import lru_cache

# Optional: Cache rock list if it doesn't change often (invalidate manually on add/update)
@lru_cache(maxsize=1)
def get_all_rocks():
    from app.entity.rock import Rock
    return Rock.query.all()

def get_weighted_rock_choices(zone_profile, rock_list=None):
    """
    Generate a list of weighted rock names for a given zone.
    
    Args:
        zone_profile (dict): {
            "key_rock": str,
            "rock_type": str,
            ...
        }
        rock_list (List[Rock], optional): If not provided, will use get_all_rocks()
    
    Returns:
        List[str]: Weighted list of rock names to randomly choose from.
    """
    key_rock = zone_profile["key_rock"]
    rock_type = zone_profile["rock_type"]

    rock_list = rock_list or get_all_rocks()
    rocks_of_type = [r for r in rock_list if r.rock_type == rock_type]
    key_rock_exists = any(r.rock_name == key_rock for r in rock_list)

    choices = []

    if key_rock_exists:
        # 65% key rock, 25% other same-type, 10% random other-type
        choices += [key_rock] * 75
        others = [r.rock_name for r in rocks_of_type if r.rock_name != key_rock]
        if others:
            choices += random.choices(others, k=20)
        else:
            choices += [key_rock] * 25  # fallback
        wildcard_pool = [r.rock_name for r in rock_list if r.rock_type != rock_type]
        if wildcard_pool:
            choices += random.choices(wildcard_pool, k=5)
    else:
        type_rocks = [r.rock_name for r in rocks_of_type]
        if not type_rocks:
            return []
        choices += random.choices(type_rocks, k=100)

    return choices


def generate_grid_sample(bounds, num_points):
    """
    Generate a grid of lat/lng points with slight randomness.
    
    Args:
        bounds (tuple): ((lat_min, lng_min), (lat_max, lng_max))
        num_points (int): Desired number of points

    Returns:
        List[Tuple[float, float]]
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

            # Add randomness
            lat = base_lat + random.uniform(0, lat_step)
            lng = base_lng + random.uniform(0, lng_step)
            points.append((lat, lng))

    return points
