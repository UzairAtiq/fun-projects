# 🚀 Quick Reference: Split Architecture Deployment

## One-Time Setup

### Backend (Your Mac)
```bash
# 1. Install dependencies
cd /Users/uzair/Developer/Projects/Mac-control-py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Setup auto-start
cp com.user.maccontrol.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl enable gui/$(id -u)/com.user.maccontrol

# 3. Start service
launchctl start com.user.maccontrol
```

### Frontend (GitHub + Vercel)
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Mac Control with Vercel frontend"
git remote add origin https://github.com/YOUR-USERNAME/mac-control-py.git
git push -u origin main

# 2. Deploy on Vercel
# Go to vercel.com → New Project → Import from GitHub
# Or use CLI: npm install -g vercel && vercel --prod
```

---

## Daily Usage

### Access Your Mac Control
1. Open: `https://your-project.vercel.app`
2. Go to **Settings** (first time only)
3. Enter:
   - **API URL**: `http://YOUR-MAC-IP:8080`
   - **Token**: Your secret token from `app/config.py`
4. Test connection and save
5. Use the control panel!

### Find Your Mac's IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## Maintenance Commands

### Backend Control
```bash
# Check status
launchctl list | grep maccontrol

# View logs
tail -f ~/Library/Logs/maccontrol.log

# Restart
launchctl restart com.user.maccontrol

# Stop
launchctl stop com.user.maccontrol

# Start
launchctl start com.user.maccontrol
```

### Update Frontend
```bash
# Make changes, then:
git add frontend/
git commit -m "Update frontend"
git push

# Vercel auto-deploys! ✨
```

### Update Backend
```bash
# Make changes, then:
source .venv/bin/activate
launchctl restart com.user.maccontrol
```

---

## Troubleshooting

### Connection Issues
```bash
# 1. Check Mac IP changed
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Test backend directly
curl http://YOUR-MAC-IP:8080/status \
  -H "X-Auth-Token: your-token"

# 3. Check firewall
# System Settings → Network → Firewall
# Allow Python connections

# 4. Restart backend
launchctl restart com.user.maccontrol
```

### CORS Errors
```bash
# Verify CORS is installed
source .venv/bin/activate
pip show Flask-CORS

# Check app/__init__.py has:
# from flask_cors import CORS
# CORS(app, origins='*', expose_headers=['X-Auth-Token'])

# Restart backend
launchctl restart com.user.maccontrol
```

---

## File Locations

**Configuration**:
- Backend config: `app/config.py`
- Frontend settings: Browser localStorage
- launchd plist: `~/Library/LaunchAgents/com.user.maccontrol.plist`

**Logs**:
- Backend logs: `~/Library/Logs/maccontrol.log`
- Vercel logs: Vercel Dashboard → Your Project → Logs

**Project**:
- Project root: `/Users/uzair/Developer/Projects/Mac-control-py`
- Frontend: `frontend/` directory
- Backend: `app/` directory

---

## Important URLs

- **Frontend (Vercel)**: `https://your-project.vercel.app`
- **Backend (Mac)**: `http://YOUR-MAC-IP:8080`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **GitHub Repo**: `https://github.com/YOUR-USERNAME/mac-control-py`

---

## Security Notes

✅ **Safe**:
- Settings stored locally in browser (localStorage)
- Token sent directly to your Mac (not through Vercel)
- Backend only accepts local network connections
- HTTPS on Vercel frontend

⚠️ **Be Careful**:
- Use on trusted networks only
- Don't share your token
- Keep your Mac's IP private
- Use VPN when accessing remotely

---

## Architecture Diagram

```
┌──────────────────────────────────────────┐
│         Vercel (CDN/Edge Network)        │
│                                          │
│  Frontend: HTML, CSS, JS                 │
│  - index.html (control panel)            │
│  - status.html (system status)           │
│  - settings.html (configuration)         │
└──────────────────┬───────────────────────┘
                   │
                   │ HTTPS
                   │
                   ▼
         ┌─────────────────┐
         │  Your Browser   │
         │  (Any Device)   │
         └────────┬────────┘
                  │
                  │ HTTP + X-Auth-Token
                  │ (Local Network / VPN)
                  │
                  ▼
         ┌────────────────────┐
         │    Your MacBook    │
         │                    │
         │  Flask Backend API │
         │  - Auto-starts     │
         │  - Port 8080       │
         │  - Local network   │
         └────────────────────┘
```

---

## Quick Links

📖 **Full Guides**:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Backend setup details
- [frontend/README.md](frontend/README.md) - Frontend docs

🌟 **Deploy Button**:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/Mac-control-py)

---

**Everything set up? Start controlling your Mac from anywhere! 🎉**
