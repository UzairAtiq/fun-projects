"""
System actions service module.
Handles system-level actions like locking screen and restarting.
"""
import subprocess
from typing import Dict


def lock_screen() -> Dict[str, str]:
    """
    Lock the screen.
    
    Returns:
        Dict with result or error message
    """
    try:
        # Use pmset to lock screen (works on modern macOS)
        subprocess.Popen(["pmset", "displaysleepnow"])
        return {"result": "Locking screen"}
    except Exception as e:
        # Fallback to osascript method
        try:
            subprocess.Popen([
                "osascript", "-e",
                'tell application "System Events" to keystroke "q" using {control down, command down}'
            ])
            return {"result": "Locking screen with fallback method"}
        except Exception as e2:
            return {
                "error": f"Failed to lock screen: {str(e)}, fallback also failed: {str(e2)}"
            }


def restart_system() -> Dict[str, str]:
    """
    Restart the system.
    
    Returns:
        Dict with result message
    """
    try:
        subprocess.Popen([
            "osascript", "-e",
            'tell application "System Events" to restart'
        ])
        return {"result": "Restarting system"}
    except Exception as e:
        return {"error": f"Failed to restart: {str(e)}"}
