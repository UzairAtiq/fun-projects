"""
Face Shape Detection Application
=================================
A modern desktop application that detects face shapes in real-time using MediaPipe.

Required Libraries:
------------------
pip install opencv-python mediapipe numpy customtkinter Pillow

Face Shape Classification Logic:
--------------------------------
The application uses MediaPipe Face Mesh to detect 468 facial landmarks.
It then calculates key facial measurements:
- Face Length: Distance from forehead to chin
- Jaw Width: Width of the jawline
- Cheekbone Width: Width at the cheekbones
- Forehead Width: Width of the forehead

Based on these ratios, it classifies faces into:
- OVAL: Balanced proportions, face length > width, rounded jaw
- ROUND: Face length ≈ width, soft curves, fuller cheeks
- SQUARE: Face length ≈ width, strong angular jaw
- HEART: Wider forehead, narrow pointed chin
- DIAMOND: Wider cheekbones, narrow forehead and chin

Author: Uzair Atiq
"""

import cv2
import mediapipe as mp
import numpy as np
import customtkinter as ctk
from PIL import Image, ImageTk
import threading
import time


class FaceShapeDetector:
    """Handles face detection and shape classification logic"""
    
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Key landmark indices for face measurements
        # These are specific points on the face mesh
        self.FOREHEAD_TOP = 10
        self.CHIN_BOTTOM = 152
        self.LEFT_CHEEK = 234
        self.RIGHT_CHEEK = 454
        self.LEFT_JAW = 172
        self.RIGHT_JAW = 397
        self.LEFT_FOREHEAD = 21
        self.RIGHT_FOREHEAD = 251
        self.CHIN_TIP = 152
        self.LEFT_CHIN = 206
        self.RIGHT_CHIN = 426
        
    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def detect_face_shape(self, frame):
        """
        Detect face shape from a video frame
        Returns: (face_shape, confidence, landmarks_image)
        """
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return None, 0, frame
        
        # Get the first face landmarks
        face_landmarks = results.multi_face_landmarks[0]
        h, w, _ = frame.shape
        
        # Extract key points
        landmarks = []
        for landmark in face_landmarks.landmark:
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            landmarks.append((x, y))
        
        # Calculate facial measurements
        face_length = self.calculate_distance(
            landmarks[self.FOREHEAD_TOP],
            landmarks[self.CHIN_BOTTOM]
        )
        
        cheekbone_width = self.calculate_distance(
            landmarks[self.LEFT_CHEEK],
            landmarks[self.RIGHT_CHEEK]
        )
        
        jaw_width = self.calculate_distance(
            landmarks[self.LEFT_JAW],
            landmarks[self.RIGHT_JAW]
        )
        
        forehead_width = self.calculate_distance(
            landmarks[self.LEFT_FOREHEAD],
            landmarks[self.RIGHT_FOREHEAD]
        )
        
        chin_width = self.calculate_distance(
            landmarks[self.LEFT_CHIN],
            landmarks[self.RIGHT_CHIN]
        )
        
        # Calculate ratios
        face_ratio = face_length / cheekbone_width if cheekbone_width > 0 else 0
        jaw_to_cheek = jaw_width / cheekbone_width if cheekbone_width > 0 else 0
        forehead_to_cheek = forehead_width / cheekbone_width if cheekbone_width > 0 else 0
        chin_to_cheek = chin_width / cheekbone_width if cheekbone_width > 0 else 0
        
        # Classify face shape based on ratios
        face_shape = self.classify_shape(face_ratio, jaw_to_cheek, forehead_to_cheek, chin_to_cheek)
        
        # Draw landmarks for visualization (optional, can be toggled)
        annotated_frame = frame.copy()
        
        return face_shape, 0.85, annotated_frame
    
    def classify_shape(self, face_ratio, jaw_to_cheek, forehead_to_cheek, chin_to_cheek):
        """
        Classify face shape based on calculated ratios
        Enhanced algorithm with more accurate thresholds
        """
        # Calculate jawline tapering (how much the face narrows from jaw to chin)
        jaw_taper = jaw_to_cheek - chin_to_cheek
        
        # DIAMOND: Prominent cheekbones, narrow forehead AND narrow chin
        # Key feature: widest at cheeks, narrow at both top and bottom
        if (forehead_to_cheek < 0.92 and chin_to_cheek < 0.65 and 
            face_ratio >= 1.25):
            return "DIAMOND"
        
        # HEART: Wide forehead, narrow pointed chin
        # Key feature: widest at forehead, significant tapering to chin
        if (forehead_to_cheek >= 0.98 and chin_to_cheek < 0.70 and 
            jaw_taper > 0.15):
            return "HEART"
        
        # SQUARE: Nearly equal face length and width, strong angular jawline
        # Key feature: minimal tapering from jaw to chin, similar widths all around
        if (face_ratio < 1.25 and jaw_to_cheek >= 0.88 and 
            forehead_to_cheek >= 0.90 and jaw_taper < 0.12):
            return "SQUARE"
        
        # ROUND: Face length close to width, soft curves, fuller cheeks
        # Key feature: similar proportions all around, but softer jawline than square
        if (face_ratio < 1.20 and jaw_to_cheek >= 0.85 and 
            forehead_to_cheek >= 0.85):
            return "ROUND"
        
        # OVAL: Balanced proportions, face length > width, gently rounded features
        # Key feature: harmonious proportions, gentle tapering
        if (1.25 <= face_ratio <= 1.75 and 
            0.70 <= jaw_to_cheek <= 0.92 and
            0.85 <= forehead_to_cheek <= 1.05):
            return "OVAL"
        
        # Additional OVAL catch for borderline cases
        if (face_ratio >= 1.20 and 
            0.68 <= chin_to_cheek <= 0.80 and
            jaw_taper > 0.08 and jaw_taper < 0.20):
            return "OVAL"
        
        # Default: OVAL (most common face shape)
        # If measurements don't clearly match any category
        return "OVAL"
    
    def cleanup(self):
        """Release MediaPipe resources"""
        self.face_mesh.close()


