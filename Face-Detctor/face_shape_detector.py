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
    """
    Advanced face shape detection with normalization, temporal stabilization,
    and confidence scoring
    """
    
    def __init__(self, debug_mode=False):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # PRECISE MediaPipe landmark indices (based on 468-point mesh)
        self.LANDMARKS = {
            'face_top': 10,
            'chin': 152,
            'jaw_left': 234,
            'jaw_right': 454,
            'cheekbone_left': 93,
            'cheekbone_right': 323,
            'forehead_left': 103,
            'forehead_right': 332,
            'left_eye': 33,
            'right_eye': 263,
            'nose_bridge': 168,
            # Additional jaw angle points
            'jaw_left_angle': 172,
            'jaw_right_angle': 397,
            'chin_left': 206,
            'chin_right': 426,
        }
        
        # Temporal stabilization: rolling buffer for 60 frames (~2 seconds at 30fps)
        self.BUFFER_SIZE = 60
        self.measurement_buffer = []
        self.shape_buffer = []
        
        # Debug mode
        self.debug_mode = debug_mode
        self.debug_info = {}
        
    def normalize_landmarks(self, landmarks, h, w):
        """
        Normalize face landmarks by:
        1. Translating face center to (0,0)
        2. Scaling by inter-pupillary distance (IPD)
        
        This removes camera distance bias
        """
        # Get eye positions for IPD calculation
        left_eye = landmarks[self.LANDMARKS['left_eye']]
        right_eye = landmarks[self.LANDMARKS['right_eye']]
        
        # Calculate IPD (inter-pupillary distance)
        ipd = np.sqrt((right_eye.x - left_eye.x)**2 + (right_eye.y - left_eye.y)**2)
        
        # Calculate face center (midpoint between eyes)
        center_x = (left_eye.x + right_eye.x) / 2
        center_y = (left_eye.y + right_eye.y) / 2
        
        # Normalize all landmarks
        normalized = []
        for landmark in landmarks:
            # Translate to center
            norm_x = (landmark.x - center_x) / ipd if ipd > 0 else 0
            norm_y = (landmark.y - center_y) / ipd if ipd > 0 else 0
            
            # Convert to pixel coordinates for measurements
            pixel_x = int(norm_x * w + w/2)
            pixel_y = int(norm_y * h + h/2)
            normalized.append((pixel_x, pixel_y, norm_x, norm_y))
        
        return normalized
    
    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two normalized points"""
        return np.sqrt((point1[2] - point2[2])**2 + (point1[3] - point2[3])**2)
    
    def calculate_angle(self, p1, p2, p3):
        """
        Calculate angle at p2 formed by p1-p2-p3
        Returns angle in degrees
        """
        # Vectors
        v1 = np.array([p1[2] - p2[2], p1[3] - p2[3]])
        v2 = np.array([p3[2] - p2[2], p3[3] - p2[3]])
        
        # Angle calculation
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    def calculate_comprehensive_measurements(self, normalized_landmarks):
        """
        Calculate all required measurements:
        - Vertical: face height
        - Horizontal: jaw, cheekbone, forehead widths
        - Angles: jaw angles, chin curvature
        """
        L = self.LANDMARKS
        
        # Get key points
        face_top = normalized_landmarks[L['face_top']]
        chin = normalized_landmarks[L['chin']]
        jaw_left = normalized_landmarks[L['jaw_left']]
        jaw_right = normalized_landmarks[L['jaw_right']]
        cheek_left = normalized_landmarks[L['cheekbone_left']]
        cheek_right = normalized_landmarks[L['cheekbone_right']]
        forehead_left = normalized_landmarks[L['forehead_left']]
        forehead_right = normalized_landmarks[L['forehead_right']]
        jaw_angle_left = normalized_landmarks[L['jaw_left_angle']]
        jaw_angle_right = normalized_landmarks[L['jaw_right_angle']]
        
        # VERTICAL MEASUREMENTS
        face_height = self.calculate_distance(face_top, chin)
        
        # HORIZONTAL MEASUREMENTS
        jaw_width = self.calculate_distance(jaw_left, jaw_right)
        cheekbone_width = self.calculate_distance(cheek_left, cheek_right)
        forehead_width = self.calculate_distance(forehead_left, forehead_right)
        
        # ANGLE MEASUREMENTS
        # Left jaw angle: angle at jaw corner
        jaw_angle_left_deg = self.calculate_angle(cheek_left, jaw_angle_left, chin)
        # Right jaw angle
        jaw_angle_right_deg = self.calculate_angle(cheek_right, jaw_angle_right, chin)
        # Average jaw angle
        avg_jaw_angle = (jaw_angle_left_deg + jaw_angle_right_deg) / 2
        
        # Chin curvature (lower angle = sharper chin)
        chin_curvature = self.calculate_angle(jaw_left, chin, jaw_right)
        
        measurements = {
            'face_height': face_height,
            'jaw_width': jaw_width,
            'cheekbone_width': cheekbone_width,
            'forehead_width': forehead_width,
            'jaw_angle': avg_jaw_angle,
            'chin_curvature': chin_curvature,
        }
        
        return measurements
    
    def calculate_ratios(self, measurements):
        """
        Calculate stable ratios from measurements
        """
        m = measurements
        cheek = m['cheekbone_width']
        
        if cheek == 0:
            return None
        
        ratios = {
            'face_aspect': m['face_height'] / cheek,
            'jaw_ratio': m['jaw_width'] / cheek,
            'forehead_ratio': m['forehead_width'] / cheek,
            'taper_ratio': m['forehead_width'] / m['jaw_width'] if m['jaw_width'] > 0 else 0,
            'jaw_angle': m['jaw_angle'],
            'chin_curvature': m['chin_curvature'],
        }
        
        return ratios
    
    def classify_with_confidence(self, ratios):
        """
        Classify face shape with confidence scoring
        Returns: (shape, confidence, scores_dict)
        """
        if ratios is None:
            return "UNKNOWN", 0.0, {}
        
        # Initialize scores for each shape
        scores = {
            'OVAL': 0.0,
            'ROUND': 0.0,
            'SQUARE': 0.0,
            'HEART': 0.0,
            'DIAMOND': 0.0,
        }
        
        r = ratios
        
        # OVAL SCORING
        # Balanced proportions, face length > width, gently rounded
        if 1.45 <= r['face_aspect'] <= 1.75:
            scores['OVAL'] += 0.35
        if 0.75 <= r['jaw_ratio'] <= 0.90:
            scores['OVAL'] += 0.25
        if 0.90 <= r['forehead_ratio'] <= 1.05:
            scores['OVAL'] += 0.20
        if 100 <= r['jaw_angle'] <= 130:
            scores['OVAL'] += 0.20
        
        # ROUND SCORING
        # Face aspect low, similar widths all around
        if r['face_aspect'] < 1.25:
            scores['ROUND'] += 0.35
        if 0.85 <= r['jaw_ratio'] <= 1.00:
            scores['ROUND'] += 0.25
        if 0.85 <= r['forehead_ratio'] <= 1.00:
            scores['ROUND'] += 0.20
        if r['chin_curvature'] > 140:
            scores['ROUND'] += 0.20
        
        # SQUARE SCORING
        # Low aspect, wide jaw, sharp angles
        if 1.20 <= r['face_aspect'] <= 1.35:
            scores['SQUARE'] += 0.30
        if r['jaw_ratio'] >= 0.95:
            scores['SQUARE'] += 0.25
        if 0.90 <= r['forehead_ratio'] <= 1.05:
            scores['SQUARE'] += 0.20
        if 85 <= r['jaw_angle'] <= 105:
            scores['SQUARE'] += 0.25
        
        # HEART SCORING
        # Wide forehead, narrow jaw, sharp chin
        if r['forehead_ratio'] > 1.05:
            scores['HEART'] += 0.30
        if r['jaw_ratio'] < 0.85:
            scores['HEART'] += 0.25
        if r['taper_ratio'] > 1.15:
            scores['HEART'] += 0.25
        if r['chin_curvature'] < 120:
            scores['HEART'] += 0.20
        
        # DIAMOND SCORING
        # Cheekbones widest, narrow forehead AND jaw
        if r['forehead_ratio'] < 0.92:
            scores['DIAMOND'] += 0.25
        if r['jaw_ratio'] < 0.85:
            scores['DIAMOND'] += 0.25
        if r['face_aspect'] >= 1.25:
            scores['DIAMOND'] += 0.25
        if 95 <= r['jaw_angle'] <= 115:
            scores['DIAMOND'] += 0.25
        
        # Find best match
        best_shape = max(scores, key=scores.get)
        best_score = scores[best_shape]
        
        # Get runner-up
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        runner_up_score = sorted_scores[1][1] if len(sorted_scores) > 1 else 0
        
        # Only return classification if confident (more realistic thresholds)
        # best_score >= 0.50 (was 0.70 - too strict)
        # difference >= 0.10 (was 0.15 - too strict)
        if best_score - runner_up_score >= 0.10 and best_score >= 0.50:
            return best_shape, best_score, scores
        else:
            return "UNCLEAR", best_score, scores
    
    def temporal_stabilization(self, current_shape, current_confidence):
        """
        Use temporal buffer for stable results
        Only update if shape is stable for >= 1.5 seconds
        """
        # Add to buffer
        self.shape_buffer.append((current_shape, current_confidence))
        
        # Keep buffer size limited
        if len(self.shape_buffer) > self.BUFFER_SIZE:
            self.shape_buffer.pop(0)
        
        # Need at least 45 frames (1.5 seconds at 30fps)
        if len(self.shape_buffer) < 45:
            return None, 0.0
        
        # Majority voting on recent frames
        recent_shapes = [s[0] for s in self.shape_buffer[-45:]]
        recent_confidences = [s[1] for s in self.shape_buffer[-45:]]
        
        # Count occurrences
        from collections import Counter
        shape_counts = Counter(recent_shapes)
        
        # Get most common shape
        most_common_shape, count = shape_counts.most_common(1)[0]
        
        # Calculate stability (what % of frames agree)
        stability = count / len(recent_shapes)
        
        # Only return if stability >= 60% and average confidence >= 50%
        avg_confidence = np.mean(recent_confidences)
        
        if stability >= 0.60 and avg_confidence >= 0.50:
            return most_common_shape, avg_confidence
        else:
            return None, 0.0
    
    def detect_face_shape(self, frame):
        """
        Main detection pipeline with full processing
        Returns: (face_shape, confidence, annotated_frame)
        """
        h, w, _ = frame.shape
        
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return None, 0, frame
        
        # Get landmarks
        face_landmarks = results.multi_face_landmarks[0].landmark
        
        # Normalize landmarks
        normalized_landmarks = self.normalize_landmarks(face_landmarks, h, w)
        
        # Calculate measurements
        measurements = self.calculate_comprehensive_measurements(normalized_landmarks)
        
        # Calculate ratios
        ratios = self.calculate_ratios(measurements)
        
        # Classify with confidence
        instant_shape, instant_confidence, scores = self.classify_with_confidence(ratios)
        
        # Apply temporal stabilization
        stable_shape, stable_confidence = self.temporal_stabilization(instant_shape, instant_confidence)
        
        # Store debug info
        if self.debug_mode:
            self.debug_info = {
                'measurements': measurements,
                'ratios': ratios,
                'instant_shape': instant_shape,
                'instant_confidence': instant_confidence,
                'scores': scores,
                'stable_shape': stable_shape,
                'stable_confidence': stable_confidence,
                'buffer_size': len(self.shape_buffer),
            }
        
        # Create annotated frame
        annotated_frame = self.draw_debug_overlay(frame, normalized_landmarks) if self.debug_mode else frame.copy()
        
        # Return stabilized result or instant if not yet stable
        final_shape = stable_shape if stable_shape else instant_shape
        final_confidence = stable_confidence if stable_shape else instant_confidence
        
        return final_shape, final_confidence, annotated_frame
    
    def draw_debug_overlay(self, frame, normalized_landmarks):
        """
        Draw measurement lines and debug info on frame
        """
        annotated = frame.copy()
        L = self.LANDMARKS
        
        # Draw key measurement lines
        def draw_line(p1_idx, p2_idx, color, thickness=2):
            p1 = normalized_landmarks[p1_idx]
            p2 = normalized_landmarks[p2_idx]
            cv2.line(annotated, (p1[0], p1[1]), (p2[0], p2[1]), color, thickness)
        
        # Face height (green)
        draw_line(L['face_top'], L['chin'], (0, 255, 0), 2)
        
        # Forehead width (blue)
        draw_line(L['forehead_left'], L['forehead_right'], (255, 0, 0), 2)
        
        # Cheekbone width (red)
        draw_line(L['cheekbone_left'], L['cheekbone_right'], (0, 0, 255), 2)
        
        # Jaw width (yellow)
        draw_line(L['jaw_left'], L['jaw_right'], (0, 255, 255), 2)
        
        # Draw measurements text
        if self.debug_info:
            y_offset = 30
            for key, value in self.debug_info.get('ratios', {}).items():
                text = f"{key}: {value:.2f}"
                cv2.putText(annotated, text, (10, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                y_offset += 20
        
        return annotated
    
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
        self.debug_mode = False
        self.face_detector = FaceShapeDetector(debug_mode=self.debug_mode)
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
