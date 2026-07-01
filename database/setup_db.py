import os
import sys

# Add backend folder to sys.path so we can import from backend files
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_dir)

from flask import Flask
# pyrefly: ignore [missing-import]
from config import Config
from database import db
# pyrefly: ignore [missing-import]
from models import User, Report

def run_setup():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # If DB_TYPE is MySQL, ensure database itself exists before SQLAlchemy runs db.create_all()
    db_type = os.environ.get('DB_TYPE', 'sqlite').lower()
    
    if db_type == 'mysql':
        import pymysql
        db_user = os.environ.get('DB_USER', 'root')
        db_password = os.environ.get('DB_PASSWORD', 'yourpassword')
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = int(os.environ.get('DB_PORT', '3306'))
        db_name = os.environ.get('DB_NAME', 'cbc_analysis')
        
        try:
            print(f"Connecting to MySQL server at {db_host}:{db_port} as user '{db_user}'...")
            connection = pymysql.connect(
                host=db_host,
                user=db_user,
                password=db_password,
                port=db_port
            )
            try:
                with connection.cursor() as cursor:
                    print(f"Creating database '{db_name}' if it doesn't exist...")
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
                connection.commit()
            finally:
                connection.close()
            print("MySQL database setup complete.")
        except Exception as e:
            print(f"WARNING: Failed to connect to MySQL database: {e}")
            print("If you want to use SQLite, set DB_TYPE=sqlite in backend/.env.")
            
    db.init_app(app)
    
    with app.app_context():
        try:
            print("Creating all tables defined in models...")
            db.create_all()
            print("Database setup executed successfully.")
        except Exception as e:
            print(f"ERROR: Failed to create tables: {e}")
            sys.exit(1)

if __name__ == '__main__':
    run_setup()
