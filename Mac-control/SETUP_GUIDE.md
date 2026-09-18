# Mac Control - Auto-Start Setup Guide for macOS

This guide will help you set up Mac Control to automatically start when your Mac boots or when you log in, using macOS launchd.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Managing the Service](#managing-the-service)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Security & Permissions](#security--permissions)
8. [Uninstallation](#uninstallation)

---

## Prerequisites

- macOS Sonoma (or later)
- Python 3.11 or higher
- Administrator access to your Mac

---

## Installation Steps

### Step 1: Permanent Project Location

Move your project to a permanent location that won't change:

```bash
# Create a permanent directory (if not already there)
mkdir -p ~/Developer/Projects

# If your project is elsewhere, move it:
# mv /path/to/Mac-control-py ~/Developer/Projects/

cd ~/Developer/Projects/Mac-control-py
```

**Important:** Never move the project after setting up launchd, or you'll need to reconfigure everything.

---

### Step 2: Create Python Virtual Environment

```bash
# Make sure you're in the project directory
cd ~/Developer/Projects/Mac-control-py

# Create virtual environment using Python 3.11
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Verify Python version
python --version
# Should show Python 3.11.x or higher
```

---

### Step 3: Install Dependencies

```bash
# Make sure virtual environment is activated
# You should see (.venv) in your terminal prompt

# Upgrade pip
pip install --upgrade pip

# Install all required packages
pip install flask opencv-python-headless numpy

# Verify installation
pip list
```

Expected packages:
- Flask (3.x)
- opencv-python-headless (4.x)
- numpy (1.x or 2.x)
- And their dependencies (Werkzeug, Jinja2, etc.)

---

### Step 4: Test the Application

Before setting up auto-start, make sure the application runs correctly:

```bash
# Make sure you're in project directory with venv activated
python run.py
```

You should see:
```
🚀 Starting Mac Control Server
============================================================
📡 Server running on: http://0.0.0.0:8080
🔑 Token: replace-this-token
...
```

Test by opening the URL in your browser. Once verified, stop the server with `Ctrl+C`.

---

### Step 5: Generate Secure Token

Create a strong, random authentication token:

```bash
# Generate a secure random token (choose one method)

# Method 1: Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Method 2: Using OpenSSL
openssl rand -base64 32

# Method 3: Using uuidgen
uuidgen
```

**Save this token securely** - you'll need it to access the web interface.

---

### Step 6: Configure launchd Plist File

Edit the provided plist file:

```bash
# Open the plist file in your editor
nano com.user.maccontrol.plist
```

**Replace the following placeholders:**

1. **YOUR_USERNAME** (appears 4 times):
   - Replace with your actual macOS username
   - To find your username, run: `whoami`

2. **YOUR-SECURE-TOKEN-HERE-CHANGE-THIS**:
   - Replace with the token you generated in Step 5

Example replacements:
```xml
<!-- Before -->
<string>/Users/YOUR_USERNAME/Developer/Projects/Mac-control-py/.venv/bin/python</string>

<!-- After (if your username is "john") -->
<string>/Users/john/Developer/Projects/Mac-control-py/.venv/bin/python</string>
```

Save and close the file (`Ctrl+X`, then `Y`, then `Enter` in nano).

---

### Step 7: Copy Plist to LaunchAgents

```bash
# Copy the plist file to LaunchAgents directory
cp com.user.maccontrol.plist ~/Library/LaunchAgents/

# Verify it was copied
ls -la ~/Library/LaunchAgents/com.user.maccontrol.plist

# Set proper permissions
chmod 644 ~/Library/LaunchAgents/com.user.maccontrol.plist
```

---

### Step 8: Load and Start the Service

```bash
# Load the service (registers it with launchd)
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist

# Start the service immediately
launchctl start com.user.maccontrol

# Wait 2-3 seconds for the service to start
sleep 3
```

---

## Configuration

### Environment Variables

You can customize the application by editing the plist file's `EnvironmentVariables` section:

| Variable | Default | Description |
|----------|---------|-------------|
| `MAC_CONTROL_TOKEN` | (required) | Authentication token for API access |
| `FLASK_HOST` | 0.0.0.0 | Host to bind to (0.0.0.0 = all interfaces) |
| `FLASK_PORT` | 8080 | Port number to listen on |
| `FLASK_DEBUG` | false | Enable Flask debug mode (use false in production) |
| `LOG_LEVEL` | INFO | Logging level (DEBUG, INFO, WARNING, ERROR) |

After changing the plist file, reload the service:

```bash
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl start com.user.maccontrol
```

---

## Managing the Service

### Check Service Status

```bash
# Check if service is running
launchctl list | grep maccontrol

# If running, you'll see output like:
# 12345  0  com.user.maccontrol
# (PID)  (exit code)  (label)
```

### Start the Service

```bash
launchctl start com.user.maccontrol
```

### Stop the Service

```bash
launchctl stop com.user.maccontrol
```

### Restart the Service

```bash
launchctl stop com.user.maccontrol
sleep 2
launchctl start com.user.maccontrol
```

### Unload the Service (Disable auto-start)

```bash
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
```

### Reload the Service (Enable auto-start)

```bash
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
```

---

## Verification

### 1. Check Service Status

```bash
# Method 1: Using launchctl
launchctl list | grep maccontrol

# Method 2: Check process
ps aux | grep "run.py"

# Method 3: Check if port is listening
lsof -i :8080
```

### 2. Check Logs

```bash
# View stdout (normal output)
tail -f ~/Developer/Projects/Mac-control-py/logs/stdout.log

# View stderr (errors)
tail -f ~/Developer/Projects/Mac-control-py/logs/stderr.log

# View application logs
tail -f ~/Developer/Projects/Mac-control-py/logs/app.log
```

### 3. Test Web Interface

Open your browser and navigate to:
```
http://localhost:8080/?token=YOUR-TOKEN-HERE
```

Or from another device on the same network:
```
http://YOUR-MAC-IP:8080/?token=YOUR-TOKEN-HERE
```

To find your Mac's IP address:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 4. Test After Reboot

```bash
# Restart your Mac
sudo reboot

# After reboot, wait 30 seconds, then check:
launchctl list | grep maccontrol
curl -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/status/
```

---

## Troubleshooting

### Service Won't Start

1. **Check plist syntax:**
   ```bash
   plutil -lint ~/Library/LaunchAgents/com.user.maccontrol.plist
   ```

2. **Verify paths are correct:**
   ```bash
   # Check Python path
   ls -la ~/Developer/Projects/Mac-control-py/.venv/bin/python
   
   # Check run.py exists
   ls -la ~/Developer/Projects/Mac-control-py/run.py
   ```

3. **Check permissions:**
   ```bash
   ls -la ~/Library/LaunchAgents/com.user.maccontrol.plist
   # Should show: -rw-r--r--
   ```

4. **Test manually:**
   ```bash
   cd ~/Developer/Projects/Mac-control-py
   .venv/bin/python run.py
   ```

### Service Crashes Immediately

1. **Check stderr log:**
   ```bash
   cat ~/Developer/Projects/Mac-control-py/logs/stderr.log
   ```

2. **Common issues:**
   - Missing dependencies: Reinstall with `pip install -r requirements.txt`
   - Port already in use: Change FLASK_PORT in plist
   - Invalid token: Check EnvironmentVariables in plist

### Can't Access from Other Devices

1. **Check firewall settings:**
   ```bash
   # System Settings > Network > Firewall
   # Make sure port 8080 is allowed
   ```

2. **Verify server is listening on all interfaces:**
   ```bash
   lsof -i :8080
   # Should show: *:8080 (LISTEN)
   ```

3. **Check if devices are on same network:**
   ```bash
   # On Mac, check IP:
   ifconfig | grep "inet "
   
   # On phone/other device, try to ping the Mac:
   ping YOUR-MAC-IP
   ```

### High CPU Usage

1. **Check logs for errors:**
   ```bash
   tail -100 ~/Developer/Projects/Mac-control-py/logs/stderr.log
   ```

2. **Restart the service:**
   ```bash
   launchctl stop com.user.maccontrol
   sleep 5
   launchctl start com.user.maccontrol
   ```

### View Detailed Logs

```bash
# Real-time stdout
tail -f ~/Developer/Projects/Mac-control-py/logs/stdout.log

# Real-time stderr
tail -f ~/Developer/Projects/Mac-control-py/logs/stderr.log

# Last 50 lines of errors
tail -50 ~/Developer/Projects/Mac-control-py/logs/stderr.log

# View system logs for launchd
log show --predicate 'process == "launchd"' --last 1h | grep maccontrol
```

---

## Security & Permissions

### Required macOS Permissions

Mac Control needs the following permissions to function properly:

#### 1. Camera Access

**Why:** To capture photos from the camera

**How to grant:**
1. System Settings → Privacy & Security → Camera
2. Enable for "Python" or your terminal app
3. You may need to grant permission on first camera access

#### 2. Screen Recording (for screenshots, if added)

**How to grant:**
1. System Settings → Privacy & Security → Screen Recording
2. Enable for "Python" or your terminal app

#### 3. Automation

**Why:** To control system (lock, restart)

**How to grant:**
1. System Settings → Privacy & Security → Automation
2. Enable for "Python" or "System Events"

#### 4. Accessibility (for lock screen)

**How to grant:**
1. System Settings → Privacy & Security → Accessibility
2. Enable for your terminal app or Python

### Network Security

1. **Use a strong authentication token**
   - Minimum 32 characters
   - Random and unique
   - Change regularly

2. **Use only on trusted networks**
   - Home Wi-Fi is generally safe
   - Avoid public Wi-Fi unless using VPN

3. **Consider using HTTPS** (advanced)
   - Requires SSL certificate
   - Protects token in transit

4. **Firewall configuration**
   ```bash
   # To allow only specific IP addresses (advanced)
   # Edit plist and change FLASK_HOST from 0.0.0.0 to specific IP
   ```

### Best Practices

1. **Keep token secret**
   - Don't share in screenshots
   - Don't commit to git
   - Store securely (password manager)

2. **Regular updates**
   ```bash
   cd ~/Developer/Projects/Mac-control-py
   source .venv/bin/activate
   pip install --upgrade flask opencv-python-headless numpy
   ```

3. **Monitor logs**
   ```bash
   # Check for unauthorized access attempts
   grep "401" ~/Developer/Projects/Mac-control-py/logs/app.log
   ```

4. **Limit network exposure**
   - Only expose on local network (0.0.0.0)
   - Don't port-forward from internet router

---

## Uninstallation

### Complete Removal

```bash
# 1. Stop and unload the service
launchctl stop com.user.maccontrol
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist

# 2. Remove the plist file
rm ~/Library/LaunchAgents/com.user.maccontrol.plist

# 3. (Optional) Remove the project directory
# WARNING: This will delete all project files
rm -rf ~/Developer/Projects/Mac-control-py

# 4. Verify removal
launchctl list | grep maccontrol
# Should return nothing
```

### Keep Files but Disable Auto-Start

```bash
# Just unload the service (keeps all files)
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist

# To re-enable later:
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
```

---

## Quick Reference Commands

```bash
# Start
launchctl start com.user.maccontrol

# Stop
launchctl stop com.user.maccontrol

# Restart
launchctl stop com.user.maccontrol && sleep 2 && launchctl start com.user.maccontrol

# Check status
launchctl list | grep maccontrol

# View logs
tail -f ~/Developer/Projects/Mac-control-py/logs/stdout.log

# Reload after config change
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl start com.user.maccontrol
```

---

## Additional Notes

- The service runs as your user account (not root)
- It starts automatically when you log in
- It will restart automatically if it crashes
- Logs are rotated automatically by the system
- No sudo required for normal operations

---

## Support

If you encounter issues:

1. Check logs in `~/Developer/Projects/Mac-control-py/logs/`
2. Verify all paths in the plist file
3. Test running manually: `.venv/bin/python run.py`
4. Check permissions for Camera, Automation, etc.
5. Review firewall settings

---

**You're all set! Your Mac Control application will now start automatically when you log in.** 🎉
