"""
Camera service module.
Handles camera operations including snapshot capture and camera detection.
"""
import io
import time
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np
from app.config import Config


def capture_snapshot(camera_id: int = 0) -> Tuple[bool, Optional[bytes], Optional[str]]:
    """
    Capture a snapshot from the specified camera.
    
    Args:
        camera_id: The camera index to use
        
    Returns:
        Tuple of (success, jpeg_bytes, error_message)
    """
    cap = None
    try:
        # Open camera
        cap = cv2.VideoCapture(camera_id, cv2.CAP_AVFOUNDATION)
        if not cap.isOpened():
            return False, None, f"Camera {camera_id} not available"
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Give camera time to warm up
        time.sleep(Config.CAMERA_WARMUP_TIME)
        
        # Try multiple times to capture a frame
        frame = None
        for attempt in range(Config.CAMERA_RETRY_ATTEMPTS):
            ret, frame = cap.read()
            if ret and frame is not None:
                break
            time.sleep(0.1)
        
        if not ret or frame is None:
            return False, None, f"Capture failed after {Config.CAMERA_RETRY_ATTEMPTS} attempts"
        
        # Check if frame has valid dimensions
        if frame.shape[0] == 0 or frame.shape[1] == 0:
            return False, None, "Invalid frame dimensions"
        
        # Enhance image if it's too dark
        brightness = np.mean(frame)
        if brightness < 100:
            alpha = 1.3  # Contrast control
            beta = 30    # Brightness control
            frame = cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)
        
        # Encode to JPEG
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, Config.JPEG_QUALITY]
        ret, jpeg = cv2.imencode('.jpg', frame, encode_params)
        
        if not ret:
            return False, None, "JPEG encoding failed"
        
        return True, jpeg.tobytes(), None
        
    except Exception as e:
        return False, None, f"Camera error: {str(e)}"
    finally:
        if cap is not None:
            cap.release()


def list_available_cameras(max_cameras: int = 6) -> List[Dict[str, any]]:
    """
    Detect available cameras on the system.
    
    Args:
        max_cameras: Maximum number of camera indices to check
        
    Returns:
        List of dictionaries containing camera information
    """
    available_cameras = []
    
    for i in range(max_cameras):
        cap = None
        try:
            cap = cv2.VideoCapture(i, cv2.CAP_AVFOUNDATION)
            if cap.isOpened():
                # Try to read a frame to verify it's working
                ret, frame = cap.read()
                if ret and frame is not None:
                    available_cameras.append({
                        "id": i,
                        "status": "available",
                        "resolution": f"{frame.shape[1]}x{frame.shape[0]}"
                    })
                else:
                    available_cameras.append({
                        "id": i,
                        "status": "detected but failed to capture"
                    })
        except Exception:
            pass
        finally:
            if cap is not None:
                cap.release()
    
    return available_cameras
