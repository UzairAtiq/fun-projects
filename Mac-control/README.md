# 🖥️ Mac Control

> A professional, secure Flask web application to remotely control your Mac from anywhere. Frontend hosted on Vercel, backend runs locally on your Mac.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)
![macOS](https://img.shields.io/badge/macOS-Sonoma+-purple.svg)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Architecture

**Split Deployment for Maximum Flexibility:**
- 🌐 **Frontend**: Hosted on Vercel → accessible from anywhere
- 🔐 **Backend**: Runs locally on Mac → secure and private
- 🔗 **Communication**: API calls over your network (or VPN)

## ✨ Features

- **📊 System Status Monitoring**
  - Real-time memory usage
  - Storage capacity and usage
  - Battery level and status
  - Running applications list

- **📸 Camera Control**
  - Capture photos from any connected camera
  - Support for multiple cameras
  - Automatic camera detection
  - Image enhancement for dark conditions

- **🔒 System Actions**
  - Lock screen remotely
  - Restart system with confirmation
  - Secure token-based authentication

- **🎨 Modern Web Interface**
  - Beautiful glassmorphism design
  - Fully responsive (mobile-friendly)
  - Dark theme optimized
  - Smooth animations and transitions

- **🚀 Auto-Start on Boot**
  - Runs automatically when Mac starts
  - Managed by macOS launchd
  - Auto-restart on crash
  - Comprehensive logging

## 📸 Screenshots

### Main Control Panel
Beautiful, modern interface with easy-to-use controls.

### System Status
Real-time monitoring of your Mac's vital statistics.

## 🏗️ Project Structure

```
Mac-control-py/
├── frontend/                    # Vercel frontend
│   ├── public/
│   │   ├── index.html           # Main control panel
│   │   ├── status.html          # System status page
│   │   └── settings.html        # Configuration page
│   ├── css/
│   │   └── style.css            # Glassmorphism styles
│   ├── js/
│   │   ├── config.js            # Settings management
│   │   ├── api.js               # API client
│   │   ├── main.js              # Main page logic
│   │   ├── status.js            # Status page logic
│   │   └── settings.js          # Settings page logic
│   ├── README.md                # Frontend docs
│   └── package.json             # npm config
├── app/                         # Flask backend
│   ├── __init__.py              # Application factory
│   ├── config.py                # Configuration management
│   ├── auth.py                  # Authentication module
│   ├── blueprints/              # Flask blueprints
│   │   ├── __init__.py
│   │   ├── main.py              # Main routes
│   │   ├── status.py            # System status endpoints
│   │   ├── camera.py            # Camera operations
│   │   └── actions.py           # System actions (lock, restart)
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── system_status.py     # System information gathering
│   │   ├── camera.py            # Camera operations
│   │   └── system_actions.py    # System control functions
│   ├── templates/               # Jinja2 templates (legacy)
│   │   ├── base.html            # Base template
│   │   ├── index.html           # Home page
│   │   ├── status.html          # Status page
│   │   └── error.html           # Error page
│   └── static/                  # Static assets (legacy)
│       ├── css/
│       │   └── style.css        # Main stylesheet
│       └── js/
│           └── main.js          # JavaScript utilities
├── logs/                        # Application logs
├── .venv/                       # Python virtual environment
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
├── vercel.json                  # Vercel configuration
├── com.user.maccontrol.plist    # launchd configuration
├── DEPLOYMENT_GUIDE.md          # Full deployment instructions
├── SETUP_GUIDE.md              # Detailed setup instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Option 1: Vercel Frontend + Local Backend (Recommended)

**For complete step-by-step instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

Quick summary:

1. **Setup Backend (Your Mac):**
   ```bash
   cd Mac-control-py
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python run.py
   ```

2. **Deploy Frontend (Vercel):**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   
   # Deploy to Vercel (one-click from dashboard)
   # Or: vercel --prod
   ```

3. **Configure:**
   - Open your Vercel URL
   - Go to Settings
   - Enter your Mac's IP and token
   - Save and start controlling!

### Option 2: Local Only Setup

# 2. Copy to LaunchAgents
cp com.user.maccontrol.plist ~/Library/LaunchAgents/

# 3. Load and start
launchctl load ~/Library/LaunchAgents/com.user.maccontrol.plist
launchctl start com.user.maccontrol
```

## 📱 Usage

### Web Interface

Navigate to your Mac Control URL and you'll see the main control panel with options to:

- **View System Status** - Monitor memory, storage, battery, and running apps
- **Take Photos** - Capture from default or Mac camera
- **List Cameras** - See all available cameras
- **Lock Screen** - Immediately lock your Mac
- **Restart** - Restart your system (with confirmation)

### API Endpoints

All endpoints require authentication via token (in header or query parameter).

#### System Status
```bash
# JSON response
curl -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/status/

# HTML response
curl http://localhost:8080/status/?token=YOUR-TOKEN
```

#### Camera Snapshot
```bash
# Default camera
curl -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/camera/ -o photo.jpg

# Specific camera
curl http://localhost:8080/camera/?token=YOUR-TOKEN&camera=1 -o photo.jpg
```

#### List Cameras
```bash
curl -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/camera/list
```

#### Lock Screen
```bash
curl -X POST -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/actions/lock
```

#### Restart System
```bash
curl -X POST -H "X-Auth-Token: YOUR-TOKEN" http://localhost:8080/actions/restart
```

## ⚙️ Configuration

### Environment Variables

Configure the application using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MAC_CONTROL_TOKEN` | `replace-this-token` | Authentication token (required) |
| `FLASK_HOST` | `0.0.0.0` | Host to bind to |
| `FLASK_PORT` | `8080` | Port number |
| `FLASK_DEBUG` | `False` | Debug mode (use False in production) |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DEFAULT_CAMERA_ID` | `0` | Default camera index |
| `MAX_APPS_DISPLAY` | `10` | Max apps to show in status |

### Setting Environment Variables

**Temporary (current session):**
```bash
export MAC_CONTROL_TOKEN="your-secure-token"
python run.py
```

**Permanent (in launchd plist):**
Edit `com.user.maccontrol.plist` and modify the `EnvironmentVariables` section.

**Using .env file (optional):**
Create a `.env` file in the project root (not recommended for production):
```bash
MAC_CONTROL_TOKEN=your-secure-token
FLASK_PORT=8080
```

## 🔒 Security

### Authentication

- All endpoints require a valid authentication token
- Token can be provided via:
  - HTTP header: `X-Auth-Token: YOUR-TOKEN`
  - Query parameter: `?token=YOUR-TOKEN`

### Best Practices

1. **Use a strong token**
   - Minimum 32 characters
   - Randomly generated
   - Never commit to version control

2. **Network security**
   - Use only on trusted networks
   - Don't expose to the internet
   - Consider VPN for remote access

3. **Regular updates**
   ```bash
   pip install --upgrade -r requirements.txt
   ```

4. **Monitor logs**
   ```bash
   tail -f logs/app.log
   ```

### macOS Permissions

Grant the following permissions for full functionality:

- **Camera** - System Settings → Privacy & Security → Camera
- **Automation** - System Settings → Privacy & Security → Automation
- **Accessibility** - System Settings → Privacy & Security → Accessibility (for lock screen)

## 📊 Monitoring & Logs

### Log Files

- **Application logs**: `logs/app.log`
- **Stdout logs**: `logs/stdout.log` (when using launchd)
- **Stderr logs**: `logs/stderr.log` (when using launchd)

### View Logs

```bash
# Real-time application logs
tail -f logs/app.log

# Last 50 lines
tail -50 logs/stderr.log

# Search for errors
grep "ERROR" logs/app.log

# Check unauthorized access attempts
grep "401" logs/app.log
```

### Service Status

```bash
# Check if service is running
launchctl list | grep maccontrol

# Check process
ps aux | grep run.py

# Check port
lsof -i :8080
```

## 🛠️ Development

### Running in Development Mode

```bash
# Activate virtual environment
source .venv/bin/activate

# Set debug mode
export FLASK_DEBUG=true

# Run
python run.py
```

### Project Architecture

- **Blueprints**: Each major feature is a separate blueprint (main, status, camera, actions)
- **Services**: Business logic separated from routes
- **Configuration**: Centralized in `app/config.py`
- **Authentication**: Token-based auth in `app/auth.py`
- **Templates**: Jinja2 templates with base template inheritance
- **Static files**: Modern CSS (glassmorphism) and vanilla JavaScript

### Adding New Features

1. Create service function in `app/services/`
2. Create blueprint route in `app/blueprints/`
3. Register blueprint in `app/__init__.py`
4. Create template in `app/templates/` (if needed)
5. Update documentation

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
- Check plist syntax: `plutil -lint ~/Library/LaunchAgents/com.user.maccontrol.plist`
- Verify Python path: `which python` (should be in .venv)
- Check logs: `cat logs/stderr.log`

**Can't access from phone:**
- Verify both devices on same Wi-Fi
- Check firewall settings
- Test with curl: `curl http://localhost:8080/?token=YOUR-TOKEN`

**Camera not working:**
- Grant Camera permission in System Settings
- Check available cameras: visit `/camera/list`
- Try different camera index

**Port already in use:**
- Change port: `export FLASK_PORT=8081`
- Or kill existing process: `lsof -ti:8080 | xargs kill`

For detailed troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting).

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions:
- Check the [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Review logs in `logs/` directory
- Open an issue on GitHub (if applicable)

## 🎉 Acknowledgments

- Built with Flask and OpenCV
- Designed for macOS Sonoma
- Modern UI inspired by glassmorphism design trends

---

**Made with ❤️ for Mac users who want secure remote control of their systems.**

---

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenCV Python Tutorials](https://docs.opencv.org/master/d6/d00/tutorial_py_root.html)
- [macOS launchd Documentation](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)
- [Complete Setup Guide](SETUP_GUIDE.md)

---

### Quick Command Reference

```bash
# Development
python run.py                                    # Run application
pip install -r requirements.txt                  # Install dependencies
python -c "import secrets; print(...)"           # Generate token

# Service Management
launchctl start com.user.maccontrol             # Start service
launchctl stop com.user.maccontrol              # Stop service
launchctl list | grep maccontrol                 # Check status

# Logs
tail -f logs/app.log                             # View logs
tail -f logs/stderr.log                          # View errors
grep "ERROR" logs/app.log                        # Search errors

# Network
ifconfig | grep "inet "                          # Get IP address
lsof -i :8080                                    # Check port usage
curl http://localhost:8080/?token=TOKEN          # Test endpoint
```

---

**Version 2.0** - Professional restructured version with modern UI and auto-start capability.
