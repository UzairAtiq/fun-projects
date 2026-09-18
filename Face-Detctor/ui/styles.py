# Styles and design tokens for the glassmorphism UI
# Colors chosen to be neutral/dark with one primary and one secondary accent

PRIMARY = "#5AA6FF"      # Soft blue accent (primary)
SECONDARY = "#7BCFA6"    # Soft green accent (secondary)
BG_TOP = "#0F1115"
BG_BOTTOM = "#181A20"
TEXT_MAIN = "#E6EEF4"
TEXT_SECOND = "#AAB6C2"

# Common QSS snippets
GLASS_FRAME = (
    "background: rgba(255, 255, 255, 0.08);"
    "border-radius: 18px;"
    "border: 1px solid rgba(255,255,255,0.08);"
)

BUTTON_QSS = (
    "QPushButton {"
    "  background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 rgba(255,255,255,0.02), stop:1 rgba(255,255,255,0.01));"
    "  color: %s;"
    "  padding: 10px 18px;"
    "  border-radius: 12px;"
    "  border: 1px solid rgba(255,255,255,0.06);"
    "}"
    "QPushButton:hover {"
    "  transform: scale(1.02);"
    "  background: rgba(255,255,255,0.03);"
    "}"
) % (TEXT_MAIN)

# Font choice: fall back to system default if Inter is not available
FONT_FAMILY = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
