from flask import Blueprint, jsonify
from controllers.dashboard_controller import DashboardController
from utils.jwt_handler import token_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    """
    Get aggregated dashboard stats for the authenticated user.
    """
    res, status = DashboardController.get_stats(current_user)
    return jsonify(res), status
