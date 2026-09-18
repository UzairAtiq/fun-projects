"""Main window and UI logic using PySide6.

Design decisions:
- Use a central semi-transparent "glass" frame with rounded corners and a subtle shadow.
- Use a painted gradient background for a premium, neutral look.
- Use QThread to run camera capture and detection to keep UI responsive.
- Use QPropertyAnimation for smooth progress transitions and subtle hover effects.

Notes:
- The UI intentionally keeps behavior and data flow of existing detector intact.
- Camera index defaults to 0 (same as before). Tests that call OpenCV directly remain unaffected.
"""
from PySide6.QtCore import Qt, QThread, Signal, Slot, Property, QTimer, QEvent, QPropertyAnimation
from PySide6.QtGui import QPainter, QLinearGradient, QColor, QPixmap, QImage, QFont, QPainterPath
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout,
    QFrame, QPushButton, QGridLayout, QProgressBar, QSizePolicy, QGraphicsDropShadowEffect
)

import numpy as np
import cv2
import sys
import time

# Import design tokens
from .styles import PRIMARY, SECONDARY, BG_TOP, BG_BOTTOM, TEXT_MAIN, TEXT_SECOND, GLASS_FRAME, BUTTON_QSS, FONT_FAMILY

# Import detector
from face_shape_detector import FaceShapeDetector


class DetectorThread(QThread):
    """Background thread capturing frames and running detection."""
    frame_ready = Signal(object, str, float, dict)  # (QImage, shape, conf, scores)

    def __init__(self, camera_index=0, parent=None):
        super().__init__(parent)
        self.camera_index = camera_index
        self._running = True
        self.detector = FaceShapeDetector(debug_mode=True)

    def run(self):
        cap = cv2.VideoCapture(self.camera_index)
        if not cap.isOpened():
            # try fallback
            cap = cv2.VideoCapture(1)

        while self._running and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.05)
                continue

            frame = cv2.flip(frame, 1)
            shape, conf, annotated = self.detector.detect_face_shape(frame)
            scores = self.detector.debug_info.get('scores', {})

            # Convert frame to QImage for display
            h, w, ch = frame.shape
            bytes_per_line = ch * w
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = QImage(rgb.data, w, h, bytes_per_line, QImage.Format_RGB888).copy()

            self.frame_ready.emit(image, shape, conf, scores)
            self.msleep(30)

        cap.release()

    def stop(self):
        self._running = False
        self.wait(200)
        self.detector.cleanup()


