from flask import Blueprint, request, jsonify
from app.models import db
from app.entity.trade_offer import TradeOffer
from app.controller.authentication.permission_required import permission_required

accept_trade_offer_bp = Blueprint("accept_trade_offer", __name__, url_prefix="/trade-offer")

@accept_trade_offer_bp.route("/accept/<int:trade_id>", methods=["POST"])
@permission_required([])
def accept_trade_offer(trade_id, current_user=None):
    data = request.get_json()

    collection_id_received = data.get("collection_id_received")

    if not collection_id_received:
        return jsonify({"error": "Missing collection_id_received"}), 400

    offer = TradeOffer.query.get(trade_id)

    if not offer or offer.status != "Pending":
        return jsonify({"error": "Invalid or already processed trade offer"}), 404

    offer.user_id_receiver = current_user.user_id
    offer.collection_id_received = collection_id_received
    offer.status = "Accepted"
    db.session.commit()

    return jsonify({"message": "Trade offer accepted", "offer": offer.to_dict()}), 200
