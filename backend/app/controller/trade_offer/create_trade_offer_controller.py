from flask import Blueprint, request, jsonify
from app.controller.authentication.permission_required import permission_required
from app.entity.trade_offer import TradeOffer

create_trade_offer_bp = Blueprint("create_trade_offer_bp", __name__)

@create_trade_offer_bp.route("/api/trade/create", methods=["POST"])
@permission_required('has_premium_permission')
def create_trade_offer(current_user):
    data = request.get_json()

    offer_data = {
        "user_id_offerer": current_user.user_id,
        "collection_id_offered": data.get("collection_id_offered"),
        "rock_id_requested": data.get("rock_id_requested"),
    }

    try:
        new_offer = TradeOffer.create_offer(offer_data)
        return jsonify({
            "message": "Trade offer created successfully.",
            "offer": new_offer.to_dict()
        }), 201
    except Exception as e:
        return jsonify({
            "message": "Failed to create trade offer.",
            "details": str(e)
        }), 400