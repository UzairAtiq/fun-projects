# 🎭 Face Shape Detector

A modern desktop application that detects your face shape in real-time using AI-powered facial landmark detection.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8.1-green.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.9-red.svg)

## ✨ Features

- **Real-time Face Detection**: Uses MediaPipe Face Mesh for accurate facial landmark detection
- **5 Face Shape Types**: Classifies faces into Oval, Round, Square, Heart, and Diamond
- **Modern UI**: Beautiful dark theme with smooth animations and a clean interface
- **Live Webcam Preview**: See yourself in real-time as the app analyzes your face
- **Stable Detection**: Waits for consistent results before displaying your face shape
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- Webcam access

### Setup Virtual Environment (Recommended)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install opencv-python mediapipe numpy customtkinter Pillow
```

## 🎯 Usage

### Option 1: Using the Run Script (Easiest)

```bash
./run.sh
```

The run script automatically activates the virtual environment and launches the app.

### Option 2: Manual Run

```bash
# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Run the application
python face_shape_detector.py
```

### Using the App

1. Click **"Start Face Scan"** to begin
2. Position your face in front of the camera
3. Wait a few seconds for stable detection
4. Your face shape will appear in the results panel

## 🧠 How It Works

### Face Shape Detection Logic

The application uses **MediaPipe Face Mesh** to detect 468 facial landmarks in real-time. It then calculates key facial measurements:

- **Face Length**: Distance from forehead (landmark 10) to chin (landmark 152)
- **Cheekbone Width**: Width at the cheekbones (landmarks 234-454)
- **Jaw Width**: Width of the jawline (landmarks 172-397)
- **Forehead Width**: Width of the forehead (landmarks 21-251)

### Classification Algorithm

Based on the calculated ratios, faces are classified into 5 shapes:

#### 1. **OVAL** 🥚
- Face length is 1.3-1.6x the cheekbone width
- Jaw width is 70-95% of cheekbone width
- Balanced and proportional features

#### 2. **ROUND** ⭕
- Face length is close to width (ratio < 1.3)
- Jaw width is >90% of cheekbone width
- Soft curves and fuller cheeks

#### 3. **SQUARE** ⬛
- Face length ≈ width (ratio < 1.3)
- Strong angular jaw (85-100% of cheekbone width)
- Forehead width >90% of cheekbone width

#### 4. **HEART** 💜
- Wide forehead (>100% of cheekbone width)
- Narrow chin (jaw <75% of cheekbone width)
- Pointed chin appearance

#### 5. **DIAMOND** 💎
- Wide cheekbones (dominant feature)
- Narrow forehead (<90% of cheekbone width)
- Narrow jaw (<85% of cheekbone width)

### Stability Algorithm

To prevent flickering and ensure accurate results:
- The app requires the same face shape to be detected for **10 consecutive frames**
- Only then will it update the displayed result
- This provides a smooth, stable user experience

## 🎨 UI Design

- **Dark Theme**: Easy on the eyes with a modern aesthetic
- **Purple/Blue Accent Colors**: Vibrant and professional
- **Rounded Cards**: Modern card-based layout
- **Real-time Status Updates**: See detection status as it happens
- **Responsive Layout**: Clean organization of camera and results

## 🛠️ Technical Stack

| Component | Technology |
|-----------|-----------|
| **Face Detection** | MediaPipe Face Mesh |
| **Computer Vision** | OpenCV |
| **UI Framework** | CustomTkinter |
| **Math & Calculations** | NumPy |
| **Image Processing** | Pillow |

## 📁 Project Structure

```
Project-1/
│
├── face_shape_detector.py  # Main application file
├── requirements.txt         # Python dependencies
├── run.sh                   # Convenient run script
├── .gitignore              # Git ignore rules
├── venv/                   # Virtual environment (not tracked)
└── README.md               # This file
```

## 🔧 Configuration

The app is configured for optimal performance:
- Camera resolution: 640x480 (can be adjusted in code)
- Detection confidence: 0.5 (MediaPipe threshold)
- Tracking confidence: 0.5 (MediaPipe threshold)
- Frame rate: ~30 FPS

## 🐛 Troubleshooting

**Camera not working?**
- Ensure your webcam is connected and not in use by another application
- Grant camera permissions if prompted by your OS

**Slow performance?**
- Close other camera applications
- Reduce the camera resolution in the code (line 350-351)

**Face not detected?**
- Ensure good lighting
- Position your face clearly in front of the camera
- Remove glasses or accessories that might obstruct facial landmarks

## 📝 License

MIT License - Feel free to use and modify!

## 👨‍💻 Author

**Uzair Atiq**
- Modern UI/UX design implementation
- Face shape classification algorithm

## 🙏 Acknowledgments

- **MediaPipe** by Google for the amazing face mesh technology
- **CustomTkinter** by Tom Schimansky for the modern UI framework

---

Made with ❤️ and Python
