"""
Camera blueprint.
Handles camera operations and snapshots.
"""
import io
from flask import Blueprint, jsonify, send_file, request
from app.auth import require_auth
from app.services import capture_snapshot, list_available_cameras
from app.config import Config

camera_bp = Blueprint('camera', __name__, url_prefix='/camera')


@camera_bp.route('/', methods=['GET'])
@require_auth
def get_snapshot():
    """
    Capture and return a camera snapshot.
    
    Query Parameters:
        camera: Camera ID (default: 0)
        
    Returns:
        JPEG image or error JSON
    """
    camera_id_str = request.args.get('camera', str(Config.DEFAULT_CAMERA_ID))
    
    try:
        camera_id = int(camera_id_str)
    except ValueError:
        camera_id = Config.DEFAULT_CAMERA_ID
    
    success, jpeg_bytes, error = capture_snapshot(camera_id)
    
    if success:
        return send_file(
            io.BytesIO(jpeg_bytes),
            mimetype='image/jpeg',
            as_attachment=False,
            download_name='snapshot.jpg'
        )
    else:
        return jsonify({"error": error}), 500


@camera_bp.route('/list', methods=['GET'])
@require_auth
def list_cameras():
    """
    List all available cameras.
    
    Returns:
        JSON with list of available cameras
    """
    cameras = list_available_cameras()
    return jsonify({"cameras": cameras})
