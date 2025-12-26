"""
Services package initialization.
"""
from .system_status import get_system_status, get_hostname
from .camera import capture_snapshot, list_available_cameras
from .system_actions import lock_screen, restart_system

__all__ = [
    'get_system_status',
    'get_hostname',
    'capture_snapshot',
    'list_available_cameras',
    'lock_screen',
    'restart_system'
]
