"""
Main routes blueprint.
Handles the web interface and home page.
"""
from flask import Blueprint, render_template
from app.auth import require_auth, get_token_for_url

main_bp = Blueprint('main', __name__)


@main_bp.route('/', methods=['GET'])
@require_auth
def index():
    """
    Render the main control panel interface.
    
    Returns:
        Rendered HTML template
    """
    return render_template('index.html', token=get_token_for_url())
