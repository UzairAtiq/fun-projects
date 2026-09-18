"""
System status blueprint.
Handles system status information endpoints.
"""
from flask import Blueprint, render_template, jsonify, request
from app.auth import require_auth, get_token_for_url
from app.services import get_system_status
from app.config import Config

status_bp = Blueprint('status', __name__, url_prefix='/status')


@status_bp.route('/', methods=['GET'])
@require_auth
def get_status():
    """
    Get system status information.
    Returns HTML or JSON based on Accept header.
    
    Returns:
        Rendered HTML template or JSON response
    """
    try:
        # Check if request wants HTML (from browser) or JSON (from API)
        wants_html = 'text/html' in request.headers.get('Accept', '')
        
        # Get system data
        system_data = get_system_status(max_apps=Config.MAX_APPS_DISPLAY)
        
        if wants_html:
            return render_template('status.html', data=system_data, token=get_token_for_url())
        else:
            return jsonify(system_data)
            
    except Exception as e:
        error_data = {"status": "error", "message": str(e)}
        
        if wants_html:
            return render_template('error.html', error=str(e)), 500
        else:
            return jsonify(error_data), 500
