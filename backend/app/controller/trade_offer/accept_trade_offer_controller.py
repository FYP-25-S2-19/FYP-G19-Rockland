from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.trade_offer import TradeOffer

accept_trade_offer_bp = Blueprint("accept_trade_offer_bp", __name__)

@accept_trade_offer_bp.route("/api/trade/accept", methods=["POST"])
@permission_required('has_premium_permission')
def accept_trade_offer(current_user):
    data = request.get_json()

    success, code, message = TradeOffer.accept_offer(
        trade_id=data.get("trade_id"),
        user_id_receiver=current_user.user_id,
        collection_id_received=data.get("collection_id_received")
    )

    return jsonify({"message": message}), code