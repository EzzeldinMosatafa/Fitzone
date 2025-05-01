import cv2
import numpy as np
import mediapipe as mp
from collections import deque

class RepCounter:
    def __init__(self, goal_pushups=10):
        self.count = 0
        self.stage = "up"
        self.goal_pushups = goal_pushups
        self.prev_angles = deque(maxlen=5)
        self.angle_history = deque(maxlen=30)

    def count_rep(self, elbow_angle, back_angle=None):
        self.prev_angles.append(elbow_angle)
        self.angle_history.append(elbow_angle)
        
        if self.stage == "up" and elbow_angle < 90:
            self.stage = "down"
        elif self.stage == "down" and elbow_angle > 160:
            self.count += 1
            self.stage = "up"
        
        return self.count, self.stage

def calculate_angle(p1, p2, p3):
    a = np.array(p1)
    b = np.array(p2)
    c = np.array(p3)
    ab = a - b
    bc = c - b
    angle = np.arccos(np.clip(np.dot(ab, bc) / (np.linalg.norm(ab) * np.linalg.norm(bc)), -1.0, 1.0))
    return np.degrees(angle)

def process_pushup(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter()

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'elbow_angle': 0,
        'back_angle': 0,
        'knee_angle': 0,
        'rep_count': 0,
        'stage': '',
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = frame.shape[:2]

            # Key Points
            shoulder = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y * height)
            elbow = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].y * height)
            wrist = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].y * height)
            hip = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                  landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height)
            knee = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x * width,
                   landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y * height)
            ankle = (landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x * width,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y * height)

            # Calculate Angles
            elbow_angle = calculate_angle(shoulder, elbow, wrist)
            back_angle = calculate_angle(shoulder, hip, knee)
            knee_angle = calculate_angle(hip, knee, ankle)

            # Form Validation
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            if back_angle < 165 or back_angle > 180:
                feedback = "Keep your back straight!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif knee_angle < 160:
                feedback = "Straighten your legs!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Count repetitions
            rep_count, stage = rep_counter.count_rep(elbow_angle, back_angle)

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'elbow_angle': int(elbow_angle),
                'back_angle': int(back_angle),
                'knee_angle': int(knee_angle),
                'rep_count': rep_count,
                'stage': stage,
                'feedback': feedback,
                'color': color
            })

            # Draw visualization
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=3),
                mp.solutions.drawing_utils.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=3))
            
            # Draw angles
            cv2.putText(image, f"Elbow Angle: {int(elbow_angle)}",
                        tuple(np.multiply(elbow, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Back Angle: {int(back_angle)}",
                        tuple(np.multiply(hip, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Knee Angle: {int(knee_angle)}",
                        tuple(np.multiply(knee, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

            # Add feedback text
            cv2.rectangle(image, (10, 120), (610, 160), color, -1)
            cv2.putText(image, feedback, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Add rep count and state
            cv2.putText(image, f"Push-ups: {rep_count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(image, f"State: {stage}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

            # Add progress bar
            bar_x1, bar_y1 = 20, 210
            bar_x2, bar_y2 = 40, 400
            progress = int((rep_count / rep_counter.goal_pushups) * (bar_y2 - bar_y1))
            cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
            cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

            # Add progress text
            text_x, text_y = 20, 210
            (text_width, text_height), _ = cv2.getTextSize(f"{rep_count}/{rep_counter.goal_pushups}", 
                                                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
            rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5
            overlay = image.copy()
            cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
            alpha = 0.5
            cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)
            cv2.putText(image, f"{rep_count}/{rep_counter.goal_pushups}", 
                       (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Add angles display
            x_offset = width - 260
            y_offset = 10
            cv2.rectangle(image, (x_offset, y_offset), (x_offset + 250, y_offset + 120), (50, 50, 50), -1)
            cv2.putText(image, f"Elbow: {elbow_angle:.2f}", (x_offset + 10, y_offset + 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(image, f"Back: {back_angle:.2f}", (x_offset + 10, y_offset + 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            cv2.putText(image, f"Knee: {knee_angle:.2f}", (x_offset + 10, y_offset + 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    except Exception as e:
        print(f"Error in process_pushup: {str(e)}")
        pass
    
    return image, frame_results 