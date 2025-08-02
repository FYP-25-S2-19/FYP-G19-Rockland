from flask import Blueprint, jsonify, request
from app.entity.trade_offer import TradeOffer
from app.entity.user import User
from app.entity.rock import Rock
from app.entity.user_rock_collection import UserRockCollection
from app.controller.authentication.permission_required import permission_required

get_trade_offer_bp = Blueprint("get_trade_offer", __name__, url_prefix="/trade-offer")

@get_trade_offer_bp.route("/<int:trade_id>", methods=["GET"])
@permission_required([])
def get_trade_offer_by_id(trade_id, *args, current_user=None, **kwargs):
    print(f"📥 Fetching trade offer for ID: {trade_id}")
    offer = TradeOffer.query.get(trade_id)
    if not offer or offer.status != "Pending":
        return jsonify({"error": "Trade not found"}), 404

    offerer = User.query.get(offer.user_id_offerer)
    if not offerer:
        return jsonify({"error": "Offerer not found"}), 404

    requested_rock = Rock.query.get(offer.rock_id_requested)
    given_collection = UserRockCollection.query.get(offer.collection_id_offered)
    given_rock = Rock.query.get(given_collection.rock_id) if given_collection else None

    if not requested_rock or not given_rock:
        return jsonify({"error": "Missing rock data"}), 404

    trade_data = {
        "id": offer.trade_id,
        "youGive": {
            "rockName": requested_rock.rock_name,
            "rockImage": requested_rock.photo_url,
            "type": requested_rock.rock_type,
            "rarity": requested_rock.rarity,
        },
        "youReceive": {
            "rockName": given_rock.rock_name,
            "rockImage": given_rock.photo_url,
            "type": given_rock.rock_type,
            "rarity": given_rock.rarity,
        },
        "offererName": f"{offerer.first_name} {offerer.last_name}",
    }

    return jsonify(trade_data), 200

@get_trade_offer_bp.route("/all", methods=["GET"])
@permission_required([])

def get_all_trade_offers(*args, current_user=None, **kwargs):
    offers = TradeOffer.query.filter(
    TradeOffer.status == "Pending",
    TradeOffer.user_id_offerer != current_user.user_id  # ✅ Exclude current user's own offers
    ).order_by(TradeOffer.created_at.desc()).all()
    
    offer_list = []
    for offer in offers:
        # Rock requested from receiver
        requested_rock = Rock.query.get(offer.rock_id_requested)
        
        # Rock given by offerer (their own)
        given_collection = UserRockCollection.query.get(offer.collection_id_offered)
        given_rock = Rock.query.get(given_collection.rock_id) if given_collection else None

        offerer = User.query.get(offer.user_id_offerer)

        if not requested_rock or not given_rock or not offerer:
            continue

        offer_list.append({
            "id": offer.trade_id,
            "traderName": f"{offerer.first_name} {offerer.last_name}",
            "traderRockCount": len(offerer.rock_collection),
            "traderJoinDate": offerer.created_at.strftime("%b %Y") if hasattr(offerer, "created_at") else "Unknown",
            "youGive": {
                "rockName": requested_rock.rock_name,
                "rockImage": requested_rock.photo_url,
                "type": requested_rock.rock_type,
                "rarity": requested_rock.rarity,
            },
            "youReceive": {
                "rockName": given_rock.rock_name,
                "rockImage": given_rock.photo_url,
                "type": given_rock.rock_type,
                "rarity": given_rock.rarity,
            },
            "isMyOffer": offer.user_id_offerer == current_user.user_id
        })

    return jsonify(offer_list), 200

@get_trade_offer_bp.route("/my", methods=["GET"])

@permission_required([])

def get_my_trade_offers(*args, current_user=None, **kwargs):
    offers = TradeOffer.query.filter_by(user_id_offerer=current_user.user_id).order_by(TradeOffer.created_at.desc()).all()
    
    offer_list = []
    for offer in offers:
        requested_rock = Rock.query.get(offer.rock_id_requested)
        given_collection = UserRockCollection.query.get(offer.collection_id_offered)
        given_rock = Rock.query.get(given_collection.rock_id) if given_collection else None

        if not requested_rock or not given_collection or not given_rock:
            print("⚠️ Skipping offer due to missing data:", {
            "trade_id": offer.trade_id,
            "requested_rock": bool(requested_rock),
            "given_collection": bool(given_collection),
            "given_rock": bool(given_rock)
            })
            continue

        offer_list.append({
            "id": offer.trade_id,
            "traderName": f"{current_user.first_name} {current_user.last_name}",
            "traderRockCount": len(current_user.rock_collection),
            "traderJoinDate": current_user.created_at.strftime("%b %Y") if hasattr(current_user, "created_at") else "Unknown",
            "youGive": {
                "rockName": requested_rock.rock_name,
                "rockImage": requested_rock.photo_url,
                "type": requested_rock.rock_type,
                "rarity": requested_rock.rarity,
            },
            "youReceive": {
                "rockName": given_rock.rock_name,
                "rockImage": given_rock.photo_url,
                "type": given_rock.rock_type,
                "rarity": given_rock.rarity,
            },
            "isMyOffer": True
        })

    return jsonify(offer_list), 200
