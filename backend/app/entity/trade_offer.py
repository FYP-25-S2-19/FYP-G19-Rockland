from app.models import db
from datetime import datetime
from app.utils.gcs import generate_signed_url
from app.entity.user_rock_collection import UserRockCollection

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

    collection_id_gained_by_offerer = db.Column(db.Integer, db.ForeignKey("user_rock_collection.collection_id"), nullable=True)
    collection_id_gained_by_receiver = db.Column(db.Integer, db.ForeignKey("user_rock_collection.collection_id"), nullable=True)

    # Relationships
    offerer = db.relationship("User", foreign_keys=[user_id_offerer])
    receiver = db.relationship("User", foreign_keys=[user_id_receiver])
    offered_collection = db.relationship("UserRockCollection", foreign_keys=[collection_id_offered])
    received_collection = db.relationship("UserRockCollection", foreign_keys=[collection_id_received])
    requested_rock = db.relationship("Rock", foreign_keys=[rock_id_requested])
    gained_by_offerer = db.relationship("UserRockCollection", foreign_keys=[collection_id_gained_by_offerer])
    gained_by_receiver = db.relationship("UserRockCollection", foreign_keys=[collection_id_gained_by_receiver])

    def to_dict(self):
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
    
    def to_detailed_dict(self, current_user_id=None):
        print(f"🧪 Serializing trade ID {self.trade_id}")
        print(f"  ➤ Offerer: {self.user_id_offerer}, Receiver: {self.user_id_receiver}")
        print(f"  ➤ Offered Collection ID: {self.collection_id_offered}")
        print(f"  ➤ Requested Rock ID: {self.rock_id_requested}")
        print(f"  ➤ Status: {self.status}")
        print(f"  ➤ Offered Collection: {self.offered_collection}")
        print(f"  ➤ Requested Rock: {self.requested_rock if hasattr(self, 'requested_rock') else 'N/A'}")
        print(f"  ➤ Offerer Relationship: {self.offerer}")
        print(f"  ➤ Receiver Relationship: {self.receiver}")

        is_my_offer = current_user_id == self.user_id_offerer
        result = {
            "trade_id": self.trade_id,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "offerer": {
                "id": self.offerer.user_id,
                "name": f"{self.offerer.first_name} {self.offerer.last_name}"
            } if self.offerer else None,
            "receiver": {
                "id": self.receiver.user_id,
                "name": f"{self.receiver.first_name} {self.receiver.last_name}"
            } if self.receiver else None,
            "youGive": None,
            "youReceive": None,
            "isMyOffer": is_my_offer
        }

        # === Pending Trade ===
        if self.status == "Pending":
            if not self.offered_collection or not self.requested_rock or not self.offerer:
                print(f"⚠️ Skipped null trade from to_detailed_dict (ID: {self.trade_id})")
                return None

            if is_my_offer:
                # You Give: Offered collection's rock
                rock = getattr(self.offered_collection, "rock", None)
                if not rock:
                    print(f"⚠️ offered_collection.rock is None for trade ID {self.trade_id}")
                    return None
                result["youGive"] = {
                    "rock_id": rock.rock_id,
                    "rockName": rock.rock_name,
                    "rockImage": generate_signed_url(rock.photo_url) if rock.photo_url else None
                }

                # You Receive: Requested rock
                result["youReceive"] = {
                    "rock_id": self.requested_rock.rock_id,
                    "rockName": self.requested_rock.rock_name,
                    "rockImage": generate_signed_url(self.requested_rock.photo_url) if self.requested_rock.photo_url else None
                }

            else:
                # Receiver's view before accepting
                result["youGive"] = {
                    "rock_id": self.requested_rock.rock_id,
                    "rockName": self.requested_rock.rock_name,
                    "rockImage": generate_signed_url(self.requested_rock.photo_url) if self.requested_rock.photo_url else None
                }

                rock = getattr(self.offered_collection, "rock", None)
                if not rock:
                    print(f"⚠️ offered_collection.rock is None for trade ID {self.trade_id}")
                    return None
                result["youReceive"] = {
                    "rock_id": rock.rock_id,
                    "rockName": rock.rock_name,
                    "rockImage": generate_signed_url(rock.photo_url) if rock.photo_url else None
                }

        # === Accepted Trade ===
        elif self.status == "Accepted":
            offerer_gain = self.gained_by_offerer
            receiver_gain = self.gained_by_receiver
            if is_my_offer:
                if offerer_gain and offerer_gain.rock:
                    result["youReceive"] = {
                        "rock_id": offerer_gain.rock.rock_id,
                        "rockName": offerer_gain.rock.rock_name,
                        "rockImage": generate_signed_url(offerer_gain.rock.photo_url) if offerer_gain.rock.photo_url else None
                    }
                if receiver_gain and receiver_gain.rock:
                    result["youGive"] = {
                        "rock_id": receiver_gain.rock.rock_id,
                        "rockName": receiver_gain.rock.rock_name,
                        "rockImage": generate_signed_url(receiver_gain.rock.photo_url) if receiver_gain.rock.photo_url else None
                    }
            else:
                if receiver_gain and receiver_gain.rock:
                    result["youReceive"] = {
                        "rock_id": receiver_gain.rock.rock_id,
                        "rockName": receiver_gain.rock.rock_name,
                        "rockImage": generate_signed_url(receiver_gain.rock.photo_url) if receiver_gain.rock.photo_url else None
                    }
                if offerer_gain and offerer_gain.rock:
                    result["youGive"] = {
                        "rock_id": offerer_gain.rock.rock_id,
                        "rockName": offerer_gain.rock.rock_name,
                        "rockImage": generate_signed_url(offerer_gain.rock.photo_url) if offerer_gain.rock.photo_url else None
                    }

        return result


    @classmethod
    def create_offer(cls, data):
        new_offer = cls(**data)
        db.session.add(new_offer)
        db.session.commit()
        return new_offer

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def get_by_id(cls, trade_id):
        return cls.query.get(trade_id)

    @classmethod
    def get_by_offerer(cls, user_id):
        return cls.query.filter_by(user_id_offerer=user_id).all()

    @classmethod
    def get_by_receiver(cls, user_id):
        return cls.query.filter_by(user_id_receiver=user_id).all()

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
