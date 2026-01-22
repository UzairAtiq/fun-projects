#!/bin/bash

# Face Shape Detector - Run Script
# This script activates the virtual environment and runs the application

echo "🎭 Starting Face Shape Detector..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Run the application
python face_shape_detector.py

# Deactivate when done
deactivate
