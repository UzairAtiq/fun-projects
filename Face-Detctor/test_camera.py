#!/usr/bin/env python3
"""
Advanced camera test - tries multiple camera indices
"""
import cv2
import sys

print("🎥 Testing camera access (trying multiple camera indices)...")
print()

# Try camera indices 0, 1, 2
for camera_index in range(3):
    print(f"Trying camera index {camera_index}...", end=" ")
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print("❌ Not available")
        continue
    
    # Try to read a frame
    ret, frame = cap.read()
    
    if not ret:
        print("⚠️  Opens but can't read frames")
        cap.release()
        continue
    
    print(f"✅ SUCCESS! Resolution: {frame.shape[1]}x{frame.shape[0]}")
    
    # Test a few more frames
    success_count = 0
    for i in range(10):
        ret, frame = cap.read()
        if ret:
            success_count += 1
    
    print(f"   Successfully captured {success_count}/10 test frames")
    cap.release()
    
    if success_count >= 8:
        print()
        print(f"✅ Working camera found at index {camera_index}!")
        print()
        print("To fix your Face Shape Detector:")
        if camera_index != 0:
            print(f"   Change line 363 in face_shape_detector.py:")
            print(f"   FROM: self.cap = cv2.VideoCapture(0)")
            print(f"   TO:   self.cap = cv2.VideoCapture({camera_index})")
        else:
            print("   Camera index 0 is working.")
            print("   Make sure you clicked 'Start Face Scan' button in the app.")
        sys.exit(0)

print()
print("❌ No working camera found!")
print()
print("Troubleshooting steps:")
print("1. Grant camera permissions:")
print("   System Settings → Privacy & Security → Camera")
print("   Enable access for 'Terminal'")
print()
print("2. Close other apps using the camera")
print()
print("3. Restart your Mac if the issue persists")
sys.exit(1)
