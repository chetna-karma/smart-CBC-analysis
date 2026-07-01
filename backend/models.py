from datetime import datetime, timezone
from database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    
    # Relationship
    reports = db.relationship('Report', backref='user', cascade='all, delete-orphan', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    hemoglobin = db.Column(db.Float, nullable=False)
    wbc = db.Column(db.Float, nullable=False)
    platelets = db.Column(db.Float, nullable=False)
    rbc = db.Column(db.Float, nullable=False)
    mcv = db.Column(db.Float, nullable=False)
    risk_score = db.Column(db.Integer, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    recommendations = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    
    def to_dict(self):
        health_score = 100 - self.risk_score
        if health_score >= 90:
            health_category = "Excellent"
        elif health_score >= 75:
            health_category = "Good"
        elif health_score >= 50:
            health_category = "Moderate"
        else:
            health_category = "High Risk"
            
        return {
            'id': self.id,
            'user_id': self.user_id,
            'hemoglobin': self.hemoglobin,
            'wbc': self.wbc,
            'platelets': self.platelets,
            'rbc': self.rbc,
            'mcv': self.mcv,
            'risk_score': self.risk_score,
            'health_score': health_score,
            'health_category': health_category,
            'summary': self.summary,
            'recommendations': self.recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
