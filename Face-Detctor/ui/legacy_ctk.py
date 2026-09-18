"""Legacy CustomTkinter UI kept as an optional fallback.

This module re-uses the original CTk-based Hiface-style UI and exposes a
`main()` function so the launcher can use it when PySide6 is not available.
"""
import sys
import threading
import time
from PIL import Image, ImageDraw, ImageOps
import cv2

try:
    import customtkinter as ctk
except Exception:
    ctk = None

# Import detector lazily to avoid heavy imports at module load
from face_shape_detector import FaceShapeDetector


class HifaceStyleApp:
    def __init__(self):
        if ctk is None:
            raise RuntimeError("customtkinter is not installed")

        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")

        # Basic colors
        self.c_bg = "#000000"
        self.c_accent = "#00FF88"
        self.c_text_main = "#FFFFFF"

        self.window = ctk.CTk()
        self.window.title("Hiface - Face Shape AI (Legacy)")
        self.window.geometry("450x850")

        self.cap = None
        self.camera_running = False
        self.detector = FaceShapeDetector(debug_mode=False)

        self.setup_ui()
        self.start_camera()

    def setup_ui(self):
        self.main_container = ctk.CTkFrame(self.window, fg_color="transparent")
        self.main_container.pack(fill="both", expand=True, padx=20, pady=20)

        self.header_label = ctk.CTkLabel(self.main_container, text="Face Detector", font=("Arial", 20, "bold"))
        self.header_label.pack(pady=(10, 20))

        self.cam_frame = ctk.CTkFrame(self.main_container, width=200, height=200, corner_radius=100, fg_color="#222222")
        self.cam_frame.pack(pady=10)
        self.cam_frame.pack_propagate(False)

        self.cam_label = ctk.CTkLabel(self.cam_frame, text="")
        self.cam_label.place(relx=0.5, rely=0.5, anchor="center")

        self.score_badge = ctk.CTkFrame(self.main_container, fg_color="#222222", corner_radius=20, height=40, width=120)
        self.score_badge.pack(pady=(15, 20))
        self.score_label = ctk.CTkLabel(self.score_badge, text="Score: --", font=("Arial", 12))
        self.score_label.place(relx=0.5, rely=0.5, anchor="center")

        self.btn_cta = ctk.CTkButton(self.main_container, text="Discover Your Facial Potential")
        self.btn_cta.pack(fill="x", pady=(0, 20))

    def start_camera(self):
        self.camera_running = True
        try:
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(1)
        except Exception:
            self.cap = None

        thread = threading.Thread(target=self.camera_loop, daemon=True)
        thread.start()

    def camera_loop(self):
        while self.camera_running and self.cap:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.05)
                continue

            frame = cv2.flip(frame, 1)
            shape, conf, annotated = self.detector.detect_face_shape(frame)
            scores = self.detector.debug_info.get('scores', {})

            # Crop and resize for display
            h, w, _ = frame.shape
            min_dim = min(h, w)
            start_x = (w - min_dim) // 2
            start_y = (h - min_dim) // 2
            cropped = frame[start_y:start_y+min_dim, start_x:start_x+min_dim]
            cropped = cv2.resize(cropped, (200, 200))
            rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(rgb)

            # Circular mask
            mask = Image.new('L', (200, 200), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, 200, 200), fill=255)
            img_pil.putalpha(mask)

            ctk_img = ctk.CTkImage(light_image=img_pil, dark_image=img_pil, size=(200, 200))
            self.window.after(0, lambda i=ctk_img: self.cam_label.configure(image=i))

            if shape and scores:
                # Update some UI elements
                self.window.after(0, lambda s=shape, c=conf: self.update_stats(s, c))

            time.sleep(0.05)

    def update_stats(self, shape, conf):
        self.score_label.configure(text=f"Score: {int(70 + conf*30)}")

    def run(self):
        try:
            self.window.mainloop()
            return 0
        finally:
            self.camera_running = False
            if self.cap:
                self.cap.release()
            self.detector.cleanup()


def main():
    if ctk is None:
        print("Legacy fallback requires 'customtkinter' package. Install it with: pip install customtkinter")
        return 1

    app = HifaceStyleApp()
    return app.run()


if __name__ == '__main__':
    sys.exit(main())
