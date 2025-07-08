from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.trade_offer import TradeOffer

create_trade_offer_bp = Blueprint("create_trade_offer_bp", __name__)

@create_trade_offer_bp.route("/api/trade/create", methods=["POST"])
@permission_required('has_premium_permission')
def create_trade_offer(current_user):
    data = request.get_json()

    success, code, message, new_offer = TradeOffer.create_offer(
        user_id_offerer=current_user.user_id,
        collection_id_offered=data.get("collection_id_offered"),
        rock_id_requested=data.get("rock_id_requested")
    )

    if success:
        return jsonify({"message": message, "offer": new_offer.to_dict()}), code
    return jsonify({"message": message}), code