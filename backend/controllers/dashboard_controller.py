from models import Report
from database import db

class DashboardController:
    @staticmethod
    def get_stats(user_payload):
        """
        Aggregate reports and calculate user metrics/trends.
        """
        user_id = user_payload.get('sub')
        reports = Report.query.filter_by(user_id=user_id).order_by(Report.created_at.desc()).all()
        
        total_reports = len(reports)
        if total_reports == 0:
            return {
                'total_reports': 0,
                'recent_reports': [],
                'health_summary': "No reports analyzed yet. Please complete a CBC analysis to activate your health dashboard.",
                'risk_indicators': {'low': 0, 'medium': 0, 'high': 0},
                'report_statistics': {
                    'avg_hemoglobin': 0.0,
                    'avg_wbc': 0.0,
                    'avg_platelets': 0.0,
                    'avg_rbc': 0.0,
                    'avg_mcv': 0.0
                }
            }, 200
            
        # Recent reports (up to 5)
        recent_reports = [r.to_dict() for r in reports[:5]]
        
        # Aggregate statistics
        low_count = 0
        medium_count = 0
        high_count = 0
        
        sum_hb = 0.0
        sum_wbc = 0.0
        sum_plat = 0.0
        sum_rbc = 0.0
        sum_mcv = 0.0
        
        for r in reports:
            # Low: <= 20, Medium: 21-50, High: > 50
            if r.risk_score <= 20:
                low_count += 1
            elif r.risk_score <= 50:
                medium_count += 1
            else:
                high_count += 1
                
            sum_hb += r.hemoglobin
            sum_wbc += r.wbc
            sum_plat += r.platelets
            sum_rbc += r.rbc
            sum_mcv += r.mcv
            
        latest_report = reports[0]
        
        # Check for any parameter outside normal ranges
        has_abnormal = (
            latest_report.hemoglobin < 12.0 or latest_report.hemoglobin > 16.0 or
            latest_report.wbc < 4000.0 or latest_report.wbc > 11000.0 or
            latest_report.platelets < 150000.0 or latest_report.platelets > 450000.0 or
            latest_report.rbc < 4.5 or latest_report.rbc > 5.9 or
            latest_report.mcv < 80.0 or latest_report.mcv > 100.0
        )
        
        if latest_report.risk_score <= 20:
            if has_abnormal:
                health_summary = f"Your latest CBC analysis indicates low overall risk (Risk Score: {latest_report.risk_score}%), but with mild parameter irregularities. Review dietary adjustments."
            else:
                health_summary = f"Your latest CBC analysis indicates optimal health parameters (Risk Score: {latest_report.risk_score}%). Keep maintaining your active lifestyle!"
        elif latest_report.risk_score <= 50:
            health_summary = f"Your latest CBC analysis indicates some moderate irregularities (Risk Score: {latest_report.risk_score}%). Consider dietary changes and schedule a clinical checkup."
        else:
            health_summary = f"Your latest CBC analysis reports critical blood parameters (Risk Score: {latest_report.risk_score}%). We strongly advise sharing these results with your physician immediately."
            
        stats = {
            'total_reports': total_reports,
            'recent_reports': recent_reports,
            'health_summary': health_summary,
            'risk_indicators': {
                'low': low_count,
                'medium': medium_count,
                'high': high_count
            },
            'report_statistics': {
                'avg_hemoglobin': round(sum_hb / total_reports, 2),
                'avg_wbc': round(sum_wbc / total_reports, 2),
                'avg_platelets': round(sum_plat / total_reports, 2),
                'avg_rbc': round(sum_rbc / total_reports, 2),
                'avg_mcv': round(sum_mcv / total_reports, 2)
            }
        }
        
        return stats, 200
