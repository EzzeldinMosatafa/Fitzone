import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque
from .base_models import calculate_angle, RepCounter

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
        self.start_time = None
        self.duration = 0

    def count_rep(self, current_angle, back_angle=None):
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

def process_plank(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter({'down': 80, 'up': 160})

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'back_angle': 0,
        'elbow_angle': 0,
        'knee_angle': 0,
        'duration': 0,
        'stage': '',
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = image.shape[:2]
            
            # Get key points for plank analysis
            shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y * height]
            elbow = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].y * height]
            wrist = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].y * height]
            hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                  landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height]
            knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x * width,
                   landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y * height]
            ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y * height]

            # Calculate angles
            back_angle = calculate_angle(shoulder, hip, knee)
            elbow_angle = calculate_angle(shoulder, elbow, wrist)
            knee_angle = calculate_angle(hip, knee, ankle)

            # Evaluate form
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            if back_angle < 160 or back_angle > 180:
                feedback = "Keep your back straight!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif elbow_angle < 70 or elbow_angle > 90:
                feedback = "Adjust your elbow position!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif knee_angle < 160 or knee_angle > 180:
                feedback = "Straighten your legs!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Track duration
            if correct_form:
                if rep_counter.stage != 'in_plank':
                    rep_counter.stage = 'in_plank'
                    rep_counter.start_time = time.time()
                rep_counter.duration = time.time() - rep_counter.start_time
            else:
                rep_counter.stage = 'not_in_plank'
                rep_counter.duration = 0

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'back_angle': int(back_angle),
                'elbow_angle': int(elbow_angle),
                'knee_angle': int(knee_angle),
                'duration': rep_counter.duration,
                'stage': rep_counter.stage,
                'feedback': feedback,
                'color': color
            })

            # Draw visualization
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
            
            # Draw angles
            cv2.putText(image, f"Back: {int(back_angle)}",
                        tuple(np.multiply(hip, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Elbow: {int(elbow_angle)}",
                        tuple(np.multiply(elbow, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Knee: {int(knee_angle)}",
                        tuple(np.multiply(knee, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

            # Add feedback text
            cv2.rectangle(image, (10, 120), (610, 160), color, -1)
            cv2.putText(image, feedback, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Add duration and state
            cv2.putText(image, f"Plank Time: {rep_counter.duration:.1f}s", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(image, f"State: {rep_counter.stage}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

            # Add progress bar
            goal_plank_time = 30  # 30 seconds goal
            bar_x1, bar_y1 = 20, 210
            bar_x2, bar_y2 = 40, 400
            progress = int((rep_counter.duration / goal_plank_time) * (bar_y2 - bar_y1))
            
            cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
            cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

            # Display time progress
            text_x, text_y = 20, 210
            (text_width, text_height), _ = cv2.getTextSize(f"{rep_counter.duration:.1f}s / {goal_plank_time}s", 
                                                         cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
            rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5

            overlay = image.copy()
            cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
            alpha = 0.5
            cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)

            cv2.putText(image, f"{rep_counter.duration:.1f}s / {goal_plank_time}s", 
                       (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    except Exception as e:
        print(f"Error in process_plank: {str(e)}")
        pass
    
    return image, frame_results 