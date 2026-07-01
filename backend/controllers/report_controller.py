from models import Report
from services.cbc_analyzer import CBCAnalyzer
from utils.validators import validate_cbc_inputs
from database import db
from flask import request

class ReportController:
    @staticmethod
    def create_report(user_payload, data):
        """
        Validate input, perform blood parameter analysis, and save the report.
        """
        user_id = user_payload.get('sub')
        errors = validate_cbc_inputs(data)
        if errors:
            return {'message': 'Validation failed.', 'errors': errors}, 400
            
        try:
            hemoglobin = float(data.get('hemoglobin'))
            wbc = float(data.get('wbc'))
            platelets = float(data.get('platelets'))
            rbc = float(data.get('rbc'))
            mcv = float(data.get('mcv'))
        except (ValueError, TypeError):
            return {'message': 'Parameters must be numeric values.'}, 400
            
        # Execute analysis logic
        analysis = CBCAnalyzer.analyze(hemoglobin, wbc, platelets, rbc, mcv)
        
        # Instantiate Report model
        new_report = Report(
            user_id=user_id,
            hemoglobin=hemoglobin,
            wbc=wbc,
            platelets=platelets,
            rbc=rbc,
            mcv=mcv,
            risk_score=analysis['risk_score'],
            summary=analysis['summary'],
            recommendations=analysis['recommendations']
        )
        
        try:
            db.session.add(new_report)
            db.session.commit()
            
            report_dict = new_report.to_dict()
            report_dict['analysis'] = analysis['parameters']
            
            return {
                'message': 'CBC analysis generated and stored successfully.',
                'report': report_dict
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f"Database save error: {str(e)}"}, 500

    @staticmethod
    def get_reports(user_payload):
        """
        Retrieve all reports for the user, with searching, filtering, and sorting support.
        """
        user_id = user_payload.get('sub')
        
        # Parse query params
        search_query = request.args.get('search', '').strip()
        risk_filter = request.args.get('risk', '').strip()  # low, medium, high
        sort_by = request.args.get('sort', 'newest')  # newest, oldest
        
        query = Report.query.filter_by(user_id=user_id)
        
        if search_query:
            query = query.filter(
                (Report.summary.like(f"%{search_query}%")) | 
                (Report.recommendations.like(f"%{search_query}%"))
            )
            
        if risk_filter:
            # Categorize by risk score boundaries: Low(<=20), Medium(21-50), High(>50)
            if risk_filter.lower() == 'low':
                query = query.filter(Report.risk_score <= 20)
            elif risk_filter.lower() == 'medium':
                query = query.filter(Report.risk_score > 20, Report.risk_score <= 50)
            elif risk_filter.lower() == 'high':
                query = query.filter(Report.risk_score > 50)
                
        if sort_by == 'oldest':
            query = query.order_by(Report.created_at.asc())
        else:
            query = query.order_by(Report.created_at.desc())
            
        reports = query.all()
        return {
            'reports': [r.to_dict() for r in reports]
        }, 200

    @staticmethod
    def get_report_by_id(user_payload, report_id):
        """
        Retrieve details of a single report and dynamically compute analysis values.
        """
        user_id = user_payload.get('sub')
        report = Report.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return {'message': 'Report not found or access forbidden.'}, 404
            
        # Re-run analysis to retrieve structured, parameter-by-parameter details
        analysis = CBCAnalyzer.analyze(
            report.hemoglobin,
            report.wbc,
            report.platelets,
            report.rbc,
            report.mcv
        )
        
        report_dict = report.to_dict()
        report_dict['analysis'] = analysis['parameters']
        
        return {
            'report': report_dict
        }, 200

    @staticmethod
    def delete_report(user_payload, report_id):
        """
        Delete a single report from database.
        """
        user_id = user_payload.get('sub')
        report = Report.query.filter_by(id=report_id, user_id=user_id).first()
        if not report:
            return {'message': 'Report not found or access forbidden.'}, 404
            
        try:
            db.session.delete(report)
            db.session.commit()
            return {'message': 'Report deleted successfully.'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f"Failed to delete report: {str(e)}"}, 500
