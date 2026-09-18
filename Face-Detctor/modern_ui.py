"""Launcher wrapper: start the new PySide6 glassmorphism UI.

This file intentionally keeps the original file name so users can continue
running the app exactly as before:

    python modernui.py  # if present
    python modern_ui.py  # also supported

The launcher imports and runs the new `ui.main_window` MainWindow while keeping
all logic in `face_shape_detector.py` unchanged.
"""

import sys

# Try primary (PySide6) UI, fallback to legacy CTk UI if available
try:
    # Defer heavyweight imports to keep import-time light for tests
    from ui.main_window import main as pyside_main
    _LAUNCHER = 'pyside'
except Exception as e:
    pyside_main = None
    _pyside_err = e

legacy_main = None
try:
    from ui.legacy_ctk import main as legacy_main
except Exception:
    legacy_main = None

if pyside_main:
    if __name__ == '__main__':
        sys.exit(pyside_main())
else:
    print("Failed to import new UI (is PySide6 installed?). Error:", _pyside_err)
    if legacy_main:
        print("Falling back to legacy CustomTkinter UI (requires 'customtkinter').")
        if __name__ == '__main__':
            sys.exit(legacy_main())
    else:
        print("No usable UI found. To run the modern UI install: pip install PySide6")
        print("Or to use the fallback install: pip install customtkinter")
        sys.exit(1)
