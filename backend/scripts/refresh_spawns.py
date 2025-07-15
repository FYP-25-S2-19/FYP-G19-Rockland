from datetime import datetime, UTC
from app import create_app
from app.models import db
from app.entity.rock_spawn import RockSpawn
from app.utils.spawn_generator import generate_spawn_for_zone
from app.config.rock_spawn_counts import zone_spawn_counts
from app.entity.import_all_entities import import_entities  # ✅ Register all models

def delete_expired_spawns():
    """Delete expired rock spawns from DB"""
    now = datetime.now(UTC)
    expired = RockSpawn.query.filter(RockSpawn.expires_at < now)
    count = expired.count()
    expired.delete()
    db.session.commit()
    print(f"🧹 Deleted {count} expired spawns.")

def main():
    """Run full rock spawn refresh"""
    app = create_app()
    with app.app_context():
        import_entities()  # ✅ Ensure all models are registered
        delete_expired_spawns()
        for zone_name, count in zone_spawn_counts.items():
            generate_spawn_for_zone(zone_name, count=count)
        print("✅ Rock spawn refresh completed for all zones.")

if __name__ == "__main__":
    main()