class GlassFrame(QFrame):
    """A QFrame styled to approximate glassmorphism (translucent + border + shadow)."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet(GLASS_FRAME)
        # Drop shadow
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(22)
        shadow.setOffset(0, 10)
        shadow.setColor(QColor(0, 0, 0, 160))
        self.setGraphicsEffect(shadow)


class CircularLabel(QLabel):
    """A QLabel that displays a QPixmap cropped to a circle."""
    def setPixmap(self, pixmap: QPixmap):
        size = pixmap.size()
        mask = QPixmap(size)
        mask.fill(Qt.transparent)
        painter = QPainter(mask)
        painter.setRenderHint(QPainter.Antialiasing, True)
        path = QPainterPath()
        path.addEllipse(0, 0, size.width(), size.height())
        painter.fillPath(path, Qt.white)
        painter.end()

        pix = pixmap.copy()
        pix.setMask(mask.createMaskFromColor(Qt.transparent, Qt.MaskInColor))
        super().setPixmap(pix)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Face Shape — Glass UI")
        self.setMinimumSize(640, 760)
        self.setStyleSheet("QWidget{font-family: %s; color: %s;}" % (FONT_FAMILY, TEXT_MAIN))

        self.detector_thread = DetectorThread(camera_index=0)
        self.detector_thread.frame_ready.connect(self.on_frame_ready)

        self._build_ui()

        # Start thread
        self.detector_thread.start()

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)

        # Outer layout centers content
        outer_layout = QVBoxLayout(central)
        outer_layout.setContentsMargins(24, 24, 24, 24)
        outer_layout.setSpacing(16)
        outer_layout.setAlignment(Qt.AlignTop | Qt.AlignHCenter)

        title = QLabel("Face Shape Detector")
        title.setStyleSheet("font-size: 22px; font-weight: 700; color: %s;" % TEXT_MAIN)
        outer_layout.addWidget(title, alignment=Qt.AlignHCenter)

        # Glass container
        self.glass = GlassFrame()
        self.glass.setFixedWidth(560)
        self.glass.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

        glass_layout = QVBoxLayout(self.glass)
        glass_layout.setContentsMargins(20, 20, 20, 20)
        glass_layout.setSpacing(18)

        # Camera circle + score
        top_row = QHBoxLayout()
        top_row.setSpacing(16)

        self.cam_label = CircularLabel()
        self.cam_label.setFixedSize(180, 180)
        self.cam_label.setStyleSheet("background: rgba(0,0,0,0.12); border-radius: 90px;")
        top_row.addWidget(self.cam_label, alignment=Qt.AlignLeft)

        # Right side - result and score
        info_col = QVBoxLayout()
        info_col.setSpacing(6)

        self.result_label = QLabel("Scanning...")
        self.result_label.setStyleSheet("font-size: 28px; font-weight: 700;")
        info_col.addWidget(self.result_label)

        self.percent_label = QLabel("--%")
        self.percent_label.setStyleSheet("font-size: 20px; color: %s;" % TEXT_SECOND)
        info_col.addWidget(self.percent_label)

        # Progress bar style
        self.progress = QProgressBar()
        self.progress.setRange(0, 100)
        self.progress.setFixedHeight(12)
        self.progress.setStyleSheet(
            "QProgressBar{background: rgba(255,255,255,0.03); border-radius: 6px; border: none;}"
            "QProgressBar::chunk{background: %s; border-radius: 6px;}" % PRIMARY
        )
        info_col.addWidget(self.progress)

        # Score badge
        self.score_badge = QLabel("Score: --")
        self.score_badge.setStyleSheet("background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 12px; color: %s;" % TEXT_MAIN)
        info_col.addWidget(self.score_badge)

        top_row.addLayout(info_col)

        glass_layout.addLayout(top_row)

        # Grid of other shapes (2x2)
        grid = QGridLayout()
        grid.setSpacing(12)

        self.shape_widgets = []
        for i in range(4):
            w = QWidget()
            w.setStyleSheet("background: rgba(255,255,255,0.02); border-radius: 12px; padding: 12px;")
            layout = QVBoxLayout(w)
            layout.setContentsMargins(6, 6, 6, 6)
            lbl = QLabel("---")
            lbl.setStyleSheet("font-weight:600; font-size:13px; color: %s;" % TEXT_MAIN)
            pct = QLabel("--%")
            pct.setStyleSheet("color: %s; font-size:12px;" % TEXT_SECOND)
            pb = QProgressBar()
            pb.setRange(0, 100)
            pb.setValue(0)
            pb.setFixedHeight(8)
            pb.setStyleSheet(
                "QProgressBar{background: rgba(255,255,255,0.01); border-radius: 6px;}"
                "QProgressBar::chunk{background: %s; border-radius: 6px;}" % SECONDARY
            )
            layout.addWidget(lbl)
            layout.addWidget(pct)
            layout.addWidget(pb)
            grid.addWidget(w, i // 2, i % 2)
            self.shape_widgets.append((lbl, pct, pb))

        glass_layout.addLayout(grid)

        # CTA Button
        btn = QPushButton("Discover Your Facial Potential")
        btn.setStyleSheet(BUTTON_QSS)
        btn.setFixedHeight(44)
        btn.installEventFilter(self)
        glass_layout.addWidget(btn)

        outer_layout.addWidget(self.glass)

        # Footer small note
        foot = QLabel("Press Ctrl+Q to quit. Camera runs in background thread.")
        foot.setStyleSheet("color: %s; font-size:12px;" % TEXT_SECOND)
        outer_layout.addWidget(foot, alignment=Qt.AlignHCenter)

        # Keyboard shortcut for quitting
        QTimer.singleShot(0, self._finish_init)

    def _finish_init(self):
        self.resize(800, 920)

    def paintEvent(self, event):
        # Draw background gradient
        painter = QPainter(self)
        grad = QLinearGradient(0, 0, 0, self.height())
        grad.setColorAt(0.0, QColor(BG_TOP))
        grad.setColorAt(1.0, QColor(BG_BOTTOM))
        painter.fillRect(self.rect(), grad)

    @Slot(object, str, float, dict)
    def on_frame_ready(self, qimage, shape, conf, scores):
        # Update camera pixmap
        # Resize and crop to square for circular mask
        size = min(qimage.width(), qimage.height())
        img = qimage.scaled(180, 180, Qt.KeepAspectRatioByExpanding, Qt.SmoothTransformation)
        pix = QPixmap.fromImage(img)
        self.cam_label.setPixmap(pix)

        if shape:
            self.result_label.setText(shape.title())
            self.percent_label.setText(f"{int(conf*100)}%")
            # Animate progress smoothly
            self._animate_progress(int(conf*100))

            # Update secondary grid
            # Use top 4 other shapes
            other_shapes = [k for k in scores.keys() if k != shape]
            other_shapes.sort(key=lambda k: scores[k], reverse=True)
            for i in range(4):
                if i < len(other_shapes):
                    key = other_shapes[i]
                    val = scores[key]
                    lbl, pct, pb = self.shape_widgets[i]
                    lbl.setText(key.title())
                    pct.setText(f"{int(val*100)}%")
                    self._animate_pb(pb, int(val*100))
                else:
                    lbl, pct, pb = self.shape_widgets[i]
                    lbl.setText("---")
                    pct.setText("--%")
                    self._animate_pb(pb, 0)

            # Update score badge
            score = int(70 + (conf * 30))
            self.score_badge.setText(f"Score: {score}")

    def _animate_progress(self, target):
        anim = QPropertyAnimation(self.progress, b"value")
        anim.setDuration(350)
        anim.setStartValue(self.progress.value())
        anim.setEndValue(target)
        anim.start()

    def _animate_pb(self, pb: QProgressBar, target):
        anim = QPropertyAnimation(pb, b"value")
        anim.setDuration(350)
        anim.setStartValue(pb.value())
        anim.setEndValue(target)
        anim.start()

    def closeEvent(self, event):
        if hasattr(self, 'detector_thread'):
            self.detector_thread.stop()
        return super().closeEvent(event)


def main():
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    return app.exec()


if __name__ == '__main__':
    sys.exit(main())
