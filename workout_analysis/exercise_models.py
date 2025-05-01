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
        'depth': 'insufficient',
        'knee_alignment': 'good'
    }
    
    try:
        landmarks = results.pose_landmarks.landmark
        
        # Get key points
        hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x,
               landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x,
                 landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y]
        shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x,
                   landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y]
        
        # Calculate angles
        knee_angle = calculate_angle(hip, knee, ankle)
        hip_angle = calculate_angle(shoulder, hip, knee)
        
        # Count reps
        rep_count, stage = rep_counter.count_rep(knee_angle)
        
        # Analyze form
        form = 'good'
        form_issues = []
        
        if knee_angle > 120:
            form_issues.append('not deep enough')
            depth = 'insufficient'
        elif knee_angle < 60:
            form_issues.append('too deep')
            depth = 'excessive'
        else:
            depth = 'good'
            
        knee_x = landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x
        ankle_x = landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x
        if abs(knee_x - ankle_x) > 0.1:
            form_issues.append('knees not aligned with ankles')
            knee_alignment = 'needs improvement'
        else:
            knee_alignment = 'good'
            
        if form_issues:
            form = ', '.join(form_issues)
        
        # Update results
        frame_results.update({
            'form': form,
            'knee_angle': int(knee_angle),
            'hip_angle': int(hip_angle),
            'rep_count': rep_count,
            'stage': stage or 'neutral',
            'depth': depth,
            'knee_alignment': knee_alignment
        })
        
        # Draw landmarks and information
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        # Draw angles and rep count
        cv2.putText(image, f"Knee Angle: {int(knee_angle)}",
                    tuple(np.multiply(knee, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
        cv2.putText(image, f"Hip Angle: {int(hip_angle)}",
                    tuple(np.multiply(hip, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
        cv2.putText(image, f"Reps: {rep_count}",
                    (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
        
        cv2.putText(image, f"Stage: {stage or 'neutral'}",
                    (50, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
        
    except Exception as e:
        print(f"Error in process_squat: {str(e)}")
        pass
    
    return image, frame_results

def process_pushup(frame, pose, rep_counter=None):
    if rep_counter is None:
        rep_counter = RepCounter({'down': 80, 'up': 150})

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {
        'form': 'unknown',
        'elbow_angle': 0,
        'back_angle': 0,
        'rep_count': 0,
        'stage': '',
        'speed': 'normal',
        'symmetry': 'good'
    }
    
    try:
        landmarks = results.pose_landmarks.landmark
        height, width = frame.shape[:2]
        
        # Get key points for pushup analysis
        shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x,
                   landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].y]
        hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x,
               landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y]
        
        # Calculate angles
        elbow_angle = calculate_angle(shoulder, elbow, wrist)
        back_angle = calculate_angle(shoulder, hip, knee)
        
        # Count reps with back angle validation
        rep_count, stage = rep_counter.count_rep(elbow_angle, back_angle)
        
        # Analyze form
        form = 'good'
        form_issues = []
        
        if elbow_angle < 60:
            form_issues.append('elbows too bent')
        elif elbow_angle > 170:
            form_issues.append('arms not bending enough')
            
        if back_angle < 150:
            form_issues.append('back not straight')
            
        if form_issues:
            form = ', '.join(form_issues)
        
        # Check symmetry
        right_shoulder = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                         landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        right_elbow = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW.value].x,
                      landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW.value].y]
        right_wrist = [landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST.value].x,
                      landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST.value].y]
        
        right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
        angle_diff = abs(elbow_angle - right_elbow_angle)
        symmetry = 'good' if angle_diff < 20 else 'needs improvement'
        
        # Update results
        frame_results.update({
            'form': form,
            'elbow_angle': int(elbow_angle),
            'back_angle': int(back_angle),
            'rep_count': rep_count,
            'stage': stage or 'neutral',
            'symmetry': symmetry
        })
        
        # Draw landmarks and angles
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
            mp.solutions.drawing_utils.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=3),
            mp.solutions.drawing_utils.DrawingSpec(color=(0,0,255), thickness=2, circle_radius=3))
        
        # Draw angles and rep count
        cv2.putText(image, f"Elbow Angle: {int(elbow_angle)}",
                    tuple(np.multiply(elbow, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
        # Add progress bar
        bar_x1, bar_y1 = 20, 210
        bar_x2, bar_y2 = 40, 400
        progress = int((rep_count / 10) * (bar_y2 - bar_y1))  # Assuming goal of 10 pushups
        cv2.rectangle(image, (bar_x1, bar_y2 - progress), (bar_x2, bar_y2), (0, 255, 0), -1)
        cv2.rectangle(image, (bar_x1, bar_y1), (bar_x2, bar_y2), (255, 255, 255), 2)

        # Add progress text
        text_x, text_y = 20, 210
        (text_width, text_height), _ = cv2.getTextSize(f"{rep_count}/10", 
                                                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        rect_x1, rect_y1 = text_x - 5, text_y - text_height - 5
        rect_x2, rect_y2 = text_x + text_width + 5, text_y + 5
        overlay = image.copy()
        cv2.rectangle(overlay, (rect_x1, rect_y1), (rect_x2, rect_y2), (0, 0, 0), -1)
        alpha = 0.5
        cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)
        cv2.putText(image, f"{rep_count}/10", 
                   (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Add angles display
        x_offset = width - 260
        y_offset = 10
        cv2.rectangle(image, (x_offset, y_offset), (x_offset + 250, y_offset + 120), (50, 50, 50), -1)
        cv2.putText(image, f"Elbow: {elbow_angle:.2f}", (x_offset + 10, y_offset + 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(image, f"Back: {back_angle:.2f}", (x_offset + 10, y_offset + 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        # Add feedback text
        cv2.rectangle(image, (10, 120), (610, 160), (0, 255, 0) if form == 'good' else (0, 0, 255), -1)
        cv2.putText(image, form, (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
        
    except Exception as e:
        print(f"Error in process_pushup: {str(e)}")
        pass
    
    return image, frame_results

def process_plank(frame, pose):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {}
    
    try:
        landmarks = results.pose_landmarks.landmark
        
        # Get key points for plank analysis
        shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y]
        hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x,
               landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y]
        
        # Calculate angles
        back_angle = calculate_angle(shoulder, hip, knee)
        
        # Update results
        frame_results['back_angle'] = back_angle
        frame_results['form'] = 'good' if 170 <= back_angle <= 190 else 'needs improvement'
        
        # Draw landmarks and angles
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        cv2.putText(image, f"Back Angle: {int(back_angle)}",
                    tuple(np.multiply(hip, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
    except:
        pass
    
    return image, frame_results

def process_lunges(frame, pose):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {}
    
    try:
        landmarks = results.pose_landmarks.landmark
        
        # Get key points for lunges analysis
        hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x,
               landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x,
                 landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        # Calculate angles
        knee_angle = calculate_angle(hip, knee, ankle)
        
        # Update results
        frame_results['knee_angle'] = knee_angle
        frame_results['form'] = 'good' if 90 <= knee_angle <= 120 else 'needs improvement'
        
        # Draw landmarks and angles
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        cv2.putText(image, f"Knee Angle: {int(knee_angle)}",
                    tuple(np.multiply(knee, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
    except:
        pass
    
    return image, frame_results

def process_running(frame, pose):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {}
    
    try:
        landmarks = results.pose_landmarks.landmark
        
        # Get key points for running analysis
        hip = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].x,
               landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].x,
                landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].x,
                 landmarks[mp.solutions.pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        # Calculate angles
        knee_angle = calculate_angle(hip, knee, ankle)
        
        # Update results
        frame_results['knee_angle'] = knee_angle
        frame_results['form'] = 'good' if knee_angle > 90 else 'needs improvement'
        
        # Draw landmarks and angles
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        cv2.putText(image, f"Knee Angle: {int(knee_angle)}",
                    tuple(np.multiply(knee, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
    except:
        pass
    
    return image, frame_results

def process_bicepcurl(frame, pose):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = pose.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    frame_results = {}
    
    try:
        landmarks = results.pose_landmarks.landmark
        
        # Get key points for bicep curl analysis
        shoulder = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].x,
                 landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].x,
                 landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST.value].y]
        
        # Calculate angles
        elbow_angle = calculate_angle(shoulder, elbow, wrist)
        
        # Update results
        frame_results['elbow_angle'] = elbow_angle
        frame_results['form'] = 'good' if 90 <= elbow_angle <= 120 else 'needs improvement'
        
        # Draw landmarks and angles
        mp.solutions.drawing_utils.draw_landmarks(
            image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        cv2.putText(image, f"Elbow Angle: {int(elbow_angle)}",
                    tuple(np.multiply(elbow, [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
    except:
        pass
    
    return image, frame_results 