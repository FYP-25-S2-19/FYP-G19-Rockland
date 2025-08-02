from datetime import datetime
from sqlalchemy.orm import joinedload
from app.models import db
from app.utils.gcs import generate_signed_url


class TradeOffer(db.Model):
    __tablename__ = "trade_offer"

    trade_id = db.Column(db.Integer, primary_key=True)

    user_id_offerer = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    user_id_receiver = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=True)

    collection_id_offered = db.Column(db.Integer, db.ForeignKey("user_rock_collection.collection_id"), nullable=False)
    rock_id_requested = db.Column(db.Integer, db.ForeignKey("rock.rock_id"), nullable=True)
    collection_id_received = db.Column(db.Integer, db.ForeignKey("user_rock_collection.collection_id"), nullable=True)

    status = db.Column(db.String(20), nullable=False, default="Pending")  # "Pending", "Accepted", "Rejected"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    offerer = db.relationship("User", foreign_keys=[user_id_offerer])
    receiver = db.relationship("User", foreign_keys=[user_id_receiver])
    offered_collection = db.relationship("UserRockCollection", foreign_keys=[collection_id_offered])
    received_collection = db.relationship("UserRockCollection", foreign_keys=[collection_id_received])
    requested_rock = db.relationship("Rock", foreign_keys=[rock_id_requested])

    # --------------------------
    # Serialization
    # --------------------------
    def to_dict(self):
        """Minimal response (IDs only)"""
        return {
            "trade_id": self.trade_id,
            "user_id_offerer": self.user_id_offerer,
            "user_id_receiver": self.user_id_receiver,
            "collection_id_offered": self.collection_id_offered,
            "rock_id_requested": self.rock_id_requested,
            "collection_id_received": self.collection_id_received,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }

    def to_detailed_dict(self):
        """Detailed response with full rock details and signed URLs"""
        return {
            "trade_id": self.trade_id,
            "status": self.status,
            "created_at": self.created_at.isoformat(),

            "offerer": {
                "id": self.offerer.user_id,
                "username": self.offerer.username
            } if self.offerer else None,

            "receiver": {
                "id": self.receiver.user_id,
                "username": self.receiver.username
            } if self.receiver else None,

            # Rock the offerer WANTS (you give this)
            "youGive": {
                "rockName": self.requested_rock.rock_name if self.requested_rock else None,
                "rockImage": generate_signed_url(self.requested_rock.photo_url)
                    if self.requested_rock and self.requested_rock.photo_url else None,
                "type": self.requested_rock.rock_type if self.requested_rock else None,
                "rarity": self.requested_rock.rarity if self.requested_rock else None,
            } if self.requested_rock else None,

            # Rock the offerer is OFFERING (you receive this)
            "youReceive": {
                "rockName": self.offered_collection.rock.rock_name
                    if self.offered_collection and self.offered_collection.rock else None,
                "rockImage": self.offered_collection.signed_url
                    if self.offered_collection else None,
                "type": self.offered_collection.rock.rock_type
                    if self.offered_collection and self.offered_collection.rock else None,
                "rarity": self.offered_collection.rock.rarity
                    if self.offered_collection and self.offered_collection.rock else None,
            } if self.offered_collection and self.offered_collection.rock else None
        }

    # --------------------------
    # CRUD Methods
    # --------------------------
    @classmethod
    def create_offer(cls, data):
        new_offer = cls(**data)
        db.session.add(new_offer)
        db.session.commit()
        return new_offer

    @classmethod
    def get_all(cls):
        return cls.query.options(
            joinedload(cls.requested_rock),
            joinedload(cls.offered_collection).joinedload("rock"),
            joinedload(cls.offerer),
            joinedload(cls.receiver)
        ).all()

    @classmethod
    def get_by_id(cls, trade_id):
        return cls.query.options(
            joinedload(cls.requested_rock),
            joinedload(cls.offered_collection).joinedload("rock"),
            joinedload(cls.offerer),
            joinedload(cls.receiver)
        ).get(trade_id)

    @classmethod
    def get_by_offerer(cls, user_id):
        return cls.query.options(
            joinedload(cls.requested_rock),
            joinedload(cls.offered_collection).joinedload("rock"),
            joinedload(cls.offerer),
            joinedload(cls.receiver)
        ).filter_by(user_id_offerer=user_id).all()

    @classmethod
    def get_by_receiver(cls, user_id):
        return cls.query.options(
            joinedload(cls.requested_rock),
            joinedload(cls.offered_collection).joinedload("rock"),
            joinedload(cls.offerer),
            joinedload(cls.receiver)
        ).filter_by(user_id_receiver=user_id).all()

    @classmethod
    def accept_trade(cls, trade_id, receiver_id, collection_id_received):
        offer = cls.query.get(trade_id)
        if offer and offer.status == "Pending":
            offer.status = "Accepted"
            offer.user_id_receiver = receiver_id
            offer.collection_id_received = collection_id_received
            db.session.commit()
            return offer
        return None

    @classmethod
    def reject_trade(cls, trade_id):
        offer = cls.query.get(trade_id)
        if offer and offer.status == "Pending":
            offer.status = "Rejected"
            db.session.commit()
            return offer
        return None

    @classmethod
    def delete_trade(cls, trade_id):
        offer = cls.query.get(trade_id)
        if offer:
            db.session.delete(offer)
            db.session.commit()
            return True
        return False