class ModernFaceShapeApp:
    """Main application with modern UI"""
    
    def __init__(self):
        # Set appearance mode and color theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Create main window
        self.window = ctk.CTk()
        self.window.title("Face Shape Detector")
        self.window.geometry("1000x700")
        self.window.resizable(False, False)
        
        # Variables
        self.camera_running = False
        self.cap = None
        self.face_detector = FaceShapeDetector()
        self.current_face_shape = "Unknown"
        self.detection_stable_count = 0
        self.last_detected_shape = None
        
        # Color scheme - Modern purple/blue gradient
        self.accent_color = "#7C3AED"  # Purple
        self.secondary_color = "#3B82F6"  # Blue
        self.success_color = "#10B981"  # Green
        self.bg_dark = "#1F2937"
        self.card_bg = "#374151"
        
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the modern UI components"""
        
        # Main container
        self.main_frame = ctk.CTkFrame(self.window, fg_color="transparent")
        self.main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Title section
        title_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        title_frame.pack(fill="x", pady=(0, 20))
        
        title_label = ctk.CTkLabel(
            title_frame,
            text="✨ Face Shape Detector",
            font=("Inter", 32, "bold"),
            text_color="#FFFFFF"
        )
        title_label.pack()
        
        subtitle_label = ctk.CTkLabel(
            title_frame,
            text="Discover your face shape using AI-powered detection",
            font=("Inter", 14),
            text_color="#9CA3AF"
        )
        subtitle_label.pack(pady=(5, 0))
        
        # Content container (camera + results)
        content_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        content_frame.pack(fill="both", expand=True)
        
        # Left side - Camera preview
        camera_container = ctk.CTkFrame(
            content_frame,
            fg_color=self.card_bg,
            corner_radius=20
        )
        camera_container.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Camera label
        self.camera_label = ctk.CTkLabel(
            camera_container,
            text="",
            fg_color="#1F2937",
            corner_radius=15
        )
        self.camera_label.pack(padx=20, pady=20, fill="both", expand=True)
        
        # Placeholder text when camera is off
        self.placeholder_label = ctk.CTkLabel(
            self.camera_label,
            text="📷\n\nCamera is off\n\nClick 'Start Face Scan' to begin",
            font=("Inter", 18),
            text_color="#6B7280"
        )
        self.placeholder_label.place(relx=0.5, rely=0.5, anchor="center")
        
        # Right side - Results panel
        results_container = ctk.CTkFrame(
            content_frame,
            fg_color=self.card_bg,
            corner_radius=20,
            width=300
        )
        results_container.pack(side="right", fill="both", padx=(10, 0))
        results_container.pack_propagate(False)
        
        # Results header
        results_header = ctk.CTkLabel(
            results_container,
            text="Detection Results",
            font=("Inter", 20, "bold"),
            text_color="#FFFFFF"
        )
        results_header.pack(pady=(30, 20))
        
        # Face shape result card
        result_card = ctk.CTkFrame(
            results_container,
            fg_color=self.bg_dark,
            corner_radius=15
        )
        result_card.pack(padx=20, pady=10, fill="x")
        
        result_title = ctk.CTkLabel(
            result_card,
            text="Your Face Shape",
            font=("Inter", 12),
            text_color="#9CA3AF"
        )
        result_title.pack(pady=(15, 5))
        
        self.result_label = ctk.CTkLabel(
            result_card,
            text="UNKNOWN",
            font=("Inter", 28, "bold"),
            text_color=self.accent_color
        )
        self.result_label.pack(pady=(0, 15))
        
        # Status indicator
        self.status_label = ctk.CTkLabel(
            results_container,
            text="● Ready",
            font=("Inter", 14),
            text_color="#6B7280"
        )
        self.status_label.pack(pady=20)
        
        # Face shape info
        info_frame = ctk.CTkFrame(
            results_container,
            fg_color="transparent"
        )
        info_frame.pack(padx=20, pady=10, fill="both", expand=True)
        
        info_text = ctk.CTkTextbox(
            info_frame,
            font=("Inter", 12),
            fg_color=self.bg_dark,
            corner_radius=10,
            wrap="word"
        )
        info_text.pack(fill="both", expand=True)
        info_text.insert("1.0", 
            "Face Shape Types:\n\n"
            "• OVAL\n"
            "  Balanced proportions\n\n"
            "• ROUND\n"
            "  Soft, circular features\n\n"
            "• SQUARE\n"
            "  Strong, angular jaw\n\n"
            "• HEART\n"
            "  Wide forehead, pointed chin\n\n"
            "• DIAMOND\n"
            "  Wide cheeks, narrow forehead"
        )
        info_text.configure(state="disabled")
        
        # Control buttons
        button_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        button_frame.pack(fill="x", pady=(20, 0))
        
        self.start_button = ctk.CTkButton(
            button_frame,
            text="Start Face Scan",
            font=("Inter", 16, "bold"),
            height=50,
            corner_radius=15,
            fg_color=self.accent_color,
            hover_color="#6D28D9",
            command=self.toggle_camera
        )
        self.start_button.pack(side="left", expand=True, padx=(0, 5), fill="x")
        
        self.stop_button = ctk.CTkButton(
            button_frame,
            text="Stop Scan",
            font=("Inter", 16, "bold"),
            height=50,
            corner_radius=15,
            fg_color="#EF4444",
            hover_color="#DC2626",
            command=self.stop_camera,
            state="disabled"
        )
        self.stop_button.pack(side="right", expand=True, padx=(5, 0), fill="x")
        
    def toggle_camera(self):
        """Start the camera and detection"""
        if not self.camera_running:
            self.start_camera()
    
    def start_camera(self):
        """Initialize and start the webcam"""
        self.camera_running = True
        self.cap = cv2.VideoCapture(1)
        
        # Set camera resolution
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Update UI
        self.start_button.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self.placeholder_label.configure(text="")
        self.update_status("● Scanning...", "#3B82F6")
        
        # Start camera thread
        self.camera_thread = threading.Thread(target=self.process_camera, daemon=True)
        self.camera_thread.start()
    
    def stop_camera(self):
        """Stop the webcam and cleanup"""
        self.camera_running = False
        
        if self.cap:
            self.cap.release()
            self.cap = None
        
        # Update UI
        self.start_button.configure(state="normal")
        self.stop_button.configure(state="disabled")
        self.camera_label.configure(image="")
        self.placeholder_label.configure(
            text="📷\n\nCamera is off\n\nClick 'Start Face Scan' to begin"
        )
        self.update_status("● Ready", "#6B7280")
        self.detection_stable_count = 0
        
    def process_camera(self):
        """Process camera frames in a separate thread"""
        while self.camera_running and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            
            if not ret:
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Detect face shape
            face_shape, confidence, annotated_frame = self.face_detector.detect_face_shape(frame)
            
            if face_shape:
                # Stabilize detection (require same shape for 10 frames)
                if face_shape == self.last_detected_shape:
                    self.detection_stable_count += 1
                else:
                    self.detection_stable_count = 0
                    self.last_detected_shape = face_shape
                
                if self.detection_stable_count >= 10:
                    self.current_face_shape = face_shape
                    self.window.after(0, self.update_result, face_shape)
                    self.window.after(0, self.update_status, "● Face Detected", self.success_color)
            else:
                self.detection_stable_count = 0
                self.window.after(0, self.update_status, "● No Face Detected", "#F59E0B")
            
            # Convert frame to PhotoImage
            frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
            frame_resized = cv2.resize(frame_rgb, (640, 480))
            img = Image.fromarray(frame_resized)
            imgtk = ImageTk.PhotoImage(image=img)
            
            # Update camera display
            self.window.after(0, self.update_camera_display, imgtk)
            
            time.sleep(0.03)  # ~30 FPS
    
    def update_camera_display(self, imgtk):
        """Update the camera display label"""
        self.camera_label.configure(image=imgtk)
        self.camera_label.image = imgtk  # Keep a reference
    
    def update_result(self, face_shape):
        """Update the face shape result label"""
        self.result_label.configure(text=face_shape)
    
    def update_status(self, text, color):
        """Update the status indicator"""
        self.status_label.configure(text=text, text_color=color)
    
    def run(self):
        """Start the application"""
        self.window.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.window.mainloop()
    
    def on_closing(self):
        """Cleanup when closing the application"""
        self.stop_camera()
        self.face_detector.cleanup()
        self.window.destroy()


if __name__ == "__main__":
    app = ModernFaceShapeApp()
    app.run()
