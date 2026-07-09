"""
Configuration module for Mac Control application.
Manages environment variables and application settings.
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

class Config:
    """Application configuration class."""
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    AUTH_TOKEN = os.environ.get('MAC_CONTROL_TOKEN', 'replace-this-token')
    
    # Flask settings
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', '8080'))
    
    # Logging
    LOG_DIR = BASE_DIR / 'logs'
    LOG_FILE = LOG_DIR / 'app.log'
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # Camera settings
    DEFAULT_CAMERA_ID = int(os.environ.get('DEFAULT_CAMERA_ID', '0'))
    CAMERA_WARMUP_TIME = float(os.environ.get('CAMERA_WARMUP_TIME', '0.3'))
    CAMERA_RETRY_ATTEMPTS = int(os.environ.get('CAMERA_RETRY_ATTEMPTS', '5'))
    JPEG_QUALITY = int(os.environ.get('JPEG_QUALITY', '90'))
    
    # System settings
    MAX_APPS_DISPLAY = int(os.environ.get('MAX_APPS_DISPLAY', '10'))
    
    @staticmethod
    def init_app():
        """Initialize application directories and settings."""
        # Create logs directory if it doesn't exist
        Config.LOG_DIR.mkdir(parents=True, exist_ok=True)
