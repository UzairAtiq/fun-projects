#!/usr/bin/env python3
"""
Main entry point for Mac Control application.
Run this file to start the Flask server.
"""
import subprocess
import re
from app import create_app
from app.config import Config


def get_network_ip():
    """
    Get the current network IP address.
    
    Returns:
        str: Network IP address or fallback IP
    """
    fallback_ip = "192.168.1.4"
    try:
        ip_output = subprocess.getoutput("ifconfig | grep 'inet ' | grep -v 127.0.0.1")
        if ip_output:
            ip_match = re.search(r'inet (\d+\.\d+\.\d+\.\d+)', ip_output)
            if ip_match:
                return ip_match.group(1)
    except Exception:
        pass
    return fallback_ip


def print_startup_info():
    """Print server startup information and URLs."""
    network_ip = get_network_ip()
    token = Config.AUTH_TOKEN
    port = Config.PORT
    
    print("🚀 Starting Mac Control Server")
    print("=" * 60)
    print(f"📡 Server running on: http://{Config.HOST}:{port}")
    print(f"🔑 Token: {token}")
    print(f"🌐 Network IP: {network_ip}")
    print("")
    print("📱 COPY THESE URLs TO YOUR PHONE:")
    print("-" * 60)
    print(f"http://{network_ip}:{port}/?token={token}")
    print("-" * 60)
    print("")
    print("📱 All available URLs:")
    print(f"  🏠 Main Control Panel:")
    print(f"     http://{network_ip}:{port}/?token={token}")
    print("")
    print(f"  📊 Status Page:")
    print(f"     http://{network_ip}:{port}/status/?token={token}")
    print("")
    print(f"  📸 Camera:")
    print(f"     http://{network_ip}:{port}/camera/?token={token}")
    print("")
    print(f"  📷 List Cameras:")
    print(f"     http://{network_ip}:{port}/camera/list?token={token}")
    print("")
    print(f"  🔒 Lock Screen (POST):")
    print(f"     http://{network_ip}:{port}/actions/lock?token={token}")
    print("")
    print(f"  🔄 Restart (POST):")
    print(f"     http://{network_ip}:{port}/actions/restart?token={token}")
    print("")
    print("💻 Local access (from this Mac):")
    print(f"  http://127.0.0.1:{port}/?token={token}")
    print("")
    print("✅ START HERE: Copy the URL in the box above to your phone!")
    print("=" * 60)


def main():
    """Main application entry point."""
    # Create Flask app
    app = create_app()
    
    # Print startup info
    print_startup_info()
    
    # Run the application
    try:
        app.run(
            host=Config.HOST,
            port=Config.PORT,
            debug=Config.DEBUG,
            use_reloader=False
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
