import cv2
import mediapipe as mp
import numpy as np
import math
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

def process_running(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter({'down': 80, 'up': 160})

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'left_knee_angle': 0,
        'right_knee_angle': 0,
        'rep_count': 0,
        'stage': '',
        'left_knee_correct': False,
        'right_knee_correct': False,
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = image.shape[:2]
            
            # Get key points for running analysis
            left_hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height]
            left_knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x * width,
                        landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y * height]
            left_ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y * height]
            
            right_hip = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].x * width,
                        landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].y * height]
            right_knee = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE.value].y * height]
            right_ankle = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ANKLE.value].x * width,
                          landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ANKLE.value].y * height]

            # Calculate angles
            left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
            right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

            # Evaluate form
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            left_knee_correct = left_knee_angle < 90  # Knee should be raised higher
            right_knee_correct = right_knee_angle < 90

            if not left_knee_correct and not right_knee_correct:
                feedback = "Raise your knees higher!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif not left_knee_correct:
                feedback = "Raise your left knee higher!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif not right_knee_correct:
                feedback = "Raise your right knee higher!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Count reps
            rep_count, stage = rep_counter.count_rep(min(left_knee_angle, right_knee_angle))

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'left_knee_angle': int(left_knee_angle),
                'right_knee_angle': int(right_knee_angle),
                'rep_count': rep_count,
                'stage': stage or 'neutral',
                'left_knee_correct': left_knee_correct,
                'right_knee_correct': right_knee_correct,
                'feedback': feedback,
                'color': color
            })

            # Draw visualization
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
            
            # Draw angles
            cv2.putText(image, f"Left Knee: {int(left_knee_angle)}",
                        tuple(np.multiply(left_knee, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Right Knee: {int(right_knee_angle)}",
                        tuple(np.multiply(right_knee, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

            # Draw feedback
            left_color = (0, 255, 0) if left_knee_correct else (0, 0, 255)
            right_color = (0, 255, 0) if right_knee_correct else (0, 0, 255)
            
            left_text = "Left Knee: High" if left_knee_correct else "Left Knee: Low"
            right_text = "Right Knee: High" if right_knee_correct else "Right Knee: Low"
            
            cv2.rectangle(image, (20, 20), (300, 60), left_color, -1)
            cv2.putText(image, left_text, (30, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.rectangle(image, (20, 70), (300, 110), right_color, -1)
            cv2.putText(image, right_text, (30, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Draw guide lines
            cv2.line(image, (int(left_ankle[0]), int(left_ankle[1])), 
                    (int(left_knee[0]), int(left_knee[1])), (0, 255, 255), 2)
            cv2.line(image, (int(right_ankle[0]), int(right_ankle[1])), 
                    (int(right_knee[0]), int(right_knee[1])), (0, 255, 255), 2)

    except Exception as e:
        print(f"Error in process_running: {str(e)}")
        pass
    
    return image, frame_results 