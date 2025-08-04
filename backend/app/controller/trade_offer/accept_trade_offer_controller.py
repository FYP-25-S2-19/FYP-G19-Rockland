from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.trade_offer import TradeOffer
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required
import traceback

accept_trade_offer_bp = Blueprint("accept_trade_offer", __name__, url_prefix="/trade-offer")

@accept_trade_offer_bp.route("/accept/<int:trade_id>", methods=["POST"])
@permission_required([])
def accept_trade_offer(trade_id, current_user=None):
    try:
        data = request.get_json()
        collection_id_received = data.get("collection_id_received")

        if not collection_id_received:
            return jsonify({"error": "Missing collection_id_received"}), 400

        offer = TradeOffer.query.get(trade_id)
        if not offer or offer.status != "Pending":
            return jsonify({"error": "Invalid or already processed trade offer"}), 404

        offered_collection = UserRockCollection.query.get(offer.collection_id_offered)
        received_collection = UserRockCollection.query.get(collection_id_received)

        if not offered_collection or not received_collection:
            return jsonify({"error": "Collection entries not found"}), 404

        # Backup info before deletion
        offered_rock_id = offered_collection.rock_id
        received_rock_id = received_collection.rock_id
        offerer_id = offer.user_id_offerer
        receiver_id = current_user.user_id

        # Break FK constraints by flushing nulls before deletion
        offer.collection_id_received = None
        offer.collection_id_offered = None
        offer.user_id_receiver = receiver_id
        offer.status = "Accepted"
        db.session.flush()  # Ensure DB applies the FK-null updates before deletions

        # Now safe to delete the linked collections
        db.session.delete(offered_collection)
        db.session.delete(received_collection)

        # Add exchanged rocks to new owners
        receiver_gain = UserRockCollection(
            user_id=receiver_id,
            rock_id=offered_rock_id,
            source="trade",
            trade_id=trade_id
        )
        offerer_gain = UserRockCollection(
            user_id=offerer_id,
            rock_id=received_rock_id,
            source="trade",
            trade_id=trade_id
        )

        db.session.add_all([receiver_gain, offerer_gain])
        db.session.flush()  # Makes sure we get their collection_id values

        # ✅ Save the gained collection IDs into the TradeOffer
        offer.collection_id_gained_by_receiver = receiver_gain.collection_id
        offer.collection_id_gained_by_offerer = offerer_gain.collection_id

        db.session.commit()

        return jsonify({
            "message": "Trade completed successfully",
            "offer": offer.to_detailed_dict(current_user_id=current_user.user_id)
        }), 200

    except Exception as e:
        traceback.print_exc()
        db.session.rollback()
        return jsonify({
            "error": "Something went wrong",
            "details": str(e)
        }), 500
