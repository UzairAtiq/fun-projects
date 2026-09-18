#!/bin/bash

# Face Shape Detector - Run Script
# Adds a small dependency check and optional auto-install for PySide6

set -e

echo "🎭 Starting Face Shape Detector..."
echo ""

# Activate virtual environment if present
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# Helper: print install suggestion
print_install_suggestion() {
    echo "To run the modern UI install: pip install PySide6"
    echo "Or to use the fallback legacy UI install: pip install customtkinter"
}

# Auto-install if requested
if [ "$1" = "--install" ]; then
    echo "Installing UI dependencies (PySide6 + optional customtkinter)..."
    python -m pip install --upgrade pip
    python -m pip install PySide6 customtkinter
fi

# Try running the modern UI; modern_ui.py has its own fallback logic
python modern_ui.py || {
    echo "\n⚠️  Running modern_ui.py failed."
    print_install_suggestion
    exit 1
}

# Deactivate when done
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi
