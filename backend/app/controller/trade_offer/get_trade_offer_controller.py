from flask import Blueprint, jsonify, request
from app.entity.trade_offer import TradeOffer
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required
from sqlalchemy.orm import joinedload

get_trade_offer_bp = Blueprint("get_trade_offer", __name__, url_prefix="/trade-offer")


@get_trade_offer_bp.route("/<int:trade_id>", methods=["GET"])
@permission_required([])
def get_trade_offer_by_id(trade_id, current_user=None, **kwargs):
    print(f"📥 Fetching trade offer for ID: {trade_id}")

    offer = TradeOffer.query.options(
        joinedload(TradeOffer.offered_collection).joinedload(UserRockCollection.rock),
        joinedload(TradeOffer.requested_rock),
        joinedload(TradeOffer.offerer),
        joinedload(TradeOffer.receiver)
    ).get(trade_id)

    if not offer or offer.status != "Pending":
        return jsonify({"error": "Trade not found"}), 404

    try:
        detailed = offer.to_detailed_dict(current_user_id=current_user.user_id)
        if detailed is None:
            print(f"⚠️ to_detailed_dict returned None for trade {trade_id}")
            return jsonify({"error": "Invalid trade structure"}), 500

        return jsonify(detailed), 200
    except Exception as e:
        print(f"❌ Error in to_detailed_dict for trade {trade_id}: {e}")
        return jsonify({"error": "Failed to serialize trade offer"}), 500


@get_trade_offer_bp.route("/all", methods=["GET"])
@permission_required([])
def get_all_trade_offers(current_user=None, **kwargs):
    offers = TradeOffer.query.options(
        joinedload(TradeOffer.offered_collection).joinedload(UserRockCollection.rock),
        joinedload(TradeOffer.requested_rock),
        joinedload(TradeOffer.offerer),
        joinedload(TradeOffer.receiver),
        joinedload(TradeOffer.gained_by_offerer).joinedload(UserRockCollection.rock),
        joinedload(TradeOffer.gained_by_receiver).joinedload(UserRockCollection.rock),
    ).filter(
        TradeOffer.status == "Pending",
        TradeOffer.user_id_offerer != current_user.user_id
    ).order_by(TradeOffer.created_at.desc()).all()

    offer_list = []
    for offer in offers:
        if offer.status == "Accepted":
            print("👉 Checking gained_by fields:", offer.gained_by_offerer, offer.gained_by_receiver)
        try:
            detailed = offer.to_detailed_dict(current_user_id=current_user.user_id)
            if detailed:
                offer_list.append(detailed)
            else:
                print(f"⚠️ Skipped null trade from to_detailed_dict (ID: {offer.trade_id})")
        except Exception as e:
            print(f"❌ Skipping trade {getattr(offer, 'trade_id', 'Unknown')} due to error: {e}")

    print(f"✅ Final filtered trade list length: {len(offer_list)}")
    return jsonify(offer_list), 200


@get_trade_offer_bp.route("/my", methods=["GET"])
@permission_required([])
def get_my_trade_offers(current_user=None, **kwargs):
    offers = TradeOffer.query.options(
        joinedload(TradeOffer.offered_collection).joinedload(UserRockCollection.rock),
        joinedload(TradeOffer.requested_rock),
        joinedload(TradeOffer.offerer),
        joinedload(TradeOffer.receiver),
        joinedload(TradeOffer.gained_by_offerer).joinedload(UserRockCollection.rock),
        joinedload(TradeOffer.gained_by_receiver).joinedload(UserRockCollection.rock),
    ).filter_by(
        user_id_offerer=current_user.user_id
    ).order_by(TradeOffer.created_at.desc()).all()

    offer_list = []
    for offer in offers:
        if offer.status == "Accepted":
            print("👉 Checking gained_by fields:", offer.gained_by_offerer, offer.gained_by_receiver)
        try:
            detailed = offer.to_detailed_dict(current_user_id=current_user.user_id)
            if detailed:
                offer_list.append(detailed)
            else:
                print(f"⚠️ Skipped null trade from to_detailed_dict (ID: {offer.trade_id})")
        except Exception as e:
            print(f"❌ Skipping trade {getattr(offer, 'trade_id', 'Unknown')} due to error: {e}")

    print(f"✅ My trades fetched: {len(offer_list)}")
    return jsonify(offer_list), 200
