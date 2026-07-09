# 🚀 Deployment Guide - Vercel + Local Backend

## Overview

This setup splits Mac Control into two parts:
- **Frontend (GUI)**: Hosted on Vercel → accessible from anywhere
- **Backend (Python API)**: Runs locally on your Mac → secure and private

## Architecture

```
┌─────────────┐          ┌──────────────────┐
│   Vercel    │  API     │   Your Mac       │
│  (Frontend) │ ─────>   │   (Backend)      │
│  HTML/CSS/JS│  Calls   │   Flask + Python │
└─────────────┘          └──────────────────┘
```

---

## Part 1: Backend Setup (Your Mac)

### 1.1 Install Dependencies

```bash
cd /Users/uzair/Developer/Projects/Mac-control-py

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 1.2 Configure Auto-Start

```bash
# Copy launchd configuration
cp com.user.maccontrol.plist ~/Library/LaunchAgents/

# Load the service
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist

# Enable auto-start on login
launchctl enable gui/$(id -u)/com.user.maccontrol
```

### 1.3 Start the Server

```bash
# Manual start (for testing)
source .venv/bin/activate
python run.py

# Or let launchd start it automatically
launchctl start com.user.maccontrol
```

The server will run on: `http://YOUR-MAC-IP:8080`

### 1.4 Find Your Mac's IP Address

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Save this IP address - you'll need it for the frontend configuration.

### 1.5 Get Your Authentication Token

Check the configuration in `app/config.py`:

```python
AUTH_TOKEN = 'your-secret-token-here'
```

---

## Part 2: Frontend Setup (Vercel)

### 2.1 Push to GitHub

```bash
cd /Users/uzair/Developer/Projects/Mac-control-py

# Initialize git (if not already done)
git init

# Add frontend files
git add frontend/
git add vercel.json
git add README.md

# Commit
git commit -m "Add Vercel frontend"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/mac-control-py.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your `mac-control-py` repository
5. Configure:
   - **Root Directory**: Leave empty (project root)
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: `frontend/public`
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/uzair/Developer/Projects/Mac-control-py
vercel --prod
```

### 2.3 Get Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://mac-control-py.vercel.app
```

---

## Part 3: Configure the Frontend

### 3.1 Open Settings Page

1. Go to your Vercel URL: `https://mac-control-py.vercel.app`
2. Click **Settings** in the navigation

### 3.2 Enter Configuration

**API URL**: `http://YOUR-MAC-IP:8080`
- Example: `http://192.168.1.13:8080`
- Use the IP address you found in Part 1.4

**Authentication Token**: Your token from `app/config.py`
- Example: `your-secret-token-here`

### 3.3 Test Connection

1. Click **Test Connection**
2. Should show: ✅ "Connection successful!"
3. Click **Save Settings**

---

## Part 4: Usage

### Access from Anywhere

1. Open `https://mac-control-py.vercel.app` on any device
2. Make sure you're on the same network as your Mac (or use VPN)
3. The settings are saved in your browser's localStorage
4. Use the control panel to:
   - View system status
   - Capture photos
   - Lock screen
   - Restart Mac

### Important Notes

⚠️ **Network Requirements**:
- Your device must be on the same network as your Mac
- Or use a VPN to access your home network
- The backend only accepts connections from your local network (security)

🔒 **Security**:
- Settings are stored locally in your browser (never on Vercel)
- Token is sent directly to your Mac (not through Vercel)
- Backend uses token authentication
- CORS configured to allow Vercel domain

---

## Troubleshooting

### Backend Not Starting

```bash
# Check if service is running
launchctl list | grep maccontrol

# View logs
tail -f ~/Library/Logs/maccontrol.log

# Restart service
launchctl stop com.user.maccontrol
launchctl start com.user.maccontrol
```

### Frontend Can't Connect

1. **Check your Mac's IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Verify backend is running**:
   ```bash
   curl http://YOUR-MAC-IP:8080/status \
     -H "X-Auth-Token: your-token"
   ```

3. **Check firewall settings**:
   - System Settings → Network → Firewall
   - Allow incoming connections for Python

4. **Verify you're on the same network**:
   - Your device and Mac must be on the same WiFi/network

### CORS Errors

If you see CORS errors in browser console:

1. Check `app/__init__.py` has CORS configured:
   ```python
   from flask_cors import CORS
   CORS(app, origins='*', expose_headers=['X-Auth-Token'])
   ```

2. Restart the backend:
   ```bash
   launchctl restart com.user.maccontrol
   ```

### Settings Not Saving

1. Clear browser cache
2. Check browser console for errors (F12)
3. Try a different browser
4. Verify localStorage is enabled in browser settings

---

## Advanced: Custom Domain

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `maccontrol.yourdomain.com`
3. Add the CNAME record to your DNS provider:
   ```
   CNAME maccontrol cname.vercel-dns.com
   ```

4. Update the configuration in Settings page with your Mac's IP

---

## Updating

### Update Frontend

```bash
cd /Users/uzair/Developer/Projects/Mac-control-py

# Make changes to frontend files
# Then commit and push

git add frontend/
git commit -m "Update frontend"
git push

# Vercel auto-deploys on push!
```

### Update Backend

```bash
cd /Users/uzair/Developer/Projects/Mac-control-py

# Make changes to backend files
source .venv/bin/activate

# Restart the service
launchctl restart com.user.maccontrol
```

---

## Uninstalling

### Remove Backend

```bash
# Stop service
launchctl stop com.user.maccontrol

# Disable auto-start
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist

# Remove files
rm ~/Library/LaunchAgents/com.user.maccontrol.plist
rm -rf /Users/uzair/Developer/Projects/Mac-control-py
```

### Remove Frontend

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Delete Project

---

## Summary

✅ **Backend**: Auto-starts on Mac boot, runs Flask API locally
✅ **Frontend**: Hosted on Vercel, accessible from anywhere
✅ **Security**: Token authentication, local network only
✅ **Configuration**: Stored in browser localStorage
✅ **Updates**: Push to GitHub → Vercel auto-deploys

**Your Mac Control is now accessible from anywhere! 🎉**
