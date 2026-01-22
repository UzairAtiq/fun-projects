#!/usr/bin/env python3
"""
Face Shape Detector - Validation Test
Tests the redesigned system for accuracy and stability
"""

import cv2
import time
import sys

# Add parent directory to path
import os
sys.path.insert(0, os.path.dirname(__file__))

# Import our detector
from face_shape_detector import FaceShapeDetector

def test_detector():
    """
    Test the face shape detector with live camera feed
    Validates:
    - Camera access
    - Face detection
    - Classification stability
    - Temporal buffering
    """
    
    print("🧪 Face Shape Detector - Validation Test")
    print("=" * 60)
    print()
    
    # Initialize detector with debug mode
    print("Initializing detector with DEBUG MODE...")
    detector = FaceShapeDetector(debug_mode=True)
    
    # Open camera (using index 1 as configured)
    print("Opening camera (index 1)...")
    cap = cv2.VideoCapture(1)
    
    if not cap.isOpened():
        print("❌ ERROR: Could not open camera!")
        return False
    
    print("✅ Camera opened successfully")
    print()
    print("📸 Starting live detection test...")
    print("   - Position your face in front of the camera")
    print("   - Keep neutral expression")
    print("   - Wait for stable detection (~2 seconds)")
    print("   - Press 'q' to quit, 'd' to toggle debug overlay")
    print()
    
    show_debug = True
    detection_count = 0
    shape_history = []
    start_time = time.time()
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Failed to read frame")
            break
        
        # Flip for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Detect face shape
        shape, confidence, annotated_frame = detector.detect_face_shape(frame)
        
        if shape:
            detection_count += 1
            shape_history.append(shape)
            
            # Display info on frame
            info_text = f"Shape: {shape} ({confidence:.2%})"
            cv2.putText(frame, info_text, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Show buffer status
            buffer_status = f"Buffer: {detector.debug_info.get('buffer_size', 0)}/60"
            cv2.putText(frame, buffer_status, (10, 70),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            
            # Show stability info if available
            if detector.debug_info.get('stable_shape'):
                stable_text = f"STABLE: {detector.debug_info['stable_shape']}"
                cv2.putText(frame, stable_text, (10, 110),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Show appropriate frame
        display_frame = annotated_frame if (show_debug and shape) else frame
        cv2.imshow('Face Shape Detector - Validation Test', display_frame)
        
        # Key controls
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('d'):
            show_debug = not show_debug
            print(f"Debug overlay: {'ON' if show_debug else 'OFF'}")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    detector.cleanup()
    
    # Print test summary
    elapsed_time = time.time() - start_time
    print()
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Test duration: {elapsed_time:.1f} seconds")
    print(f"Frames with detection: {detection_count}")
    print(f"Detection rate: {detection_count/elapsed_time:.1f} FPS")
    print()
    
    if shape_history:
        from collections import Counter
        shape_counts = Counter(shape_history)
        print("Shape distribution:")
        for shape, count in shape_counts.most_common():
            percentage = (count / len(shape_history)) * 100
            print(f"  {shape:10s}: {count:4d} frames ({percentage:5.1f}%)")
        print()
        
        # Check stability
        most_common_shape, most_common_count = shape_counts.most_common(1)[0]
        stability = (most_common_count / len(shape_history)) * 100
        
        print(f"Stability: {stability:.1f}%")
        if stability >= 70:
            print("✅ PASS: Detection is stable (≥70%)")
        else:
            print("⚠️  WARNING: Detection is unstable (<70%)")
        print()
        
        print(f"Final classification: {most_common_shape}")
    
    print()
    print("✅ Test completed successfully!")
    return True

if __name__ == "__main__":
    try:
        success = test_detector()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
