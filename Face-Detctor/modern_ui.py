import customtkinter as ctk
from PIL import Image, ImageTk
import cv2
import threading
import time
import numpy as np

# Import the logic class from the other file (or we can duplicate it for now to be self-contained)
# For now, let's assume we can import it, or I'll just copy the FaceShapeDetector class here 
# to ensure this file is standalone during dev.

from face_shape_detector import FaceShapeDetector

class AnimeStyleApp:
    """
    Main application with Anime Dashboard Style UI
    Dark, rounded, bento-grid layout.
    """
    
    def __init__(self):
        # Set appearance
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")
        
        # Colors (based on the reference image - red anime theme)
        self.c_bg = "#0D0D0D"       # Main Background (almost black)
        self.c_card = "#1A1A1A"     # Card Background (dark gray)
        self.c_accent = "#DC143C"   # Crimson Red Accent
        self.c_secondary = "#8B0000" # Dark Red Secondary
        self.c_text = "#FFFFFF"     # White Text
        self.c_text_dim = "#8A8A8A" # Dim Text
        self.c_hover = "#2A2A2A"    # Hover state
        
        # Window setup
        self.window = ctk.CTk()
        self.window.title("Face Shape Detector - Anime Edition")
        self.window.geometry("1100x700")
        self.window.configure(fg_color=self.c_bg)
        self.window.resizable(False, False)
        
        # Logic Variables
        self.camera_running = False
        self.cap = None
        self.debug_mode = False
        self.face_detector = FaceShapeDetector(debug_mode=self.debug_mode)
        self.current_face_shape = "Unknown"
        self.detection_stable_count = 0
        self.last_detected_shape = None
        
        # Setup Layout
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the Bento-Grid Layout"""
        # Configure Grid
        self.window.grid_columnconfigure(0, weight=0) # Sidebar
        self.window.grid_columnconfigure(1, weight=1) # Main Content
        self.window.grid_rowconfigure(0, weight=1)
        
        # --- SIDEBAR (Left) ---
        self.sidebar = ctk.CTkFrame(
            self.window, 
            width=100, # Slim sidebar like the concept
            corner_radius=30, 
            fg_color="transparent" # The cards themselves will be the background
        )
        self.sidebar.grid(row=0, column=0, sticky="nsew", padx=(20, 10), pady=20)
        
        # Sidebar is actually a column of cards
        
        # 1. Navigation Pill-Card (Top Left)
        self.card_nav = ctk.CTkFrame(
            self.sidebar, 
            width=90,
            height=320, 
            corner_radius=40, 
            fg_color=self.c_card
        )
        self.card_nav.pack(fill="x", pady=(0, 10))
        self.card_nav.pack_propagate(False) # Respect height
        
        # Icons
        self.create_icon_btn(self.card_nav, "🌀", True) # Logo
        self.create_icon_btn(self.card_nav, "🏠", False) # Home
        self.create_icon_btn(self.card_nav, "★", False)  # Favorites
        self.create_icon_btn(self.card_nav, "⚙️", False) # Settings

        # 2. Profile Card (Middle Left)
        self.card_profile = ctk.CTkFrame(
            self.sidebar,
            width=90,
            height=140,
            corner_radius=40,
            fg_color=self.c_card
        )
        self.card_profile.pack(fill="x", pady=10)
        self.card_profile.pack_propagate(False)
        
        # Avatar
        self.avatar = ctk.CTkLabel(
            self.card_profile,
            text="👤",
            font=("Arial", 30),
            width=50,
            height=50,
            fg_color="#333333",
            corner_radius=25
        )
        self.avatar.place(relx=0.5, rely=0.4, anchor="center")
        
        lbl_prof = ctk.CTkLabel(self.card_profile, text="PROFILE", font=("Arial", 10, "bold"), text_color=self.c_text_dim)
        lbl_prof.place(relx=0.5, rely=0.8, anchor="center")

        # 3. Socials/Chat (Bottom Left)
        self.card_socials = ctk.CTkFrame(
            self.sidebar,
            width=90,
            height=150,
            corner_radius=40,
            fg_color=self.c_card
        )
        self.card_socials.pack(fill="x", pady=10)
        self.card_socials.pack_propagate(False)
        
        # --- MAIN DASHBOARD (Right) ---
        self.main_area = ctk.CTkFrame(
            self.window, 
            corner_radius=40, 
            fg_color="transparent" # Cards will provide background
        )
        self.main_area.grid(row=0, column=1, sticky="nsew", padx=(0, 20), pady=20)
        
        # We need a large "Hero" card
        self.hero_card = ctk.CTkFrame(
            self.main_area,
            fg_color=self.c_card,
            corner_radius=40
        )
        self.hero_card.pack(fill="both", expand=True)
        
        # Top Navigation inside Hero
        self.build_top_nav()
        
        # Hero Content
        self.build_hero_content()
        
    def create_icon_btn(self, parent, icon, active):
        """Helper for sidebar icons"""
        color = self.c_text if active else self.c_text_dim
        btn = ctk.CTkButton(
            parent,
            text=icon,
            font=("Arial", 24),
            fg_color="transparent",
            text_color=color,
            hover_color="#333333",
            width=50,
            height=50,
            corner_radius=25
        )
        btn.pack(pady=15)
        return btn

    def build_top_nav(self):
        """Tab navigation at top"""
        nav_frame = ctk.CTkFrame(self.hero_card, fg_color="transparent", height=50)
        nav_frame.pack(fill="x", pady=20)
        
        tabs = ["ANIME", "MANGA", "CHAT"]
        for t in tabs:
            btn = ctk.CTkButton(
                nav_frame,
                text=t,
                font=("Arial", 12, "bold"),
                fg_color="transparent",
                text_color=self.c_text_dim,
                hover_color=self.c_card,
                width=60
            )
            btn.pack(side="top", padx=20, anchor="n") # Just pack them centered essentially
            # Real centering is harder with pack, let's use a center frame
            
        # Refined centering:
        # Just use a label for now to simulate the look
        self.lbl_nav = ctk.CTkLabel(
            self.hero_card, 
            text="   ".join(tabs),
            font=("Arial", 12, "bold"),
            text_color=self.c_text_dim
        )
        self.lbl_nav.place(relx=0.5, rely=0.08, anchor="center")

    def build_hero_content(self):
        """Builds the main graphic and the start button card"""
        
        # 1. Main Title / Graphic Placeholder
        # Since we can't generate the anime girl image easily, we use a gradient/color block
        # or just a cool title
        
        self.hero_graphic = ctk.CTkFrame(
            self.hero_card,
            fg_color="#2A2A2A", # Slightly lighter than card
            corner_radius=30,
            width=600,
            height=400
        )
        self.hero_graphic.place(relx=0.5, rely=0.45, anchor="center")
        
        # Title inside graphic
        self.lbl_title = ctk.CTkLabel(
            self.hero_graphic,
            text="FACE SHAPE\nDETECTOR",
            font=("Arial", 64, "bold"),
            text_color="#333333" # Subtle watermark style
        )
        self.lbl_title.place(relx=0.5, rely=0.5, anchor="center")
        
        # Real Title Overlay
        self.lbl_real_title = ctk.CTkLabel(
            self.hero_card,
            text="Face Shape\nAnalysis AI",
            font=("Arial", 42, "bold"),
            text_color="white",
            justify="left"
        )
        self.lbl_real_title.place(relx=0.1, rely=0.3)
        
        # Date / Info Badge (Similar to 'New Episode')
        self.date_badge = ctk.CTkFrame(
            self.hero_card, 
            fg_color="#181818", # Solid color
            corner_radius=20,
            width=140, height=90
        )
        # Hack for transparency simulation -> use card color
        self.date_badge.configure(fg_color="#181818")
        self.date_badge.place(relx=0.85, rely=0.25, anchor="center")
        
        ctk.CTkLabel(self.date_badge, text="NEW UPDATE", font=("Arial", 10), text_color="#AAAAAA").place(relx=0.5, rely=0.3, anchor="center")
        ctk.CTkLabel(self.date_badge, text="v2.0", font=("Arial", 28, "bold"), text_color="white").place(relx=0.5, rely=0.6, anchor="center")

        # 2. "CONTINUE" / START Card (Bottom Right floating)
        self.start_card = ctk.CTkFrame(
            self.hero_card,
            width=280,
            height=120,
            fg_color="#181818", # Dark contrast
            corner_radius=40
        )
        self.start_card.place(relx=0.85, rely=0.8, anchor="center")
        
        # "CONTINUE" text
        ctk.CTkLabel(
            self.start_card, 
            text="START SCAN", 
            font=("Arial", 12, "bold"), 
            text_color="gray"
        ).place(relx=0.3, rely=0.5, anchor="center")
        
        # Play Button (Round)
        self.btn_play = ctk.CTkButton(
            self.start_card,
            text="▶",
            font=("Arial", 24),
            width=70,
            height=70,
            corner_radius=35,
            fg_color="white", # Based on image play button
            text_color="black",
            hover_color="#DDDDDD",
            command=self.open_camera_overlay
        )
        self.btn_play.place(relx=0.75, rely=0.5, anchor="center")

    def open_camera_overlay(self):
        """
        Pops up the camera overlay with animation
        """
        # Create a top-level window or a frame overlay
        self.overlay = ctk.CTkFrame(
            self.window,
            fg_color="#000000", 
            corner_radius=0
        )
        self.overlay.place(relx=0.5, rely=0.5, relwidth=0, relheight=0, anchor="center")
        self.overlay.lift()
        
        # Animate Expansion
        def animate_open(w=0, h=0):
            if w < 1.0:
                w += 0.1
                h += 0.1
                self.overlay.place(relx=0.5, rely=0.5, relwidth=w, relheight=h, anchor="center")
                self.window.after(10, lambda: animate_open(w, h))
            else:
                self.finish_overlay_setup()
        
        animate_open()

    def finish_overlay_setup(self):
        """After animation, place contents"""
        # Close button
        self.btn_close = ctk.CTkButton(
            self.overlay,
            text="✕",
            font=("Arial", 24),
            width=50,
            height=50,
            corner_radius=25,
            fg_color="#333333",
            hover_color="red",
            command=self.close_overlay
        )
        self.btn_close.place(relx=0.95, rely=0.05, anchor="ne")
        
        # Camera Area
        self.cam_frame = ctk.CTkFrame(
            self.overlay,
            width=640,
            height=480,
            corner_radius=30,
            fg_color="#111111"
        )
        self.cam_frame.place(relx=0.5, rely=0.4, anchor="center")
        
        self.lbl_cam = ctk.CTkLabel(self.cam_frame, text="Loading Camera...", text_color="white")
        self.lbl_cam.place(relx=0.5, rely=0.5, anchor="center")
        
        # Result Area
        self.lbl_result = ctk.CTkLabel(
            self.overlay,
            text="Analyzing...",
            font=("Arial", 32, "bold"),
            text_color=self.c_accent
        )
        self.lbl_result.place(relx=0.5, rely=0.8, anchor="center")
        
        # Start Camera
        self.start_camera()
        
    def close_overlay(self):
        self.stop_camera()
        # Animate Close
        def animate_close(w=1.0, h=1.0):
            if w > 0.1:
                w -= 0.1
                h -= 0.1
                # Ensure widget exists before configuring
                try:
                    self.overlay.place(relx=0.5, rely=0.5, relwidth=w, relheight=h, anchor="center")
                    self.window.after(10, lambda: animate_close(w, h))
                except:
                    pass
            else:
                self.overlay.destroy()
        
        animate_close()
        
    def start_camera(self):
        self.camera_running = True
        try:
            self.cap = cv2.VideoCapture(1) # Try Index 1 first
            if not self.cap.isOpened():
                raise Exception("Cam 1 failed")
        except:
            print("Camera 1 failed, trying 0...")
            self.cap = cv2.VideoCapture(0) # Fallback to 0
        
        thread = threading.Thread(target=self.camera_loop, daemon=True)
        thread.start()
        
    def stop_camera(self):
        self.camera_running = False
        if self.cap:
            self.cap.release()
            
    def camera_loop(self):
        while self.camera_running and self.cap:
            ret, frame = self.cap.read()
            if not ret: break
            
            frame = cv2.flip(frame, 1)
            
            # Detect
            shape, conf, annotated = self.face_detector.detect_face_shape(frame)
            
            # Update UI
            if shape:
                self.window.after(0, lambda s=shape: self.lbl_result.configure(text=s))
            
            # Display
            rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb)
            imgtk = ImageTk.PhotoImage(image=img)
            
            self.window.after(0, lambda i=imgtk: self.update_cam_label(i))
            time.sleep(0.03)
            
    def update_cam_label(self, imgtk):
        try:
            self.lbl_cam.configure(image=imgtk, text="")
        except:
            pass # Window might be closed

    def run(self):
        self.window.mainloop()

if __name__ == "__main__":
    app = AnimeStyleApp()
    app.run()
