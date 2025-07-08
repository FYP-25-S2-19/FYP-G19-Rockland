from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.trade_offer import TradeOffer

reject_trade_offer_bp = Blueprint("reject_trade_offer_bp", __name__)

@reject_trade_offer_bp.route("/api/trade/reject", methods=["POST"])
@permission_required('has_premium_permission')
def reject_trade_offer(current_user):
    data = request.get_json()

    success, code, message = TradeOffer.reject_offer(
        trade_id=data.get("trade_id"),
        user_id_receiver=current_user.user_id
    )

    return jsonify({"message": message}), code