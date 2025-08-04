# scripts/refresh_spawn.py
from datetime import datetime, UTC
from app import create_app
from app.models import db
from app.entity.rock_spawn import RockSpawn
from app.entity.zone_profile import ZoneProfile
from app.utils.spawn_generator import spawn_all_zones
from app.entity.import_all_entities import import_entities

def delete_expired_spawns():
    """Delete expired rock spawns from the database."""
    now = datetime.now(UTC)
    try:
        expired = RockSpawn.query.filter(RockSpawn.expires_at < now)
        count = expired.count()
        expired.delete(synchronize_session=False)
        db.session.commit()
        print(f"🧹 Deleted {count} expired spawns.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Failed to delete expired spawns: {e}")

def run_refresh_spawn():
    """Run full rock spawn refresh logic (for controller & cron script)."""
    app = create_app()
    with app.app_context():
        import_entities()
        delete_expired_spawns()
        spawn_all_zones()
        print("✅ Rock spawn refresh completed for all zones.")
        return {"status": "success", "message": "Rock spawn refresh completed."}

# For CLI execution
if __name__ == "__main__":
    run_refresh_spawn()
