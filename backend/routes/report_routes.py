from flask import Blueprint, request, jsonify
from controllers.report_controller import ReportController
from utils.jwt_handler import token_required

report_bp = Blueprint('reports', __name__)

@report_bp.route('', methods=['POST'])
@token_required
def create_report(current_user):
    """
    Generate and save a new CBC report.
    """
    data = request.get_json() or {}
    res, status = ReportController.create_report(current_user, data)
    return jsonify(res), status

@report_bp.route('', methods=['GET'])
@token_required
def get_reports(current_user):
    """
    Retrieve all reports (supports filters and searching via query parameters).
    """
    res, status = ReportController.get_reports(current_user)
    return jsonify(res), status

@report_bp.route('/<int:report_id>', methods=['GET'])
@token_required
def get_report_by_id(current_user, report_id):
    """
    Get detailed analysis for a single report.
    """
    res, status = ReportController.get_report_by_id(current_user, report_id)
    return jsonify(res), status

@report_bp.route('/<int:report_id>', methods=['DELETE'])
@token_required
def delete_report(current_user, report_id):
    """
    Delete a specific report.
    """
    res, status = ReportController.delete_report(current_user, report_id)
    return jsonify(res), status
