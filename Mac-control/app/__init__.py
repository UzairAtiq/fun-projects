"""
Application factory module.
Creates and configures the Flask application.
"""
import logging
from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.blueprints import main_bp, status_bp, camera_bp, actions_bp


def create_app():
    """
    Create and configure the Flask application.
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    Config.init_app()
    
    # Enable CORS for all routes (allows Vercel frontend to connect)
    CORS(app, resources={
        r"/*": {
            "origins": "*",  # In production, replace with your Vercel domain
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-Auth-Token"]
        }
    })
    
    # Setup logging
    setup_logging(app)
    
    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(status_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(actions_bp)
    
    # Log startup
    app.logger.info("Mac Control application initialized with CORS support")
    
    return app


def setup_logging(app):
    """
    Configure application logging.
    
    Args:
        app: Flask application instance
    """
    # Create file handler
    file_handler = logging.FileHandler(Config.LOG_FILE)
    file_handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    
    # Add handler to app logger
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
