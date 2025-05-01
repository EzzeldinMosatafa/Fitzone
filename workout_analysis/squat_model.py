import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque
from .base_models import calculate_angle, draw_landmarks, draw_angle

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
        
    return angle

class RepCounter:
    def __init__(self, threshold_angles, cooldown=15):
        self.count = 0
        self.stage = None
        self.threshold_angles = threshold_angles
        self.prev_angles = deque(maxlen=5)
        self.cooldown = cooldown
        self.frames_since_last_count = self.cooldown
        self.min_rep_duration = 10
        self.frames_in_current_rep = 0
        self.last_rep_angle = None
        self.valid_down = False
        self.angle_history = deque(maxlen=30)

    def count_rep(self, current_angle, hip_angle=None):
        self.prev_angles.append(current_angle)
        self.angle_history.append(current_angle)
        smoothed_angle = sum(self.prev_angles) / len(self.prev_angles)
        
        self.frames_since_last_count += 1
        self.frames_in_current_rep += 1
        
        if len(self.angle_history) > 10:
            angle_range = max(self.angle_history) - min(self.angle_history)
            significant_movement = angle_range > 30
            
            if smoothed_angle < self.threshold_angles['down'] and self.stage != 'down':
                if self.last_rep_angle is None or abs(smoothed_angle - self.last_rep_angle) > 20:
                    self.stage = 'down'
                    self.frames_in_current_rep = 0
                    self.valid_down = True
            
            elif smoothed_angle > self.threshold_angles['up'] and self.stage == 'down':
                if significant_movement and self.valid_down:
                    self.stage = 'up'
                    self.count += 1
                    self.frames_since_last_count = 0
                    self.last_rep_angle = smoothed_angle
                    self.valid_down = False
        
        return self.count, self.stage

def process_squat(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter({'down': 80, 'up': 160})

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'knee_angle': 0,
        'hip_angle': 0,
        'rep_count': 0,
        'stage': '',
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = image.shape[:2]
            
            # Get key points for squat analysis
            hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                  landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height]
            knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x * width,
                   landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y * height]
            ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y * height]
            shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y * height]

            # Calculate angles
            knee_angle = calculate_angle(hip, knee, ankle)
            hip_angle = calculate_angle(shoulder, hip, knee)

            # Evaluate form
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            if knee_angle < 80 or knee_angle > 120:
                feedback = "Keep knees at 90 degrees!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif hip_angle < 160:
                feedback = "Keep your back straight!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Squat state logic
            if rep_counter.stage == "up" and knee_angle < 90:
                rep_counter.stage = "down"
                rep_counter.valid_down = True
            elif rep_counter.stage == "down" and knee_angle > 160:
                if rep_counter.valid_down:
                    rep_counter.count += 1
                rep_counter.stage = "up"
                rep_counter.valid_down = False

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'knee_angle': int(knee_angle),
                'hip_angle': int(hip_angle),
                'rep_count': rep_counter.count,
                'stage': rep_counter.stage,
                'feedback': feedback,
                'color': color
            })

            # Draw visualization
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
            
            # Draw angles
            cv2.putText(image, f"Knee: {int(knee_angle)}",
                        tuple(np.multiply(knee, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Hip: {int(hip_angle)}",
                        tuple(np.multiply(hip, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

            # Add feedback text
            cv2.rectangle(image, (10, 120), (610, 160), color, -1)
            cv2.putText(image, feedback, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Add rep count and state
            cv2.putText(image, f"Squats: {rep_counter.count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(image, f"State: {rep_counter.stage}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

            # Add progress bar
            goal_squat = 10
            bar_x1, bar_y1 = 20, 200
            bar_x2, bar_y2 = 40, 400
            progress = int((rep_counter.count / goal_squat) * (bar_y2 - bar_y1))
            
            cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
            cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

            # Display progress text
            text_x, text_y = 20, 180
            (text_width, text_height), _ = cv2.getTextSize(f"{rep_counter.count}/{goal_squat}", 
                                                         cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
            rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5

            overlay = image.copy()
            cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
            alpha = 0.5
            cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)

            cv2.putText(image, f"{rep_counter.count}/{goal_squat}", 
                       (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Add angles display
            x_offset = width - 250
            y_offset = 10
            cv2.rectangle(image, (x_offset, y_offset), (x_offset + 240, y_offset + 80), (50, 50, 50), -1)
            cv2.putText(image, f"Hip Angle: {int(hip_angle)}", (x_offset + 10, y_offset + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(image, f"Knee Angle: {int(knee_angle)}", (x_offset + 10, y_offset + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    except Exception as e:
        print(f"Error in process_squat: {str(e)}")
        pass
    
    return image, frame_results 