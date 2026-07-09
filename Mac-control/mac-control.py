# mac_control.py
# Requirements: pip install flask opencv-python-headless
import os
import io
import subprocess
from flask import Flask, request, jsonify, send_file, abort
import cv2

APP = Flask(__name__)
TOKEN = os.environ.get("MAC_CONTROL_TOKEN", "replace-this-token")  # set a strong token in env

def check_auth():
    token = request.headers.get("X-Auth-Token") or request.args.get("token")
    if not token or token != TOKEN:
        abort(401)

@APP.route("/status", methods=["GET"])
def status():
    check_auth()
    
    # Check if request wants HTML (from browser) or JSON (from API)
    wants_html = 'text/html' in request.headers.get('Accept', '')
    
    try:
        # Get system information
        hostname = subprocess.getoutput("scutil --get ComputerName")
        
        # Get memory info - simple version
        total_memory_gb = 8.0  # Default for testing
        used_memory_gb = 7.4
        free_memory_gb = 0.6
        
        try:
            # Get total memory
            total_memory_bytes = int(subprocess.getoutput("sysctl -n hw.memsize"))
            total_memory_gb = round(total_memory_bytes / (1024**3), 1)
            
            # Get memory usage from top
            top_output = subprocess.getoutput("top -l 1 -s 0 | grep PhysMem")
            if "used" in top_output and "unused" in top_output:
                import re
                used_match = re.search(r'(\d+)M used', top_output)
                unused_match = re.search(r'(\d+)M unused', top_output)
                
                if used_match and unused_match:
                    used_mb = int(used_match.group(1))
                    unused_mb = int(unused_match.group(1))
                    
                    used_memory_gb = round(used_mb / 1024, 1)
                    free_memory_gb = round(unused_mb / 1024, 1)
        except:
            pass  # Use default values
        
        # Get storage info using simple df command
        try:
            storage_info = subprocess.getoutput("df -h /")
            storage_lines = storage_info.strip().split('\n')
            
            if len(storage_lines) > 1:
                # Parse the output line by line to handle wrapped lines
                data_line = storage_lines[1]
                parts = data_line.split()
                
                if len(parts) >= 5:
                    total_storage = parts[1]
                    used_storage = parts[2] 
                    available_storage = parts[3]
                    storage_percent = parts[4]
                elif len(parts) == 1 and len(storage_lines) > 2:
                    # Handle case where filesystem name is on separate line
                    data_line = storage_lines[2]
                    parts = data_line.split()
                    if len(parts) >= 4:
                        total_storage = parts[0]
                        used_storage = parts[1]
                        available_storage = parts[2] 
                        storage_percent = parts[3]
                    else:
                        total_storage = used_storage = available_storage = storage_percent = "Unknown"
                else:
                    total_storage = used_storage = available_storage = storage_percent = "Unknown"
            else:
                total_storage = used_storage = available_storage = storage_percent = "Unknown"
                
        except Exception as e:
            total_storage = used_storage = available_storage = storage_percent = "Unknown"
        
        # Get battery info
        battery_info = subprocess.getoutput("pmset -g batt")
        battery_percent = "Unknown"
        battery_status = "Unknown"
        
        if "InternalBattery" in battery_info:
            import re
            battery_match = re.search(r'(\d+)%.*?(\w+)', battery_info)
            if battery_match:
                battery_percent = battery_match.group(1) + "%"
                battery_status = battery_match.group(2)
        else:
            battery_percent = "Plugged In"
            battery_status = "AC Power"
        
        # Get running applications
        apps_info = subprocess.getoutput("osascript -e 'tell application \"System Events\" to get name of (processes whose background only is false)'")
        running_apps = [app.strip() for app in apps_info.split(',') if app.strip()]
        
        # Create data structure
        system_data = {
            "status": "ok",
            "hostname": hostname,
            "memory": {
                "total": f"{total_memory_gb} GB",
                "used": f"{used_memory_gb} GB", 
                "available": f"{free_memory_gb} GB"
            },
            "storage": {
                "total": total_storage,
                "used": used_storage,
                "available": available_storage,
                "percent_used": storage_percent
            },
            "battery": {
                "percent": battery_percent,
                "status": battery_status
            },
            "running_apps": running_apps[:10]  # Limit to first 10 apps
        }
        
        if wants_html:
            # Return beautiful HTML page
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Mac System Status</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .card {{ background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; margin: 15px 0; border: 1px solid rgba(255, 255, 255, 0.2); }}
        h1 {{ text-align: center; margin-bottom: 30px; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }}
        .stat-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; }}
        .stat-label {{ font-weight: bold; }}
        .stat-value {{ color: #a8e6cf; }}
        .progress-bar {{ width: 100%; height: 20px; background: rgba(255, 255, 255, 0.2); border-radius: 10px; overflow: hidden; margin: 5px 0; }}
        .progress-fill {{ height: 100%; background: linear-gradient(90deg, #a8e6cf, #88d8a3); transition: width 0.3s ease; }}
        .apps-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }}
        .app-item {{ background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; text-align: center; font-size: 0.9em; }}
        .back-btn {{ display: inline-block; background: rgba(255, 255, 255, 0.2); color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; margin-bottom: 20px; }}
        .refresh-btn {{ background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; margin: 10px 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <a href="/?token=replace-this-token" class="back-btn">← Back to Control Panel</a>
        <button onclick="location.reload()" class="refresh-btn">🔄 Refresh</button>
        
        <h1>🖥️ {hostname}</h1>
        
        <div class="card">
            <h3>💾 Memory Usage</h3>
            <div class="stat-row">
                <span class="stat-label">Total Memory:</span>
                <span class="stat-value">{system_data['memory']['total']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Used Memory:</span>
                <span class="stat-value">{system_data['memory']['used']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Available Memory:</span>
                <span class="stat-value">{system_data['memory']['available']}</span>
            </div>
        </div>
        
        <div class="card">
            <h3>💽 Storage Usage</h3>
            <div class="stat-row">
                <span class="stat-label">Total Storage:</span>
                <span class="stat-value">{system_data['storage']['total']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Used Storage:</span>
                <span class="stat-value">{system_data['storage']['used']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Available Storage:</span>
                <span class="stat-value">{system_data['storage']['available']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Usage:</span>
                <span class="stat-value">{system_data['storage']['percent_used']}</span>
            </div>
        </div>
        
        <div class="card">
            <h3>🔋 Battery Status</h3>
            <div class="stat-row">
                <span class="stat-label">Battery Level:</span>
                <span class="stat-value">{system_data['battery']['percent']}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Status:</span>
                <span class="stat-value">{system_data['battery']['status']}</span>
            </div>
        </div>
        
        <div class="card">
            <h3>🚀 Running Applications</h3>
            <div class="apps-grid">
                {''.join([f'<div class="app-item">{app}</div>' for app in system_data['running_apps']])}
            </div>
        </div>
    </div>
</body>
</html>
            """
            return html
        else:
            return jsonify(system_data)
            
    except Exception as e:
        error_data = {"status": "error", "message": str(e)}
        if wants_html:
            return f"<html><body><h1>Error</h1><p>{str(e)}</p></body></html>"
        else:
            return jsonify(error_data), 500

@APP.route("/lock", methods=["POST"])
def lock_screen():
    check_auth()
    # Use pmset to lock screen (works on modern macOS)
    try:
        subprocess.Popen(["pmset", "displaysleepnow"])
        return jsonify({"result":"locking screen"})
    except Exception as e:
        # Fallback to osascript method
        try:
            subprocess.Popen(["osascript", "-e", 'tell application "System Events" to keystroke "q" using {control down, command down}'])
            return jsonify({"result":"locking screen with fallback method"})
        except Exception as e2:
            return jsonify({"error": f"Failed to lock screen: {str(e)}, fallback also failed: {str(e2)}"}), 500

@APP.route("/restart", methods=["POST"])
def restart():
    check_auth()
    # ask system to restart (may prompt for open-app saves)
    subprocess.Popen(["osascript","-e",'tell application "System Events" to restart'])
    return jsonify({"result":"restarting"})

@APP.route("/camera", methods=["GET"])
def camera_snapshot():
    check_auth()
    camera_id = request.args.get("camera", "0")  # Allow specifying camera ID
    try:
        camera_index = int(camera_id)
    except ValueError:
        camera_index = 0
    
    # capture one frame from specified camera and return JPEG
    cap = cv2.VideoCapture(camera_index, cv2.CAP_AVFOUNDATION)
    if not cap.isOpened():
        return jsonify({"error":f"camera {camera_index} not available"}), 500
    
    # Set camera properties for better reliability
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Give camera time to warm up
    import time
    time.sleep(0.3)
    
    # Try multiple times to capture a frame
    for attempt in range(5):
        ret, frame = cap.read()
        if ret and frame is not None:
            break
        time.sleep(0.1)
    
    cap.release()
    
    if not ret or frame is None:
        return jsonify({"error":"capture failed after 5 attempts"}), 500
    
    # Check if frame has valid dimensions
    if frame.shape[0] == 0 or frame.shape[1] == 0:
        return jsonify({"error":"invalid frame dimensions"}), 500
    
    # Calculate average brightness
    import numpy as np
    brightness = np.mean(frame)
    
    # Enhance the image if it's too dark
    if brightness < 100:  # If image is dark
        # Apply brightness and contrast enhancement
        alpha = 1.3  # Contrast control (1.0-3.0)
        beta = 30    # Brightness control (0-100)
        frame = cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)
    
    # encode to JPEG with high quality
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 90]
    ret, jpeg = cv2.imencode('.jpg', frame, encode_params)
    if not ret:
        return jsonify({"error":"encode failed"}), 500
    return send_file(io.BytesIO(jpeg.tobytes()), mimetype='image/jpeg', as_attachment=False, download_name='snapshot.jpg')

@APP.route("/cameras", methods=["GET"])
def list_cameras():
    check_auth()
    available_cameras = []
    
    # Test cameras 0-5 to find available ones
    for i in range(6):
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
                available_cameras.append({"id": i, "status": "detected but failed to capture"})
        cap.release()
    
    return jsonify({"cameras": available_cameras})

@APP.route("/", methods=["GET"])
def web_interface():
    check_auth()
    # Simple web interface with buttons
    html = """
<!DOCTYPE html>
<html>
<head>
    <title>Mac Control</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        h1 { text-align: center; color: #333; }
        .button { 
            display: block; width: 100%; padding: 15px; margin: 10px 0; 
            font-size: 18px; border: none; border-radius: 5px; cursor: pointer; 
            text-decoration: none; text-align: center; color: white;
        }
        .status { background: #007bff; }
        .camera { background: #28a745; }
        .lock { background: #ffc107; color: black; }
        .restart { background: #dc3545; }
        .result { margin: 10px 0; padding: 10px; background: #e9ecef; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖥️ Mac Control</h1>
        
        <a href="/status?token=replace-this-token" class="button status">📊 Check Status</a>
        
        <a href="/camera?token=replace-this-token" class="button camera">📸 Take Photo (Default)</a>
        
        <a href="/camera?token=replace-this-token&camera=1" class="button camera">💻 Take Photo (Mac Camera)</a>
        
        <a href="/cameras?token=replace-this-token" class="button camera">📷 List Cameras</a>
        
        <button onclick="lockScreen()" class="button lock">🔒 Lock Screen</button>
        
        <button onclick="restartMac()" class="button restart">🔄 Restart Mac</button>
        
        <div id="result" class="result" style="display:none;"></div>
    </div>

    <script>
        function lockScreen() {
            fetch('/lock?token=replace-this-token', { method: 'POST' })
                .then(response => response.json())
                .then(data => showResult('Lock: ' + JSON.stringify(data)))
                .catch(error => showResult('Error: ' + error));
        }
        
        function restartMac() {
            if (confirm('Are you sure you want to restart the Mac?')) {
                fetch('/restart?token=replace-this-token', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => showResult('Restart: ' + JSON.stringify(data)))
                    .catch(error => showResult('Error: ' + error));
            }
        }
        
        function showResult(message) {
            document.getElementById('result').style.display = 'block';
            document.getElementById('result').innerHTML = message;
        }
    </script>
</body>
</html>
    """
    return html

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.DEBUG)
    
    # Get current network IP
    import socket
    import subprocess
    
    # Get network IP automatically
    network_ip = "192.168.1.4"  # fallback
    try:
        # Get the current network IP
        ip_output = subprocess.getoutput("ifconfig | grep 'inet ' | grep -v 127.0.0.1")
        if ip_output:
            import re
            ip_match = re.search(r'inet (\d+\.\d+\.\d+\.\d+)', ip_output)
            if ip_match:
                network_ip = ip_match.group(1)
    except:
        pass
    
    # run only on local network. use --host=0.0.0.0 to allow other devices on same LAN
    print("🚀 Starting Mac Control Server")
    print("=" * 60)
    print(f"📡 Server running on: http://0.0.0.0:8080")
    print(f"🔑 Token: {TOKEN}")
    print(f"🌐 Network IP: {network_ip}")
    print("")
    print("� COPY THESE URLs TO YOUR PHONE:")
    print("-" * 60)
    print(f"http://{network_ip}:8080/?token={TOKEN}")
    print("-" * 60)
    print("")
    print("📱 All available URLs:")
    print(f"  🏠 Main Control Panel:")
    print(f"     http://{network_ip}:8080/?token={TOKEN}")
    print("")
    print(f"  📊 Status Page:")
    print(f"     http://{network_ip}:8080/status?token={TOKEN}")
    print("")
    print(f"  📸 Camera:")
    print(f"     http://{network_ip}:8080/camera?token={TOKEN}")
    print("")
    print(f"  � Mac Camera:")
    print(f"     http://{network_ip}:8080/camera?token={TOKEN}&camera=1")
    print("")
    print("�💻 Local access (from this Mac):")
    print(f"  http://127.0.0.1:8080/?token={TOKEN}")
    print("")
    print("� START HERE: Copy the URL in the box above to your phone!")
    print("=" * 60)
    
    try:
        APP.run(host="0.0.0.0", port=8080, debug=False, use_reloader=False)
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()