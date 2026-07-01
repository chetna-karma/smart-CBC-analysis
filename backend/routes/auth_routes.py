from flask import Blueprint, request, jsonify
from controllers.auth_controller import AuthController
from utils.jwt_handler import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Handle user registration (automatically signs user in).
    """
    data = request.get_json() or {}
    res, status = AuthController.register(data)
    return jsonify(res), status

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handle user login.
    """
    data = request.get_json() or {}
    res, status = AuthController.login(data)
    return jsonify(res), status

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    """
    Get current user profile stats and counts (protected).
    """
    res, status = AuthController.get_profile(current_user)
    return jsonify(res), status

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Update user profile name, email, or password (protected).
    """
    data = request.get_json() or {}
    res, status = AuthController.update_profile(current_user, data)
    return jsonify(res), status
