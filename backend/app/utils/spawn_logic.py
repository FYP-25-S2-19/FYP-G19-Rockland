import random

def get_weighted_rock_choices(zone_profile, rock_list):
    key_rock = zone_profile["key_rock"]
    rock_type = zone_profile["rock_type"]

    # List of rocks matching the type
    rocks_of_type = [r for r in rock_list if r.rock_type == rock_type]
    key_rock_exists = any(r.rock_name == key_rock for r in rock_list)

    choices = []

    if key_rock_exists:
        choices += [key_rock] * 65
        others = [r.rock_name for r in rocks_of_type if r.rock_name != key_rock]
        if others:
            choices += random.choices(others, k=25)
        else:
            choices += [key_rock] * 25

        wildcard_pool = [r.rock_name for r in rock_list if r.rock_type != rock_type]
        if wildcard_pool:
            choices += random.choices(wildcard_pool, k=10)
    else:
        type_rocks = [r.rock_name for r in rocks_of_type]
        if not type_rocks:
            return []
        choices += random.choices(type_rocks, k=100)

    return choices


def generate_grid_sample(bounds, num_points):
    lat_min, lng_min = bounds[0]
    lat_max, lng_max = bounds[1]

    sqrt_n = int(num_points**0.5) + 1
    lat_step = (lat_max - lat_min) / sqrt_n
    lng_step = (lng_max - lng_min) / sqrt_n

    points = []

    for i in range(sqrt_n):
        for j in range(sqrt_n):
            if len(points) >= num_points:
                break
            base_lat = lat_min + i * lat_step
            base_lng = lng_min + j * lng_step

            # Add random offset within the grid cell
            lat = base_lat + random.uniform(0, lat_step)
            lng = base_lng + random.uniform(0, lng_step)
            points.append((lat, lng))

    return points
