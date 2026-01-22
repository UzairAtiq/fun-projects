# Quick Start Guide - Face Shape Detector

## 🚀 Get Started in 3 Steps

### Step 1: Setup Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- **opencv-python** - For webcam access
- **mediapipe** - For face detection
- **numpy** - For calculations
- **customtkinter** - For modern UI
- **Pillow** - For image processing

### Step 3: Run the App

```bash
# Easy way (macOS/Linux only)
./run.sh

# Manual way (all platforms)
python face_shape_detector.py
```

---

## 📸 How to Use the App

1. **Click "Start Face Scan"** - This will activate your webcam
2. **Position your face** - Make sure your entire face is visible
3. **Wait a moment** - The app needs ~3 seconds for stable detection
4. **See your result** - Your face shape will appear on the right panel

---

## 🎯 Face Shape Types You Might Get

- **OVAL** 🥚 - Balanced, classic proportions
- **ROUND** ⭕ - Soft, circular features
- **SQUARE** ⬛ - Strong, angular jawline
- **HEART** 💜 - Wide forehead, pointed chin
- **DIAMOND** 💎 - Prominent cheekbones

---

## 💡 Tips for Best Results

✅ **DO:**
- Use good lighting (ideally from the front)
- Look directly at the camera
- Keep your face centered in the frame
- Wait for the detection to stabilize

❌ **DON'T:**
- Use in very dark environments
- Cover your face with hands or objects
- Move too quickly
- Position your face at extreme angles

---

## 🐛 Quick Troubleshooting

**Problem:** Camera not working
**Solution:** Check if another app is using the webcam, grant camera permission

**Problem:** No face detected
**Solution:** Improve lighting, remove glasses/hat, position face centered

**Problem:** Slow performance
**Solution:** Close other applications, especially video apps

---

## 🎨 UI Controls

| Button | Action |
|--------|--------|
| **Start Face Scan** | Turns on camera and begins detection |
| **Stop Scan** | Stops camera and resets app |

---

## 📊 How It Works (Simple Version)

The app:
1. Uses your webcam to capture video
2. Finds 468 points on your face using AI
3. Measures distances between key points
4. Calculates ratios (length vs width, jaw vs cheekbones, etc.)
5. Classifies your face shape based on these ratios

All of this happens **locally on your computer** - no internet needed!

---

## ⌨️ Keyboard Shortcuts

Currently, there are no keyboard shortcuts. Use the buttons in the UI.

---

## 🔄 Want to Try Again?

Click **Stop Scan** and then **Start Face Scan** again. The app will reset and give you a fresh detection.

---

**Made with ❤️ and Python**
