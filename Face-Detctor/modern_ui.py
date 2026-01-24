import customtkinter as ctk
from PIL import Image, ImageDraw, ImageOps
import cv2
import threading
import time
import numpy as np

# Import the logic class
from face_shape_detector import FaceShapeDetector

class HifaceStyleApp:
    """
    Hiface-inspired UI for Face Shape Detection.
    Vertical layout, dark theme, green accents.
    """
    
    def __init__(self):
        # Set appearance
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")
        
        # Colors
        self.c_bg = "#000000"       # Pure Black
        self.c_card = "#121212"     # Very dark grey for cards
        self.c_accent = "#00FF88"   # Neon Green
        self.c_text_main = "#FFFFFF"
        self.c_text_sec = "#888888"
        self.c_bar_bg = "#333333"
        
        # Window setup - Phone aspect ratio
        self.window = ctk.CTk()
        self.window.title("Hiface - Face Shape AI")
        self.window.geometry("450x850") # Phone-like dimensions
        self.window.configure(fg_color=self.c_bg)
        self.window.resizable(True, True)
        
        # Logic Variables
        self.camera_running = False
        self.cap = None
        self.detector = FaceShapeDetector(debug_mode=False)
        self.current_scores = {}
        self.current_shape = "Scanning..."
        self.detection_stable_count = 0
        self.last_detected_shape = None
        
        # UI Setup
        self.setup_ui()
        
        # Start Camera automatically
        self.start_camera()
        
    def setup_ui(self):
        # Background Image
        try:
            bg_img = Image.open("glass_bg.png")
            # Resize to cover window (simulated cover)
            # We'll just make it big enough
            bg_img = ImageOps.fit(bg_img, (800, 1000))
            self.bg_image = ctk.CTkImage(bg_img, size=(800, 1000))
            self.bg_label = ctk.CTkLabel(self.window, image=self.bg_image, text="")
            self.bg_label.place(x=0, y=0, relwidth=1, relheight=1)
        except Exception as e:
            print(f"Bg error: {e}")
            pass

        # MAIN CONTAINER (Transparent)
        self.main_container = ctk.CTkFrame(
            self.window, 
            fg_color="transparent", 
            corner_radius=0
        )
        self.main_container.pack(fill="both", expand=True, padx=20, pady=20)
        
        # 1. HEADER
        self.header_label = ctk.CTkLabel(
            self.main_container,
            text="Face Detector",
            font=("Chalkboard SE", 24, "bold"),
            text_color=self.c_text_main
        )
        self.header_label.pack(pady=(10, 20))
        
        # 2. CAMERA / FACE SECTION
        self.cam_frame = ctk.CTkFrame(
            self.main_container,
            width=200,
            height=200,
            corner_radius=100, # Circular
            fg_color="#222222",
            border_width=2,
            border_color=self.c_accent
        )
        self.cam_frame.pack(pady=10)
        self.cam_frame.pack_propagate(False) # Force size
        
        self.cam_label = ctk.CTkLabel(self.cam_frame, text="")
        self.cam_label.place(relx=0.5, rely=0.5, anchor="center")
        
        # Score Badge
        self.score_badge = ctk.CTkFrame(
            self.main_container,
            fg_color="#222222",
            border_width=1,
            border_color="#555555",
            corner_radius=20,
            height=40,
            width=120
        )
        self.score_badge.pack(pady=(15, 20))
        
        self.score_label = ctk.CTkLabel(
            self.score_badge,
            text="Score: --",
            font=("Arial", 16, "bold"),
            text_color=self.c_text_main
        )
        self.score_label.place(relx=0.5, rely=0.5, anchor="center")
        
        # 3. STATS CARD (Main Bento Content)
        # Glass effect: Dark semi-transparent color (simulated) + Border
        self.stats_card = ctk.CTkFrame(
            self.main_container,
            fg_color="#1A1A1A", # Dark semi-translucent look
            bg_color="transparent",
            corner_radius=30,
            border_width=1,
            border_color="rgba(255, 255, 255, 0.2)" if False else "#444444" # Tkinter doesn't support rgba border hex easily
        )
        self.stats_card.configure(border_color="#555555")
        self.stats_card.pack(fill="both", expand=True, padx=0, pady=10)
        
        # "Your Face Shape" Title
        ctk.CTkLabel(
            self.stats_card,
            text="Your Face Shape",
            font=("Arial", 12, "bold"),
            text_color="#666666"
        ).pack(anchor="w", padx=20, pady=(20, 5))
        
        # Main Result Row
        self.main_result_frame = ctk.CTkFrame(self.stats_card, fg_color="transparent")
        self.main_result_frame.pack(fill="x", padx=20, pady=0)
        
        self.main_shape_label = ctk.CTkLabel(
            self.main_result_frame,
            text="Scanning...",
            font=("Arial", 28, "bold"),
            text_color=self.c_text_main
        )
        self.main_shape_label.pack(side="left")
        
        self.main_percent_label = ctk.CTkLabel(
            self.main_result_frame,
            text="--%",
            font=("Arial", 28, "bold"),
            text_color=self.c_text_sec  # Or white? Ref shows white
        )
        self.main_percent_label.pack(side="right")
        
        # Main Progress Bar
        self.main_progress_bg = ctk.CTkFrame(
            self.stats_card,
            fg_color=self.c_bar_bg,
            height=12,
            corner_radius=6
        )
        self.main_progress_bg.pack(fill="x", padx=20, pady=(10, 25))
        
        self.main_progress_fill = ctk.CTkFrame(
            self.main_progress_bg,
            fg_color=self.c_accent,
            height=12,
            corner_radius=6,
            width=0 # Start empty
        )
        self.main_progress_fill.pack(side="left") # Will update width
        
        # Grid for other shapes
        self.grid_frame = ctk.CTkFrame(self.stats_card, fg_color="transparent")
        self.grid_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        
        self.shape_rows = {} # To store references to update them
        
        # Reference has 2 columns. We have 5 shapes total. 
        # Detector returns: OVAL, ROUND, SQUARE, HEART, DIAMOND.
        # We'll display all 5 (or detection logic's full list).
        
        shapes = ["OVAL", "HEART", "SQUARE", "ROUND"] # Diamond is often main, but we'll dynamic sort
        # Actually, let's just pre-build slots for 2 columns x 2 rows (remaining 4 shapes)
        
        self.grid_frame.grid_columnconfigure(0, weight=1)
        self.grid_frame.grid_columnconfigure(1, weight=1)
        
        # We will create placeholders that we update dynamically
        self.grid_items = []
        for i in range(4): # 4 slots
            row = i // 2
            col = i % 2
            
            item_frame = ctk.CTkFrame(self.grid_frame, fg_color="transparent")
            item_frame.grid(row=row, column=col, sticky="nsew", padx=10, pady=10)
            
            # Label & Percent
            header = ctk.CTkFrame(item_frame, fg_color="transparent")
            header.pack(fill="x")
            
            lbl = ctk.CTkLabel(
                header, 
                text="---", 
                font=("Arial", 14, "bold"), 
                text_color=self.c_text_main
            )
            lbl.pack(side="left")
            
            pct = ctk.CTkLabel(
                header, 
                text="--%", 
                font=("Arial", 12), 
                text_color=self.c_text_sec
            )
            pct.pack(side="right")
            
            # Mini Bar
            bar_bg = ctk.CTkFrame(item_frame, fg_color=self.c_bar_bg, height=6, corner_radius=3)
            bar_bg.pack(fill="x", pady=(5, 0))
            
            bar_fill = ctk.CTkFrame(bar_bg, fg_color=self.c_accent, height=6, corner_radius=3, width=0)
            bar_fill.pack(side="left")
            
            self.grid_items.append({
                "label": lbl,
                "pct": pct,
                "bar_fill": bar_fill,
                "frame": item_frame
            })
            
        # 4. BOTTOM ACTION & SOCIALS
        self.bottom_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.bottom_frame.pack(fill="x", pady=0)
        
        # CTA Button
        self.btn_cta = ctk.CTkButton(
            self.bottom_frame,
            text="Discover Your Facial Potential",
            font=("Arial", 14, "bold"),
            fg_color="transparent",
            text_color="#FFFFFF",
            border_width=1,
            border_color="#444444",
            height=50,
            corner_radius=25,
            hover_color="#222222"
        )
        self.btn_cta.pack(fill="x", pady=(0, 20))
        
        # Social Icons
        socials_frame = ctk.CTkFrame(self.bottom_frame, fg_color="transparent")
        socials_frame.pack(fill="x")
        
        icons = ["📷", "🐦", "🎵", "👻", "💬", "💾"]
        colors = ["#E1306C", "#1DA1F2", "#FFFFFF", "#FFFC00", "#25D366", "#888888"] # Approx brand colors
        
        # Center the icons
        socials_frame.grid_columnconfigure(tuple(range(len(icons))), weight=1)
        
        for i, (icon, color) in enumerate(zip(icons, colors)):
            btn = ctk.CTkButton(
                socials_frame,
                text=icon,
                font=("Arial", 16),
                width=40,
                height=40,
                corner_radius=12,
                fg_color="#1A1A1A",
                text_color=color, # Icon color
                hover_color="#333333"
            )
            btn.grid(row=0, column=i, padx=2)

    def start_camera(self):
        self.camera_running = True
        try:
            self.cap = cv2.VideoCapture(0) # 0 is usually default
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(1)
        except:
            self.cap = None
        
        thread = threading.Thread(target=self.camera_loop, daemon=True)
        thread.start()
        
    def camera_loop(self):
        while self.camera_running and self.cap:
            ret, frame = self.cap.read()
            if not ret: break
            
            frame = cv2.flip(frame, 1)
            
            # Detect
            shape, conf, _ = self.detector.detect_face_shape(frame)
            
            if not self.detector.debug_mode:
                self.detector.debug_mode = True # Enable to capture internal scores
            
            # Get data
            scores = self.detector.debug_info.get('scores', {})
            
            # Update UI Data
            if shape and scores:
                self.window.after(0, lambda s=shape, c=conf, sc=scores: self.update_stats(s, c, sc))
            
            # Crop to circle for display
            h, w, _ = frame.shape
            min_dim = min(h, w)
            start_x = (w - min_dim) // 2
            start_y = (h - min_dim) // 2
            cropped = frame[start_y:start_y+min_dim, start_x:start_x+min_dim]
            
            # Resize
            cropped = cv2.resize(cropped, (200, 200))
            
            # Convert to PIL
            rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(rgb)
            
            # Create circular mask
            mask = Image.new('L', (200, 200), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, 200, 200), fill=255)
            
            # Apply mask
            img_output = ImageOps.fit(img_pil, (200, 200), centering=(0.5, 0.5))
            img_output.putalpha(mask)
            
            # Create CTkImage
            ctk_img = ctk.CTkImage(light_image=img_output, dark_image=img_output, size=(200, 200))
            
            self.window.after(0, lambda i=ctk_img: self.cam_label.configure(image=i))
            
            time.sleep(0.05)

    def update_stats(self, shape, conf, scores):
        # Update Main Shape
        self.main_shape_label.configure(text=shape.title())
        self.main_percent_label.configure(text=f"{int(conf*100)}%")
        
        # Animate Main Bar (Fake animation by setting width simply)
        # Width of parent is dynamic, so we can't hardcode pixels easily without simpler relwidth?
        # CTk doesn't support relwidth in pack easily for nested frames without place.
        # But we can update the `width` property if we use place, or pack logic.
        # Simple hack: Main bar max width ~350px.
        bar_width = int(conf * 300) 
        self.main_progress_fill.configure(width=bar_width)
        
        # Update Grid
        # Sort scores to find the non-main ones
        # scores is dict: {'OVAL': 0.8, ...}
        
        # Remove the main shape from the list to show in grid
        other_shapes = [k for k in scores.keys() if k != shape]
        # Sort by score descending
        other_shapes.sort(key=lambda k: scores[k], reverse=True)
        
        # Take top 4
        for i, key in enumerate(other_shapes[:4]):
            val = scores[key]
            pct = int(val * 100)
            
            item = self.grid_items[i]
            item["label"].configure(text=key.title())
            item["pct"].configure(text=f"{pct}%")
            
            # Bar width (max ~130px in grid)
            w = int(val * 120)
            item["bar_fill"].configure(width=w)
            
        # Update Score Badge (Fake "Beauty Score" based on confidence/symmetry proxy)
        # We don't have real beauty score, use specific metric or just confidence map
        # Let's map confidence 0.5-0.9 to 70-98
        score = int(70 + (conf * 30))
        self.score_label.configure(text=f"Score: {score}")

    def run(self):
        self.window.mainloop()

if __name__ == "__main__":
    app = HifaceStyleApp()
    app.run()
