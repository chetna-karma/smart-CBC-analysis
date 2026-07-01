from models import User
from services.auth_service import AuthService
from utils.jwt_handler import generate_token
from utils.validators import validate_email, validate_password
from database import db

class AuthController:
    @staticmethod
    def register(data):
        """
        Handle user registration, and automatically issue a JWT token (Auto-Login UX).
        """
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not name:
            return {'message': 'Name is required.'}, 400
        if not validate_email(email):
            return {'message': 'Invalid email address.'}, 400
        if not validate_password(password):
            return {'message': 'Password must be at least 6 characters long.'}, 400
            
        result = AuthService.register_user(name, email, password)
        if not result['success']:
            return {'message': result['message']}, 400
            
        user = result['user']
        # Auto-login: generate token immediately
        token = generate_token(user.id, user.name, user.email)
        
        return {
            'message': 'Registration and login successful.',
            'token': token,
            'user': user.to_dict()
        }, 201

    @staticmethod
    def login(data):
        """
        Handle user login and token generation.
        """
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return {'message': 'Email and password are required.'}, 400
            
        user = User.query.filter_by(email=email).first()
        if not user or not AuthService.verify_password(password, user.password):
            return {'message': 'Invalid email or password.'}, 401
            
        token = generate_token(user.id, user.name, user.email)
        if not token:
            return {'message': 'Internal error generating token.'}, 500
            
        return {
            'message': 'Login successful.',
            'token': token,
            'user': user.to_dict()
        }, 200

    @staticmethod
    def get_profile(user_payload):
        """
        Retrieve details and counts stats of the authenticated user.
        """
        user_id = user_payload.get('sub')
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User profile not found.'}, 404
            
        # Get count of reports
        from models import Report
        reports_count = Report.query.filter_by(user_id=user.id).count()
        
        user_data = user.to_dict()
        user_data['reports_count'] = reports_count
        
        return {
            'user': user_data
        }, 200

    @staticmethod
    def update_profile(user_payload, data):
        """
        Update profile details (name, email, password) of the authenticated user.
        """
        user_id = user_payload.get('sub')
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User profile not found.'}, 404
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if 'name' in data:
            if not name:
                return {'message': 'Name cannot be empty.'}, 400
            user.name = name
            
        if 'email' in data and email != user.email:
            if not validate_email(email):
                return {'message': 'Invalid email address.'}, 400
            # Check unique email constraint
            existing = User.query.filter(User.email == email, User.id != user_id).first()
            if existing:
                return {'message': 'Email address is already registered.'}, 400
            user.email = email
            
        if 'password' in data and password:
            if not validate_password(password):
                return {'message': 'Password must be at least 6 characters long.'}, 400
            user.password = AuthService.hash_password(password)
            
        try:
            db.session.commit()
            
            # Renew access token with updated profile information
            token = generate_token(user.id, user.name, user.email)
            
            return {
                'message': 'Profile updated successfully.',
                'token': token,
                'user': user.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f"Failed to update profile: {str(e)}"}, 500
