import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque
from .base_models import calculate_angle, RepCounter

def process_bicep_curl(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter({'down': 30, 'up': 160})

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'left_elbow_angle': 0,
        'right_elbow_angle': 0,
        'left_shoulder_angle': 0,
        'right_shoulder_angle': 0,
        'rep_count': 0,
        'stage': '',
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = image.shape[:2]
            
            # Get key points for bicep curl analysis
            left_shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x * width,
                           landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y * height]
            left_elbow = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].y * height]
            left_wrist = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].y * height]
            left_hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height]
            
            right_shoulder = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].x * width,
                            landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].y * height]
            right_elbow = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW.value].x * width,
                          landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW.value].y * height]
            right_wrist = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST.value].x * width,
                          landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST.value].y * height]
            right_hip = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].x * width,
                        landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].y * height]

            # Calculate angles
            left_elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
            left_shoulder_angle = calculate_angle(left_elbow, left_shoulder, left_hip)
            right_shoulder_angle = calculate_angle(right_elbow, right_shoulder, right_hip)

            # Evaluate form
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            if left_elbow_angle < 30 or left_elbow_angle > 160:
                feedback = "Adjust left arm position!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif right_elbow_angle < 30 or right_elbow_angle > 160:
                feedback = "Adjust right arm position!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif left_shoulder_angle < 160 or left_shoulder_angle > 180:
                feedback = "Keep left shoulder stable!"
                correct_form = False
                color = (0, 0, 255)  # Red
            elif right_shoulder_angle < 160 or right_shoulder_angle > 180:
                feedback = "Keep right shoulder stable!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Bicep curl state logic
            if rep_counter.stage == "up" and (left_elbow_angle < 30 or right_elbow_angle < 30):
                rep_counter.stage = "down"
                rep_counter.valid_down = True
            elif rep_counter.stage == "down" and (left_elbow_angle > 160 and right_elbow_angle > 160):
                if rep_counter.valid_down:
                    rep_counter.count += 1
                rep_counter.stage = "up"
                rep_counter.valid_down = False

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'left_elbow_angle': int(left_elbow_angle),
                'right_elbow_angle': int(right_elbow_angle),
                'left_shoulder_angle': int(left_shoulder_angle),
                'right_shoulder_angle': int(right_shoulder_angle),
                'rep_count': rep_counter.count,
                'stage': rep_counter.stage,
                'feedback': feedback,
                'color': color
            })

            # Draw visualization
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
            
            # Draw angles
            cv2.putText(image, f"Left Elbow: {int(left_elbow_angle)}",
                        tuple(np.multiply(left_elbow, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.putText(image, f"Right Elbow: {int(right_elbow_angle)}",
                        tuple(np.multiply(right_elbow, [640, 480]).astype(int)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

            # Add feedback text
            cv2.rectangle(image, (10, 120), (610, 160), color, -1)
            cv2.putText(image, feedback, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Add rep count and stage
            cv2.putText(image, f"Bicep Curls: {rep_counter.count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(image, f"State: {rep_counter.stage}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

            # Add progress bar
            goal_curls = 10
            bar_x1, bar_y1 = 20, 200
            bar_x2, bar_y2 = 40, 400
            progress = int((rep_counter.count / goal_curls) * (bar_y2 - bar_y1))
            
            cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
            cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

            # Display progress text
            text_x, text_y = 20, 180
            (text_width, text_height), _ = cv2.getTextSize(f"{rep_counter.count}/{goal_curls}", 
                                                         cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
            rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5

            overlay = image.copy()
            cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
            alpha = 0.5
            cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)

            cv2.putText(image, f"{rep_counter.count}/{goal_curls}", 
                       (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Add angles display
            x_offset = width - 250
            y_offset = 10
            cv2.rectangle(image, (x_offset, y_offset), (x_offset + 240, y_offset + 100), (50, 50, 50), -1)
            cv2.putText(image, f"Left Elbow: {int(left_elbow_angle)}", (x_offset + 10, y_offset + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(image, f"Right Elbow: {int(right_elbow_angle)}", (x_offset + 10, y_offset + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(image, f"Left Shoulder: {int(left_shoulder_angle)}", (x_offset + 10, y_offset + 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

    except Exception as e:
        print(f"Error in process_bicep_curl: {str(e)}")
        pass
    
    return image, frame_results 