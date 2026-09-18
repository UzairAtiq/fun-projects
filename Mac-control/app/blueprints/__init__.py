"""
Blueprints package initialization.
"""
from .main import main_bp
from .status import status_bp
from .camera import camera_bp
from .actions import actions_bp

__all__ = ['main_bp', 'status_bp', 'camera_bp', 'actions_bp']
