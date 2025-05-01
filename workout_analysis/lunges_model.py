import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque
from .base_models import calculate_angle, RepCounter

def process_lunges(frame, pose, rep_counter=None):
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
        'left_back_angle': 0,
        'right_back_angle': 0,
        'rep_count': 0,
        'stage': '',
        'feedback': 'Well done!',
        'color': (0, 255, 0)  # Green for good form
    }
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            height, width = image.shape[:2]
            
            # Get key points for lunges analysis
            left_shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x * width,
                            landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y * height]
            left_hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x * width,
                       landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y * height]
            left_knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x * width,
                        landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y * height]
            left_ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y * height]
            
            right_shoulder = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].x * width,
                             landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].y * height]
            right_hip = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].x * width,
                        landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP.value].y * height]
            right_knee = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE.value].x * width,
                         landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE.value].y * height]
            right_ankle = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ANKLE.value].x * width,
                          landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ANKLE.value].y * height]

            # Calculate angles
            left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
            right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)
            left_back_angle = calculate_angle(left_shoulder, left_hip, left_knee)
            right_back_angle = calculate_angle(right_shoulder, right_hip, right_knee)

            # Evaluate form
            correct_form = True
            feedback = "Well done!"
            color = (0, 255, 0)  # Green

            # Check if both knees are within the desired range
            if (left_knee_angle < 50 or left_knee_angle > 95) or (right_knee_angle < 50 or right_knee_angle > 95):
                feedback = "Adjust knee position!"
                correct_form = False
                color = (0, 0, 255)  # Red

            # Lunge state logic
            if rep_counter.stage == "up" and 80 <= left_knee_angle <= 95 and 80 <= right_knee_angle <= 95:
                rep_counter.stage = "down"
            elif rep_counter.stage == "down" and left_knee_angle > 160 and right_knee_angle > 160:
                rep_counter.stage = "up"
                rep_counter.count += 1

            # Update results
            frame_results.update({
                'form': 'good' if correct_form else 'needs improvement',
                'left_knee_angle': int(left_knee_angle),
                'right_knee_angle': int(right_knee_angle),
                'left_back_angle': int(left_back_angle),
                'right_back_angle': int(right_back_angle),
                'rep_count': rep_counter.count,
                'stage': rep_counter.stage,
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

            # Add feedback text
            cv2.rectangle(image, (10, 120), (610, 160), color, -1)
            cv2.putText(image, feedback, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Add rep count and stage
            cv2.putText(image, f"Lunges: {rep_counter.count}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(image, f"State: {rep_counter.stage}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

            # Add progress bar
            goal_lunges = 10
            bar_x1, bar_y1 = 20, 210
            bar_x2, bar_y2 = 40, 400
            progress = int((rep_counter.count / goal_lunges) * (bar_y2 - bar_y1))
            
            cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
            cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

            # Display progress text
            text_x, text_y = 20, 200
            (text_width, text_height), _ = cv2.getTextSize(f"{rep_counter.count}/{goal_lunges}", 
                                                         cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
            rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5

            overlay = image.copy()
            cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
            alpha = 0.5
            cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)

            cv2.putText(image, f"{rep_counter.count}/{goal_lunges}", 
                       (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Add angles display
            x_offset = width - 260
            y_offset = 10
            cv2.rectangle(image, (x_offset, y_offset), (x_offset + 250, y_offset + 120), (50, 50, 50), -1)
            cv2.putText(image, f"Left Knee: {left_knee_angle:.2f}", (x_offset + 10, y_offset + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(image, f"Right Knee: {right_knee_angle:.2f}", (x_offset + 10, y_offset + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.putText(image, f"Left Back: {left_back_angle:.2f}", (x_offset + 10, y_offset + 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            cv2.putText(image, f"Right Back: {right_back_angle:.2f}", (x_offset + 10, y_offset + 120), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

    except Exception as e:
        print(f"Error in process_lunges: {str(e)}")
        pass
    
    return image, frame_results 