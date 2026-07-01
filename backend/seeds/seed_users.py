import os
import sys

# Ensure backend folder is in path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_dir)

from flask import Flask
from config import Config
from database import db
from models import User, Report
from services.auth_service import AuthService
from services.cbc_analyzer import CBCAnalyzer
from datetime import datetime, timedelta

def seed_data():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        print("Creating database tables if they do not exist...")
        db.create_all()
        print("Database Seeding Started...")
        
        # 1. Define target seed users
        seed_users_data = [
            {"name": "Chetna", "email": "chetna@example.com", "password": "123456"},
            {"name": "Vaishnavi", "email": "vaishnavi@example.com", "password": "123456"},
            {"name": "Roopa", "email": "roopa@example.com", "password": "123456"},
            {"name": "Kavi", "email": "kavi@example.com", "password": "123456"},
            {"name": "Yash", "email": "yash@example.com", "password": "123456"}
        ]
        
        # 2. Seed reports data config
        # Give each user some historical reports with diverse values
        sample_reports_data = [
            # Low Risk Report (All normal)
            {"hemoglobin": 14.5, "wbc": 7000.0, "platelets": 250000.0, "rbc": 5.0, "mcv": 90.0, "days_offset": 30},
            # Medium Risk Report (Low Hb - Anemia)
            {"hemoglobin": 10.5, "wbc": 6500.0, "platelets": 240000.0, "rbc": 4.2, "mcv": 82.0, "days_offset": 20},
            # High Risk Report (Low WBC, Low Platelets - infection/bleeding risk)
            {"hemoglobin": 11.0, "wbc": 3000.0, "platelets": 100000.0, "rbc": 4.3, "mcv": 88.0, "days_offset": 10},
            # Good Report (slight high WBC - mild infection/stress)
            {"hemoglobin": 13.8, "wbc": 11500.0, "platelets": 270000.0, "rbc": 4.9, "mcv": 92.0, "days_offset": 2}
        ]
        
        for u_data in seed_users_data:
            # Check if user exists
            user = User.query.filter_by(email=u_data["email"]).first()
            if not user:
                print(f"Creating user '{u_data['name']}'...")
                hashed_pw = AuthService.hash_password(u_data["password"])
                user = User(name=u_data["name"], email=u_data["email"], password=hashed_pw)
                db.session.add(user)
                db.session.flush() # get user.id
            else:
                print(f"User '{u_data['name']}' already exists.")
                
            # Seed reports for this user if they don't have any
            reports_count = Report.query.filter_by(user_id=user.id).count()
            if reports_count == 0:
                print(f"Seeding reports for user '{user.name}'...")
                for rep in sample_reports_data:
                    # Run analyzer
                    analysis = CBCAnalyzer.analyze(
                        rep["hemoglobin"],
                        rep["wbc"],
                        rep["platelets"],
                        rep["rbc"],
                        rep["mcv"]
                    )
                    
                    # Create report object
                    created_time = datetime.utcnow() - timedelta(days=rep["days_offset"])
                    new_report = Report(
                        user_id=user.id,
                        hemoglobin=rep["hemoglobin"],
                        wbc=rep["wbc"],
                        platelets=rep["platelets"],
                        rbc=rep["rbc"],
                        mcv=rep["mcv"],
                        risk_score=analysis["risk_score"],
                        summary=analysis["summary"],
                        recommendations=analysis["recommendations"],
                        created_at=created_time,
                        updated_at=created_time
                    )
                    db.session.add(new_report)
            else:
                print(f"User '{user.name}' already has {reports_count} reports. Skipping reports seeding.")
                
        db.session.commit()
        print("Database Seeding Completed Successfully!")

if __name__ == '__main__':
    seed_data()
