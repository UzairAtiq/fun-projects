"""
Actions blueprint.
Handles system actions like lock and restart.
"""
from flask import Blueprint, jsonify
from app.auth import require_auth
from app.services import lock_screen, restart_system

actions_bp = Blueprint('actions', __name__, url_prefix='/actions')


@actions_bp.route('/lock', methods=['POST'])
@require_auth
def lock():
    """
    Lock the screen.
    
    Returns:
        JSON response with result or error
    """
    result = lock_screen()
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result)


@actions_bp.route('/restart', methods=['POST'])
@require_auth
def restart():
    """
    Restart the system.
    
    Returns:
        JSON response with result or error
    """
    result = restart_system()
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result)
