import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from config import Config

def generate_token(user_id, name, email, expires_in_hours=24):
    """
    Generate JWT token containing user details.
    """
    try:
        payload = {
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=expires_in_hours),
            'iat': datetime.datetime.now(datetime.timezone.utc),
            'sub': user_id,
            'name': name,
            'email': email
        }
        return jwt.encode(
            payload,
            Config.SECRET_KEY,
            algorithm='HS256'
        )
    except Exception as e:
        return None

def decode_token(token):
    """
    Decode JWT token.
    """
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return {
            'success': True,
            'data': payload
        }
    except jwt.ExpiredSignatureError:
        return {
            'success': False,
            'message': 'Token has expired. Please log in again.'
        }
    except jwt.InvalidTokenError:
        return {
            'success': False,
            'message': 'Invalid token. Please log in again.'
        }

def token_required(f):
    """
    Decorator to protect routes and verify JWT.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid Authorization header format. Use Bearer <token>'}), 401
        
        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401
        
        result = decode_token(token)
        if not result['success']:
            return jsonify({'message': result['message']}), 401
        
        current_user = result['data']
        # Call route function passing current_user as first arg
        return f(current_user, *args, **kwargs)
        
    return decorated
