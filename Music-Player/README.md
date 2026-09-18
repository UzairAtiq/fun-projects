# 🎵 Music Player + Mood-Based Playlist Generator

A production-ready music player web application with mood-based playlist generation powered by Spotify API.

## 🎨 Features

- **Spotify Integration**: OAuth authentication and playlist management
- **Mood-Based Playlists**: Generate playlists based on your current mood
- **Audio Visualizer**: Real-time canvas-based visualization
- **Glassmorphic UI**: Beautiful red & black themed interface
- **Smooth Animations**: Framer Motion powered transitions

## 🛠 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion
- React Query
- HTML Canvas + Web Audio API

### Backend
- Node.js + Express
- Spotify Web API
- OAuth 2.0

## 📦 Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
# Create .env files in both client/ and server/ directories
```

## 🚀 Development

```bash
# Run both client and server
npm run dev

# Run client only
npm run dev:client

# Run server only
npm run dev:server
```

## 📁 Project Structure

```
/client              # React frontend
  /components        # Reusable components
  /pages            # Page components
  /hooks            # Custom hooks
  /styles           # Global styles
  /visualizer       # Audio visualization
/server             # Node.js backend
  /routes           # API routes
  /services         # Business logic
  /utils            # Helper functions
```

## 🎨 Design Theme

- **Primary Colors**: Red (#ff1a1a) and Black
- **Style**: Glassmorphism with soft shadows
- **Layout**: Spotify-inspired sidebar + center view + sticky player

## 📝 License

MIT
