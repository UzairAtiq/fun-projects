# Mac Control Frontend

Modern web interface for Mac Control - deployed on Vercel.

## Features

- Control your Mac remotely
- View system status
- Capture photos
- Lock screen & restart
- Beautiful glassmorphism UI

## Tech Stack

- Pure HTML, CSS, JavaScript (no framework needed!)
- localStorage for settings
- Fetch API for backend communication

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/Mac-control-py)

Or manually:

```bash
npm install -g vercel
vercel
```

## Configuration

1. Deploy to Vercel
2. Open the deployed URL
3. Go to Settings
4. Enter your Mac's IP and authentication token
5. Test connection and save

## Security

- All settings stored locally in browser
- Direct connection to your Mac (not through Vercel)
- Token never sent to Vercel servers
- Use only on trusted networks

## Backend

The backend runs locally on your Mac. See the main README for setup instructions.
