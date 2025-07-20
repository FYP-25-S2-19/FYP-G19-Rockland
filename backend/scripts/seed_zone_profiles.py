import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models import db
from app.entity.zone_profile import ZoneProfile
from app.entity.import_all_entities import import_entities  # ✅ make sure this is imported

def seed_zones():
    zone_profiles = {
    "Bukit Timah": {
        "bounds": [(1.31, 103.75), (1.41, 103.83)],
        "key_rock": "Granite",
        "rock_type": "Igneous Rock",
        "geological_name": "Bukit Timah Granite Zone"
    },
    "Choa Chu Kang & Gombak": {
        "bounds": [(1.36, 103.74), (1.39, 103.78)],
        "key_rock": "Gabbro",
        "rock_type": "Igneous Rock",
        "geological_name": "Gombak Norite Zone"
    },
    "Jurong West": {
        "bounds": [(1.29, 103.66), (1.34, 103.73)],
        "key_rock": "Sandstone",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Jurong Sedimentary Zone"
    },
    "Tampines & Pasir Ris": {
        "bounds": [(1.31, 103.86), (1.41, 103.98)],
        "key_rock": "Gravel",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Old Alluvium Zone"
    },
    "Kallang & Marine Parade": {
        "bounds": [(1.30, 103.88), (1.41, 104.04)],
        "key_rock": "Marine Clay",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Kallang Formation Zone"
    },
    "Pulau Tekong": {
        "bounds": [(1.405, 104.03), (1.42, 104.06)],
        "key_rock": "Pebbly Sand",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Pulau Tekong Zone"
    },
    "Fort Canning & Clarke Quay": {
        "bounds": [(1.29, 103.84), (1.30, 103.86)],
        "key_rock": "Sandstone",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Fort Canning Boulder Zone"
    },
    "Seletar & Sajatak": {
        "bounds": [(1.39, 103.97), (1.405, 104.0)],
        "key_rock": "Quartzite",
        "rock_type": "Metamorphic Rock",
        "geological_name": "Sajatah Formation Zone"
    },
    "Changi North": {
        "bounds": [(1.39, 104.02), (1.40, 104.05)],
        "key_rock": "Tuff",
        "rock_type": "Igneous Rock",
        "geological_name": "Volcanic Tuff Zone"
    },
    "Pioneer & Joo Koon": {
        "bounds": [(1.315, 103.68), (1.325, 103.69)],
        "key_rock": "Kaolin Clay",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Huat Choe Clay Zone"
    },
    "Tuas Industrial Area": {
        "bounds": [(1.235, 103.59), (1.26, 103.66)],
        "key_rock": "Basalt",
        "rock_type": "Igneous Rock",
        "geological_name": "Tuas Industrial Zone"
    },
    "Sentosa & Southern Islands": {
        "bounds": [(1.22, 103.80), (1.26, 103.87)],
        "key_rock": "Limestone",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Southern Coastal Zone"
    },
    "Mandai Nature Reserve": {
        "bounds": [(1.42, 103.75), (1.47, 103.82)],
        "key_rock": "Schist",
        "rock_type": "Metamorphic Rock",
        "geological_name": "Mandai Northern Forest Zone"
    },
    "Changi Airport & East Reclamation": {
        "bounds": [(1.38, 104.06), (1.42, 104.10)],
        "key_rock": "Coral Sand",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Changi Aviation & Reclamation Zone"
    },
    "West Coast & Pandan": {
        "bounds": [(1.29, 103.69), (1.31, 103.76)],
        "key_rock": "Mudstone",
        "rock_type": "Sedimentary Rock",
        "geological_name": "West Coast & Pandan Zone"
    },
    "Pulau Ubin": {
        "bounds": [(1.405, 103.97), (1.42, 104.03)],
        "key_rock": "Granite",
        "rock_type": "Igneous Rock",
        "geological_name": "Ubin Granite Zone"
    },
    "Yishun & Sembawang": {
        "bounds": [(1.42, 103.81), (1.45, 103.84)],
        "key_rock": "Granite",
        "rock_type": "Igneous Rock",
        "geological_name": "Northern Granite Zone"
    },
    "Ang Mo Kio & Bishan": {
        "bounds": [(1.35, 103.83), (1.37, 103.85)],
        "key_rock": "Granite",
        "rock_type": "Igneous Rock",
        "geological_name": "Central Highland Granite Zone"
    },
    "Hougang & Serangoon": {
        "bounds": [(1.36, 103.88), (1.38, 103.91)],
        "key_rock": "Marine Clay",
        "rock_type": "Sedimentary Rock",
        "geological_name": "Northeast Marine Zone"
    }
}


    for name, data in zone_profiles.items():
        exists = ZoneProfile.query.filter_by(zone_name=name).first()
        if not exists:
            zone_data = {
                "zone_name": name,
                "geological_name": data["geological_name"],
                "rock_type": data["rock_type"],
                "key_rock": data["key_rock"],
                "lat_min": data["bounds"][0][0],
                "lng_min": data["bounds"][0][1],
                "lat_max": data["bounds"][1][0],
                "lng_max": data["bounds"][1][1],
            }
            new_zone = ZoneProfile(**zone_data)
            db.session.add(new_zone)
    db.session.commit()
    print("✅ Zone profiles seeded.")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        import_entities()  # ✅ ensures all relationships work
        seed_zones()
