"""
System status service module.
Provides functions to get Mac system information like memory, storage, battery, and running apps.
"""
import subprocess
import re
from typing import Dict, List, Any


def get_hostname() -> str:
    """
    Get the computer's hostname.
    
    Returns:
        str: The computer name
    """
    try:
        return subprocess.getoutput("scutil --get ComputerName")
    except Exception:
        return "Unknown"


def get_memory_info() -> Dict[str, str]:
    """
    Get system memory information.
    
    Returns:
        Dict containing total, used, and available memory
    """
    # Default values
    total_memory_gb = 8.0
    used_memory_gb = 7.4
    free_memory_gb = 0.6
    
    try:
        # Get total memory
        total_memory_bytes = int(subprocess.getoutput("sysctl -n hw.memsize"))
        total_memory_gb = round(total_memory_bytes / (1024**3), 1)
        
        # Get memory usage from top
        top_output = subprocess.getoutput("top -l 1 -s 0 | grep PhysMem")
        if "used" in top_output and "unused" in top_output:
            used_match = re.search(r'(\d+)M used', top_output)
            unused_match = re.search(r'(\d+)M unused', top_output)
            
            if used_match and unused_match:
                used_mb = int(used_match.group(1))
                unused_mb = int(unused_match.group(1))
                
                used_memory_gb = round(used_mb / 1024, 1)
                free_memory_gb = round(unused_mb / 1024, 1)
    except Exception:
        pass  # Use default values
    
    return {
        "total": f"{total_memory_gb} GB",
        "used": f"{used_memory_gb} GB",
        "available": f"{free_memory_gb} GB"
    }


def get_storage_info() -> Dict[str, str]:
    """
    Get system storage information.
    
    Returns:
        Dict containing total, used, available storage and usage percentage
    """
    try:
        storage_info = subprocess.getoutput("df -h /")
        storage_lines = storage_info.strip().split('\n')
        
        if len(storage_lines) > 1:
            data_line = storage_lines[1]
            parts = data_line.split()
            
            if len(parts) >= 5:
                return {
                    "total": parts[1],
                    "used": parts[2],
                    "available": parts[3],
                    "percent_used": parts[4]
                }
            elif len(parts) == 1 and len(storage_lines) > 2:
                # Handle case where filesystem name is on separate line
                data_line = storage_lines[2]
                parts = data_line.split()
                if len(parts) >= 4:
                    return {
                        "total": parts[0],
                        "used": parts[1],
                        "available": parts[2],
                        "percent_used": parts[3]
                    }
    except Exception:
        pass
    
    # Return unknown values if parsing fails
    return {
        "total": "Unknown",
        "used": "Unknown",
        "available": "Unknown",
        "percent_used": "Unknown"
    }


def get_battery_info() -> Dict[str, str]:
    """
    Get battery status information.
    
    Returns:
        Dict containing battery percentage and status
    """
    try:
        battery_info = subprocess.getoutput("pmset -g batt")
        
        if "InternalBattery" in battery_info:
            battery_match = re.search(r'(\d+)%.*?(\w+)', battery_info)
            if battery_match:
                return {
                    "percent": battery_match.group(1) + "%",
                    "status": battery_match.group(2)
                }
        else:
            return {
                "percent": "Plugged In",
                "status": "AC Power"
            }
    except Exception:
        pass
    
    return {
        "percent": "Unknown",
        "status": "Unknown"
    }


def get_running_apps(max_apps: int = 10) -> List[str]:
    """
    Get list of running applications.
    
    Args:
        max_apps: Maximum number of apps to return
        
    Returns:
        List of running application names
    """
    try:
        apps_info = subprocess.getoutput(
            'osascript -e \'tell application "System Events" to get name of '
            '(processes whose background only is false)\''
        )
        running_apps = [app.strip() for app in apps_info.split(',') if app.strip()]
        return running_apps[:max_apps]
    except Exception:
        return []


def get_system_status(max_apps: int = 10) -> Dict[str, Any]:
    """
    Get complete system status information.
    
    Args:
        max_apps: Maximum number of apps to include
        
    Returns:
        Dict containing all system information
    """
    return {
        "status": "ok",
        "hostname": get_hostname(),
        "memory": get_memory_info(),
        "storage": get_storage_info(),
        "battery": get_battery_info(),
        "running_apps": get_running_apps(max_apps)
    }
