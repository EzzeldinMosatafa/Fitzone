import cv2
import mediapipe as mp
import numpy as np
from collections import deque

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
    def __init__(self, threshold_angles, cooldown=15, goal_pushups=10):
        self.count = 0
        self.stage = "up"
        self.threshold_angles = threshold_angles
        self.prev_angles = deque(maxlen=5)
        self.cooldown = cooldown
        self.frames_since_last_count = self.cooldown
        self.min_rep_duration = 10
        self.frames_in_current_rep = 0
        self.last_rep_angle = None
        self.valid_down = False
        self.angle_history = deque(maxlen=30)
        self.goal_pushups = goal_pushups

    def count_rep(self, current_angle, back_angle=None):
        self.prev_angles.append(current_angle)
        self.angle_history.append(current_angle)
        smoothed_angle = sum(self.prev_angles) / len(self.prev_angles)
        
        if smoothed_angle < self.threshold_angles['down'] and self.stage != 'down':
            self.stage = 'down'
            self.valid_down = True
        elif smoothed_angle > self.threshold_angles['up'] and self.stage == 'down' and self.valid_down:
            self.stage = 'up'
            self.count += 1
            self.valid_down = False
        
        return self.count, self.stage

def draw_landmarks(image, results):
    mp.solutions.drawing_utils.draw_landmarks(
        image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
    
def draw_angle(image, angle, position, color=(255, 255, 255)):
    cv2.putText(image, f"Angle: {int(angle)}",
                tuple(np.multiply(position, [640, 480]).astype(int)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)
    
def draw_rep_count(image, count, position=(50, 50)):
    cv2.putText(image, f"Reps: {count}",
                position,
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
    
def draw_stage(image, stage, position=(50, 100)):
    cv2.putText(image, f"Stage: {stage or 'neutral'}",
                position,
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA) 