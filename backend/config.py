import os
from dotenv import load_dotenv

# Base directory of backend
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkeyforjwts_change_me_in_production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Enable CORS
    CORS_HEADERS = 'Content-Type'
    
    db_type = os.environ.get('DB_TYPE', 'sqlite').lower()
    
    if db_type == 'mysql':
        db_user = os.environ.get('DB_USER', 'root')
        db_password = os.environ.get('DB_PASSWORD', 'yourpassword')
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = os.environ.get('DB_PORT', '3306')
        db_name = os.environ.get('DB_NAME', 'cbc_analysis')
        
        # Connect to MySQL using pymysql
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 10,
            'pool_recycle': 280,
            'pool_pre_ping': True,
            'max_overflow': 20
        }
    else:
        # Fallback to SQLite database stored in backend folder
        sqlite_path = os.path.join(basedir, 'cbc_analysis.db')
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
