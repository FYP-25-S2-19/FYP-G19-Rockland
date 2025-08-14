import random
from functools import lru_cache

# Cache rock list to avoid repeated DB queries
@lru_cache(maxsize=1)
def get_all_rocks():
    from app.entity.rock import Rock
    return Rock.query.all()


def get_weighted_rock_choices(zone_profile, rock_list=None, mode="static"):
    """
    Build a sampling pool (list of rock names) that enforces:
      1) bucket split: key / same-type / wildcard
      2) rarity split inside buckets: common/rare/legendary (independent of DB counts)
    Then your generators can still do: random.choice(pool)
    """

    # ---- Tunables ----
    # bucket splits
    if mode == "dynamic":
        P_KEY, P_SAME, P_WILD = 0.90, 0.07, 0.03
        RARITY_TARGETS = {"common": 0.85, "rare": 0.13, "legendary": 0.02}
    else:  # static
        P_KEY, P_SAME, P_WILD = 0.75, 0.20, 0.05
        RARITY_TARGETS = {"common": 0.80, "rare": 0.18, "legendary": 0.02}

    SAMPLE_SIZE = 150  # size of the synthesized pool; bigger = smoother

    def norm(s): return (s or "").strip().lower()

    key_rock_name = norm(zone_profile.get("key_rock"))
    rock_type = (zone_profile.get("rock_type") or "").strip()

    rock_list = rock_list or get_all_rocks()

    # Partition rocks
    by_rarity = lambda items: {
        "common":  [r for r in items if (r.rarity or "").lower() == "common"],
        "rare":    [r for r in items if (r.rarity or "").lower() == "rare"],
        "legendary": [r for r in items if (r.rarity or "").lower() == "legendary"],
    }

    key_obj = next((r for r in rock_list if norm(r.rock_name) == key_rock_name), None)
    same_type = [r for r in rock_list if r.rock_type == rock_type and r is not key_obj]
    wild_type = [r for r in rock_list if r.rock_type != rock_type]

    same_by_rar = by_rarity(same_type)
    wild_by_rar = by_rarity(wild_type)

    pool = []

    # 1) Key bucket
    key_k = max(0, int(SAMPLE_SIZE * P_KEY))
    if key_obj:
        pool += [key_obj.rock_name] * key_k
    else:
        # If key rock is missing, shove that share into same-type bucket
        P_SAME += P_KEY
        key_k = 0  # just for clarity

    # Helper to add rarity-controlled samples from a bucket
    def add_bucket(target_k: int, bucket_by_rarity: dict, fallback_names: list[str]):
        if target_k <= 0:
            return
        remaining = target_k
        for rar in ("common", "rare", "legendary"):
            k = int(round(target_k * RARITY_TARGETS[rar]))
            remaining -= k
            src = bucket_by_rarity.get(rar, [])
            if src:
                pool.extend(random.choices([r.rock_name for r in src], k=k))
        # distribute any rounding leftovers from 'remaining'
        # try to pull from common→rare→legendary order
        for rar in ("common", "rare", "legendary"):
            if remaining <= 0: break
            src = bucket_by_rarity.get(rar, [])
            if src:
                pool.append(random.choice([r.rock_name for r in src]))
                remaining -= 1
        # if bucket empty, fallback to provided names
        while remaining > 0 and fallback_names:
            pool.append(random.choice(fallback_names))
            remaining -= 1

    # 2) Same-type bucket (excluding key)
    same_k = max(0, int(SAMPLE_SIZE * P_SAME))
    add_bucket(same_k, same_by_rar, [key_obj.rock_name] * 1 if key_obj else [r.rock_name for r in wild_type] or [r.rock_name for r in rock_list])

    # 3) Wildcard bucket
    wild_k = max(0, int(SAMPLE_SIZE * P_WILD))
    add_bucket(wild_k, wild_by_rar, [r.rock_name for r in same_type] or ([key_obj.rock_name] if key_obj else [r.rock_name for r in rock_list]))

    # Safety: never empty
    if not pool:
        pool = [r.rock_name for r in rock_list] or ["_placeholder_"]

    return pool


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
