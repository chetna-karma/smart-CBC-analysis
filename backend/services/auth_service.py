import bcrypt

class AuthService:
    @staticmethod
    def hash_password(password):
        """
        Hash password using bcrypt.
        """
        if not password:
            return None
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password, hashed_password):
        """
        Verify password matches the hashed password.
        """
        if not password or not hashed_password:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False
        
    @staticmethod
    def register_user(name, email, password):
        # We will import User inside the method to avoid circular dependency
        from models import User
        from database import db
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {'success': False, 'message': 'Email is already registered.'}
            
        hashed_pw = AuthService.hash_password(password)
        new_user = User(name=name, email=email, password=hashed_pw)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            return {'success': True, 'user': new_user}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f"Failed to register user: {str(e)}"}
