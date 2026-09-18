# 📋 Mac Control - Quick Reference Card

## 🚀 Getting Started

### First Time Setup
```bash
cd ~/Developer/Projects/Mac-control-py
./install.sh
```

### Manual Start
```bash
cd ~/Developer/Projects/Mac-control-py
source .venv/bin/activate
export MAC_CONTROL_TOKEN="your-token-here"
python run.py
```

---

## 🔑 Access URLs

### From Mac
```
http://localhost:8080/?token=YOUR-TOKEN
```

### From Phone (Same Wi-Fi)
```
http://YOUR-MAC-IP:8080/?token=YOUR-TOKEN
```

### Find Mac IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 🎛️ Service Control (Auto-Start)

### Start Service
```bash
launchctl start com.user.maccontrol
```

### Stop Service
```bash
launchctl stop com.user.maccontrol
```

### Check Status
```bash
launchctl list | grep maccontrol
```

### Restart Service
```bash
launchctl stop com.user.maccontrol && sleep 2 && launchctl start com.user.maccontrol
```

### Reload After Config Change
```bash
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl start com.user.maccontrol
```

---

## 📊 Monitoring

### View Real-Time Logs
```bash
tail -f ~/Developer/Projects/Mac-control-py/logs/app.log
tail -f ~/Developer/Projects/Mac-control-py/logs/stderr.log
```

### Check if Running
```bash
ps aux | grep run.py
lsof -i :8080
```

---

## 🔧 Maintenance

### Update Dependencies
```bash
cd ~/Developer/Projects/Mac-control-py
source .venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Generate New Token
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Test Application
```bash
cd ~/Developer/Projects/Mac-control-py
source .venv/bin/activate
python run.py
# Press Ctrl+C to stop
```

---

## 🌐 API Endpoints

### System Status (JSON)
```bash
curl -H "X-Auth-Token: TOKEN" http://localhost:8080/status/
```

### Camera Snapshot
```bash
curl http://localhost:8080/camera/?token=TOKEN -o photo.jpg
```

### List Cameras
```bash
curl http://localhost:8080/camera/list?token=TOKEN
```

### Lock Screen
```bash
curl -X POST http://localhost:8080/actions/lock?token=TOKEN
```

### Restart System
```bash
curl -X POST http://localhost:8080/actions/restart?token=TOKEN
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `run.py` | Main entry point |
| `requirements.txt` | Python dependencies |
| `com.user.maccontrol.plist` | Auto-start configuration |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `README.md` | Project documentation |
| `app/config.py` | Configuration settings |

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
cat ~/Developer/Projects/Mac-control-py/logs/stderr.log

# Verify plist syntax
plutil -lint ~/Library/LaunchAgents/com.user.maccontrol.plist

# Test manually
cd ~/Developer/Projects/Mac-control-py
.venv/bin/python run.py
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8080

# Kill the process
lsof -ti:8080 | xargs kill
```

### Can't Access from Phone
```bash
# Check firewall
# System Settings → Network → Firewall

# Verify same network
ping YOUR-MAC-IP
```

---

## ⚙️ Configuration

### Environment Variables (in plist)
- `MAC_CONTROL_TOKEN` - Authentication token (required)
- `FLASK_HOST` - Host to bind (default: 0.0.0.0)
- `FLASK_PORT` - Port number (default: 8080)
- `FLASK_DEBUG` - Debug mode (default: false)

### Edit Configuration
```bash
nano ~/Library/LaunchAgents/com.user.maccontrol.plist
# Make changes
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
```

---

## 🔒 Security Checklist

- [ ] Generated secure random token
- [ ] Token saved in password manager
- [ ] Plist file permissions set (644)
- [ ] Only using on trusted networks
- [ ] Camera permission granted
- [ ] Automation permission granted
- [ ] Firewall configured (if needed)

---

## 📚 Documentation

- **Full Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Project Info**: [README.md](README.md)
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Common Tasks

### Change Token
1. Generate new token
2. Edit `~/Library/LaunchAgents/com.user.maccontrol.plist`
3. Reload service

### Change Port
1. Edit plist, change FLASK_PORT
2. Reload service

### View Error Logs
```bash
tail -50 ~/Developer/Projects/Mac-control-py/logs/stderr.log
```

### Disable Auto-Start
```bash
launchctl unload ~/Library/LaunchAgents/com.user.maccontrol.plist
```

### Re-enable Auto-Start
```bash
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
```

---

## 🆘 Emergency Commands

### Stop Everything
```bash
launchctl stop com.user.maccontrol
pkill -f run.py
```

### Complete Restart
```bash
launchctl stop com.user.maccontrol
sleep 3
launchctl start com.user.maccontrol
sleep 3
launchctl list | grep maccontrol
```

### Check System Health
```bash
# Service status
launchctl list | grep maccontrol

# Process
ps aux | grep run.py

# Port
lsof -i :8080

# Logs
tail -20 ~/Developer/Projects/Mac-control-py/logs/stderr.log
```

---

**Keep this card handy for quick reference!** 📌

For detailed information, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
