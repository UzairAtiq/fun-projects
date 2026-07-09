# Logger - Cinematic Workout Tracking App

A modern, performance-optimized workout logging app with an intuitive digit-by-digit input system and haptic feedback.

## 🚀 Live Demo
Deployed on Vercel: [Your Vercel URL]

## 📱 Features
- Digit-by-digit weight and reps input with vertical slider
- Optimized for mobile performance (removed Framer Motion, uses GPU-accelerated CSS)
- Haptic feedback on Android devices
- Smart touch gesture detection
- Session storage for data persistence
- Beautiful glassmorphic UI design

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Native:** Capacitor (Android APK)
- **Deployment:** Vercel

## 📂 Project Structure
```
├── Cinematicworkoutlogger/    # Web app source code
│   ├── src/
│   ├── dist/                  # Build output
│   └── package.json
├── capacitor.config.json      # Capacitor configuration
├── vercel.json                # Vercel deployment config
└── package.json               # Root dependencies
```

## 🏗️ Development

### Web App
```bash
cd Cinematicworkoutlogger
npm install
npm run dev
```

### Build for Production
```bash
cd Cinematicworkoutlogger
npm run build
```

### Android APK
The Android native code is in a separate repository/folder.
See `../CinematicWorkoutLogger-Android/` for build instructions.

## 🚀 Deployment
This project is configured for automatic deployment on Vercel.
The `vercel.json` file points to the `Cinematicworkoutlogger` subdirectory.

## 📝 Recent Optimizations
- Removed Framer Motion for better mobile performance
- Implemented requestAnimationFrame throttling for smooth 60fps
- Hardware-accelerated CSS transforms with `translate3d`
- Simplified text shadows for GPU efficiency
- Throttled haptic feedback to prevent performance hits
- Reduced bundle size by ~100KB

## 📄 License
See LICENSE file for details.
