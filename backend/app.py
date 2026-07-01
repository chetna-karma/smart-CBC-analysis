import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db, init_db
from routes.auth_routes import auth_bp
from routes.report_routes import report_bp
from routes.dashboard_routes import dashboard_bp

# Instantiate Flask app
app = Flask(__name__)
app.config.from_object(Config)

# CORS origins configuration: allow localhost + custom Netlify frontend URL in production
allowed_origins = ["*"]
frontend_url = os.environ.get('FRONTEND_URL')
if frontend_url:
    allowed_origins = [
        frontend_url,
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]

# Enable CORS for all APIs
CORS(app, resources={r"/api/*": {
    "origins": allowed_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize SQLAlchemy
init_db(app)

# Register Blueprint routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(report_bp, url_prefix='/api/reports')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

@app.route('/')
@app.route('/health')
def health_check():
    """
    General service health check route.
    """
    return jsonify({
        'status': 'healthy',
        'project': 'Smart CBC Report Analysis and Health Suggestion System',
        'version': '1.0.0'
    }), 200

@app.errorhandler(404)
def resource_not_found(error):
    return jsonify({'message': 'Requested API route not found.'}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({'message': 'An unexpected internal error occurred.'}), 500

# Create tables if they do not exist
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        app.logger.error(f"Error during auto-migration table setup: {e}")

if __name__ == '__main__':
    # Launch local server
    app.run(host='127.0.0.1', port=5000, debug=True)
