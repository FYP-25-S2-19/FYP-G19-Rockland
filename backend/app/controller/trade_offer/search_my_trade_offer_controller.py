from flask import Blueprint, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.trade_offer import TradeOffer

search_my_trade_offer_bp = Blueprint("search_my_trade_offer_bp", __name__)

@search_my_trade_offer_bp.route("/api/trade/mine", methods=["GET"])
@permission_required('has_premium_permission')
def search_my_trade_offers(current_user):
    success, code, message, data = TradeOffer.search_my_trade_offers(current_user.user_id)
    if success:
        return jsonify({"message": message, "offers": data}), code
    return jsonify({"message": message}), code
