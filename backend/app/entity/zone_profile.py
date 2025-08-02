# 📄 zone_profile.py (entity)

from app.models import db

class ZoneProfile(db.Model):
    __tablename__ = "zone_profile"

    zone_id = db.Column(db.Integer, primary_key=True)
    zone_name = db.Column(db.String(100), nullable=False, unique=True)
    geological_name = db.Column(db.String(255), nullable=False)
    rock_type = db.Column(db.String(100), nullable=False)
    key_rock = db.Column(db.String(100), nullable=False)
    lat_min = db.Column(db.Float, nullable=False)
    lat_max = db.Column(db.Float, nullable=False)
    lng_min = db.Column(db.Float, nullable=False)
    lng_max = db.Column(db.Float, nullable=False)

    # NEW FIELDS
    density = db.Column(db.String(20), nullable=False, default="medium")  
    spawn_cooldown_minutes = db.Column(db.Integer, nullable=False, default=15)
    max_spawn_count = db.Column(db.Integer, nullable=False, default=15)

    def to_dict(self):
        return {
            "zone_id": self.zone_id,
            "zone_name": self.zone_name,
            "geological_name": self.geological_name,
            "rock_type": self.rock_type,
            "key_rock": self.key_rock,
            "lat_min": self.lat_min,  # Fixed: Return individual coordinates
            "lat_max": self.lat_max,
            "lng_min": self.lng_min,
            "lng_max": self.lng_max,
            "density": self.density,
            "spawn_cooldown_minutes": self.spawn_cooldown_minutes,
            "max_spawn_count": self.max_spawn_count
        }

    def contains(self, lat, lng):
        return self.lat_min <= lat <= self.lat_max and self.lng_min <= lng <= self.lng_max

    @classmethod
    def get_zone_by_coordinates(cls, lat, lng):
        return cls.query.filter(
            cls.lat_min <= lat,
            cls.lat_max >= lat,
            cls.lng_min <= lng,
            cls.lng_max >= lng
        ).first()

    # CRUD Methods
    @classmethod
    def create(cls, data):
        try:
            new_zone = cls(**data)
            db.session.add(new_zone)
            db.session.commit()
            return True, 201, "Zone created", new_zone
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Create error: {str(e)}", None

    @classmethod
    def update(cls, zone_id, data):
        try:
            zone = cls.query.get(zone_id)
            if not zone:
                return False, 404, "Zone not found", None
            for key, value in data.items():
                setattr(zone, key, value)
            db.session.commit()
            return True, 200, "Zone updated", zone
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Update error: {str(e)}", None

    @classmethod
    def delete(cls, zone_id):
        try:
            zone = cls.query.get(zone_id)
            if not zone:
                return False, 404, "Zone not found"
            db.session.delete(zone)
            db.session.commit()
            return True, 200, "Zone deleted"
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Delete error: {str(e)}"

    @classmethod
    def search(cls, keyword):
        try:
            zones = cls.query.filter(
                cls.zone_name.ilike(f"%{keyword}%") |
                cls.geological_name.ilike(f"%{keyword}%") |
                cls.rock_type.ilike(f"%{keyword}%") |
                cls.key_rock.ilike(f"%{keyword}%")
            ).all()
            return True, 200, "Zones found", [z.to_dict() for z in zones]
        except Exception as e:
            return False, 500, f"Search error: {str(e)}", []

    # Admin Management Methods - MOVED INSIDE CLASS
    @classmethod
    def create_zone(cls, data):
        """Create zone - matches controller expectation"""
        try:
            # Validation
            required_fields = ['zone_name', 'geological_name', 'rock_type', 'key_rock', 
                              'lat_min', 'lat_max', 'lng_min', 'lng_max']
            for field in required_fields:
                if not data.get(field):
                    return False, 400, f"{field} is required", None
            
            # Check for duplicate zone name
            existing = cls.query.filter_by(zone_name=data['zone_name']).first()
            if existing:
                return False, 400, "Zone name already exists", None
                
            new_zone = cls(**data)
            db.session.add(new_zone)
            db.session.commit()
            return True, 201, "Zone created successfully", new_zone.to_dict()
        except Exception as e:
            db.session.rollback()
            return False, 500, f"Create error: {str(e)}", None

    @classmethod
    def getAllZonesForAdmin(cls):
        """Get all zones for admin view"""
        try:
            zones = cls.query.order_by(cls.zone_id.desc()).all()
            zones_data = [zone.to_dict() for zone in zones]
            return zones_data, 200
        except Exception as e:
            print(f"Error fetching zones for admin: {e}")
            return None, 500

    @classmethod
    def getZoneById(cls, zone_id):
        """Get zone by ID for admin view"""
        try:
            zone = cls.query.get(zone_id)
            if not zone:
                return None, 404, "Zone not found"
            
            return zone.to_dict(), 200, "Zone fetched successfully"
        except Exception as e:
            print(f"Error fetching zone by ID: {e}")
            return None, 500, f"Error fetching zone: {str(e)}"

    @classmethod
    def delete_zone(cls, zone_id):
        """Delete zone - matches existing delete controller expectation"""
        try:
            zone = cls.query.get(zone_id)
            if not zone:
                return False, 404, "Zone not found"
            
            db.session.delete(zone)
            db.session.commit()
            return True, 200, "Zone deleted successfully"
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting zone: {e}")
            return False, 500, f"Delete error: {str(e)}"

    @classmethod
    def deleteZoneById(cls, zone_id):
        """Delete zone by ID for admin - alternative method name"""
        return cls.delete_zone(zone_id)