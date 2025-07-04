# Updated Controller
from flask import Blueprint, request, jsonify
from app.entity.user import User
# from app.controller.authentication.permission_required import permission_required

update_user_blueprint = Blueprint('update_user', __name__)

class UpdateUserController:
    @update_user_blueprint.route('/api/users/update_user', methods=['POST'])
    # @permission_required('has_admin_permission')
    def update_user():
        updated_details = request.get_json()

        email = updated_details.get('email')
        new_password = updated_details.get('password')
        new_first_name = updated_details.get('first_name')
        new_last_name = updated_details.get('last_name')
        new_date_of_birth = updated_details.get('date_of_birth')
        new_contact_number = updated_details.get('contact_number')
        new_gender = updated_details.get('gender')
        new_region = updated_details.get('region')
        new_status = updated_details.get('status')

        success, status_code, message, updated_user = User.updateUserAccount(
            email=email,
            password=new_password,
            first_name=new_first_name,
            last_name=new_last_name,
            date_of_birth=new_date_of_birth,
            contact_number=new_contact_number,
            gender=new_gender,
            region=new_region,
            status=new_status
        )

        if success:
            return jsonify({
                "success": True, 
                "message": message,
                "user": updated_user.to_dict() if updated_user else None
            }), status_code
        else:
            return jsonify({
                "success": False, 
                "error": message
            }), status_code


