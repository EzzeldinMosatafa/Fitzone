import os
import cv2
import mediapipe as mp
import numpy as np
import logging
from .base_models import RepCounter
from .squat_model import process_squat
from .pushup_model import process_pushup
from .plank_model import process_plank
from .lunges_model import process_lunges
from .running_model import process_running
from .bicep_curl_model import process_bicep_curl

logger = logging.getLogger(__name__)

def process_video(input_path, output_path, exercise_type):
    logger.info(f"Starting video processing for {exercise_type}")
    logger.info(f"Input path: {input_path}")
    logger.info(f"Output path: {output_path}")

    try:
        # Initialize video capture
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            logger.error(f"Could not open video file: {input_path}")
            raise Exception("Could not open video file")

        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Video properties - Width: {width}, Height: {height}, FPS: {fps}, Total frames: {total_frames}")

        # Initialize video writer with web-compatible format
        try:
            # Try avc1 codec (H.264) which is widely supported by web browsers
            fourcc = cv2.VideoWriter_fourcc(*'avc1')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # Test if the writer is initialized properly
            if not out.isOpened():
                # Try x264 codec
                fourcc = cv2.VideoWriter_fourcc(*'X264')
                out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                
                if not out.isOpened():
                    # Try DIVX codec as fallback
                    fourcc = cv2.VideoWriter_fourcc(*'DIVX')
                    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                    
                    if not out.isOpened():
                        raise Exception("Could not initialize video writer with any codec")

            logger.info(f"Successfully initialized video writer with codec")

        except Exception as e:
            logger.error(f"Error initializing video writer: {str(e)}")
            raise Exception(f"Failed to initialize video writer: {str(e)}")

        # Initialize MediaPipe
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

        # Select appropriate processing function based on exercise type
        exercise_processors = {
            'squat': process_squat,
            'pushup': process_pushup,
            'plank': process_plank,
            'lunges': process_lunges,
            'running': process_running,
            'bicepcurl': process_bicep_curl
        }

        processor = exercise_processors.get(exercise_type)
        if not processor:
            logger.error(f"Unsupported exercise type: {exercise_type}")
            raise Exception(f"Unsupported exercise type: {exercise_type}")

        # Initialize rep counter with appropriate thresholds for each exercise
        rep_thresholds = {
            'pushup': {'down': 90, 'up': 160},
            'squat': {'down': 80, 'up': 160},
            'lunges': {'down': 80, 'up': 160},
            'running': {'down': 80, 'up': 160},
            'bicepcurl': {'down': 30, 'up': 160},
            'plank': {'down': 80, 'up': 160}
        }
        
        # Set exercise-specific goals
        exercise_goals = {
            'pushup': 10,
            'squat': 15,
            'lunges': 12,
            'running': 20,
            'bicepcurl': 12,
            'plank': 1
        }
        
        rep_counter = RepCounter(
            rep_thresholds.get(exercise_type, {'down': 80, 'up': 160}),
            goal_pushups=exercise_goals.get(exercise_type, 10)
        )

        # Process each frame
        frame_count = 0
        all_results = []
        total_reps = 0
        form_issues_count = 0
        good_form_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % 30 == 0:  # Log progress every 30 frames
                logger.info(f"Processing frame {frame_count}/{total_frames}")

            try:
                # Process frame with rep counter
                processed_frame, frame_results = processor(frame, pose, rep_counter)
                
                # Verify frame was processed correctly
                if processed_frame is None or processed_frame.size == 0:
                    raise Exception("Processed frame is empty")
                
                all_results.append(frame_results)
                
                # Track form quality
                if 'form' in frame_results:
                    if frame_results['form'] == 'good':
                        good_form_count += 1
                    elif frame_results['form'] != 'unknown':
                        form_issues_count += 1

                # Write processed frame
                success = out.write(processed_frame)
                if not success:
                    raise Exception("Failed to write processed frame")
                    
            except Exception as e:
                logger.error(f"Error processing frame {frame_count}: {str(e)}")
                # If we encounter too many errors, stop processing
                if frame_count > 30 and (good_form_count + form_issues_count) == 0:
                    raise Exception("Too many errors in video processing, please check video format and quality")
                continue

        # Verify we processed at least some frames
        if (good_form_count + form_issues_count) == 0:
            raise Exception("No frames were successfully processed. Please check video quality and format.")

        # Release resources
        cap.release()
        out.release()
        pose.close()

        # Verify the output file exists and has content
        if not os.path.exists(output_path):
            raise Exception("Output file was not created")
        
        if os.path.getsize(output_path) == 0:
            raise Exception("Output file is empty")

        # Calculate final analysis results
        total_analyzed_frames = good_form_count + form_issues_count
        form_quality_percentage = (good_form_count / total_analyzed_frames * 100) if total_analyzed_frames > 0 else 0

        # Aggregate results
        final_results = {
            'total_reps': rep_counter.count if hasattr(rep_counter, 'count') else 0,
            'form_quality_percentage': round(form_quality_percentage, 2),
            'exercise_duration': round(total_frames / fps, 2),  # in seconds
            'average_rep_duration': round((total_frames / fps) / rep_counter.count, 2) if hasattr(rep_counter, 'count') and rep_counter.count > 0 else 0,
            'form_issues': [],
            'recommendations': []
        }

        # Analyze common form issues
        form_issues = {}
        detailed_form_issues = {
            'back not straight': {
                'description': 'Your back is not maintaining a straight line during the exercise',
                'impact': 'This can lead to lower back strain and reduced exercise effectiveness',
                'fix': 'Keep your core tight and imagine a straight line from your head to your heels'
            },
            'elbows too bent': {
                'description': 'Your elbows are bending too much at the bottom of the movement',
                'impact': 'This reduces the effectiveness of the exercise and may strain your shoulders',
                'fix': 'Lower yourself until your elbows are at about 90 degrees, then push back up'
            },
            'arms not bending enough': {
                'description': 'You are not bending your arms enough during the downward movement',
                'impact': 'This means you are not getting the full range of motion and muscle engagement',
                'fix': 'Lower your chest closer to the ground while maintaining proper form'
            },
            'hips too low': {
                'description': 'Your hips are sagging below the straight line of your body',
                'impact': 'This puts extra stress on your lower back and reduces core engagement',
                'fix': 'Tighten your core and glutes to keep your body in a straight line'
            },
            'hips too high': {
                'description': 'Your hips are raised above the straight line of your body',
                'impact': 'This reduces the effectiveness of the exercise and puts strain on your shoulders',
                'fix': 'Lower your hips to maintain a straight line from head to heels'
            },
            'knees not aligned': {
                'description': 'Your knees are not properly aligned with your feet',
                'impact': 'This can cause knee strain and reduce stability',
                'fix': 'Keep your knees pointing in the same direction as your toes'
            }
        }

        for result in all_results:
            if 'form' in result and result['form'] != 'good' and result['form'] != 'unknown':
                issues = result['form'].split(', ')
                for issue in issues:
                    form_issues[issue] = form_issues.get(issue, 0) + 1

        # Add detailed form issues analysis
        final_results['detailed_form_analysis'] = []
        for issue, count in sorted(form_issues.items(), key=lambda x: x[1], reverse=True)[:3]:
            percentage = round((count / total_analyzed_frames) * 100, 2)
            issue_info = detailed_form_issues.get(issue, {
                'description': 'Form issue detected',
                'impact': 'May reduce exercise effectiveness',
                'fix': 'Focus on maintaining proper form'
            })
            
            # Create a formatted string with all the information
            detailed_analysis = (
                f"═══════════ Form Issue Analysis ═══════════\n"
                f"Issue Detected: {issue}\n"
                f"Frequency: {percentage}% of exercise time\n"
                f"Description: {issue_info['description']}\n"
                f"Impact: {issue_info['impact']}\n"
                f"Solution: {issue_info['fix']}\n"
                f"═════════════════════════════════════════"
            )
            final_results['detailed_form_analysis'].append(detailed_analysis)

        # Enhanced recommendations based on performance
        recommendations = []
        
        # Form quality recommendations
        if form_quality_percentage < 60:
            recommendations.append(
                f"▶ Form Quality ({form_quality_percentage:.1f}% accuracy)\n"
                f"  → Focus on maintaining proper form throughout the exercise.\n"
                f"  → Good form is crucial for effective exercises and preventing injury."
            )
            
        # Speed recommendations
        if final_results['average_rep_duration'] < 2:
            recommendations.append(
                f"▶ Speed Control (Current: {final_results['average_rep_duration']:.1f}s per rep)\n"
                f"  → You're moving too fast.\n"
                f"  → Aim for 2-3 seconds down and 1-2 seconds up for better muscle engagement."
            )
        elif final_results['average_rep_duration'] > 5:
            recommendations.append(
                f"▶ Tempo (Current: {final_results['average_rep_duration']:.1f}s per rep)\n"
                f"  → Your repetitions are taking longer than optimal.\n"
                f"  → Try to maintain a more steady, controlled pace."
            )

        # Rep count recommendations
        target_reps = exercise_goals.get(exercise_type, 10)
        actual_reps = final_results['total_reps']
        if actual_reps < target_reps:
            recommendations.append(
                f"▶ Endurance Progress\n"
                f"  → Completed: {actual_reps} out of {target_reps} repetitions\n"
                f"  → Keep practicing to build strength and endurance!"
            )

        final_results['recommendations'] = recommendations
        
        # Simplified form issues list
        final_results['form_issues'] = [
            f"• {issue} ({round((count / total_analyzed_frames) * 100, 2)}% of exercise time)"
            for issue, count in sorted(form_issues.items(), key=lambda x: x[1], reverse=True)[:3]
        ]

        # Add a structured summary section
        final_results['summary'] = (
            f"╔════════════ Exercise Summary ════════════╗\n"
            f"║ Repetitions: {actual_reps}/{target_reps} completed      ║\n"
            f"║ Form Accuracy: {form_quality_percentage:.1f}%               ║\n"
            f"║ Average Rep Time: {final_results['average_rep_duration']:.1f} seconds      ║\n"
            f"║ Total Duration: {final_results['exercise_duration']:.1f} seconds       ║\n"
            f"╚══════════════════════════════════════════╝"
        )

        # Add overall performance rating
        performance_score = (form_quality_percentage + (actual_reps / target_reps * 100)) / 2
        if performance_score >= 80:
            rating = "Excellent! Keep up the great work! 🌟"
        elif performance_score >= 60:
            rating = "Good progress! Room for improvement. 👍"
        else:
            rating = "Keep practicing! You'll get better! 💪"
            
        final_results['performance_rating'] = (
            f"Overall Performance: {performance_score:.1f}%\n"
            f"{rating}"
        )

        logger.info("Video processing completed successfully")
        logger.info(f"Final results: {final_results}")
        return final_results

    except Exception as e:
        logger.error(f"Error in process_video: {str(e)}", exc_info=True)
        raise 