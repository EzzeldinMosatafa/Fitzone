import os
import uuid
import logging
import mimetypes
from django.conf import settings
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import cv2
import mediapipe as mp
import numpy as np
from .models import ProcessedVideo
from .utils import process_video
from django.core.files import File

# Configure logging
logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def analyze_squat(request):
    return process_exercise_video(request, 'squat')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_pushup(request):
    return process_exercise_video(request, 'pushup')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_plank(request):
    return process_exercise_video(request, 'plank')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_lunges(request):
    return process_exercise_video(request, 'lunges')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_running(request):
    return process_exercise_video(request, 'running')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_bicepcurl(request):
    return process_exercise_video(request, 'bicepcurl')

def process_exercise_video(request, exercise_type):
    logger.info(f"Received request for {exercise_type} analysis")
    
    try:
        if 'video' not in request.FILES:
            logger.error("No video file provided in request")
            return JsonResponse({'error': 'No video file provided'}, status=400)

        video_file = request.FILES['video']
        logger.info(f"Received video file: {video_file.name}, Size: {video_file.size / (1024*1024):.2f}MB, Type: {video_file.content_type}")
        
        # Check file size (limit to 50MB)
        if video_file.size > 50 * 1024 * 1024:  # 50MB in bytes
            logger.error(f"File too large: {video_file.size / (1024*1024):.2f}MB")
            return JsonResponse({'error': f'File too large. Maximum size is 50MB. Your file is {video_file.size / (1024*1024):.2f}MB'}, status=400)
        
        # Check file type
        allowed_types = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
        if video_file.content_type not in allowed_types:
            logger.error(f"Invalid file type: {video_file.content_type}")
            return JsonResponse({
                'error': f'Invalid file type: {video_file.content_type}',
                'details': 'Please upload MP4, MOV, or AVI file'
            }, status=400)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{video_file.name}"
        input_path = os.path.join(settings.MEDIA_ROOT, 'uploads', unique_filename)
        output_path = os.path.join(settings.MEDIA_ROOT, 'processed', unique_filename)
        
        # Ensure directories exist
        os.makedirs(os.path.dirname(input_path), exist_ok=True)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        logger.info(f"Saving video to: {input_path}")
        
        try:
            # Save uploaded file
            with open(input_path, 'wb+') as destination:
                for chunk in video_file.chunks():
                    destination.write(chunk)
            
            logger.info("Starting video processing")
            
            try:
                # Process video based on exercise type
                analysis_results = process_video(input_path, output_path, exercise_type)
                logger.info("Video processing completed")
                
                # Verify the output file exists and is not empty
                if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                    raise Exception("Failed to generate processed video output")
                
                # Create ProcessedVideo instance
                processed_video = ProcessedVideo()
                processed_video.exercise_type = exercise_type
                processed_video.analysis_results = analysis_results
                
                # Open and save the files
                with open(input_path, 'rb') as original_file:
                    processed_video.original_video.save(
                        os.path.basename(input_path),
                        File(original_file),
                        save=False
                    )
                
                with open(output_path, 'rb') as processed_file:
                    processed_video.processed_video.save(
                        os.path.basename(output_path),
                        File(processed_file),
                        save=False
                    )
                
                processed_video.save()
                logger.info("Processed video saved to database")
                
                response_data = {
                    'processed_video_url': processed_video.processed_video.url,
                    'analysis': analysis_results
                }
                logger.info(f"Returning response: {response_data}")
                return JsonResponse(response_data)
                
            except Exception as process_error:
                logger.error(f"Error processing video: {str(process_error)}", exc_info=True)
                return JsonResponse({
                    'error': 'Error processing video',
                    'details': str(process_error)
                }, status=500)
                
        except Exception as save_error:
            logger.error(f"Error saving video: {str(save_error)}", exc_info=True)
            return JsonResponse({
                'error': 'Error saving video',
                'details': str(save_error)
            }, status=500)
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }, status=500)
    finally:
        # Clean up input file
        if 'input_path' in locals() and os.path.exists(input_path):
            try:
                os.remove(input_path)
                logger.info("Cleaned up input file")
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up input file: {str(cleanup_error)}")

@require_http_methods(["GET"])
def serve_video(request, video_path):
    """Serve video files with proper content type."""
    try:
        file_path = os.path.join(settings.MEDIA_ROOT, video_path)
        if not os.path.exists(file_path):
            return HttpResponse('Video not found', status=404)

        # Get the content type based on file extension
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type or not content_type.startswith('video/'):
            content_type = 'video/mp4'  # Default to MP4 if type cannot be determined

        # Open the file in binary mode
        video_file = open(file_path, 'rb')
        response = FileResponse(video_file, content_type=content_type)
        response['Accept-Ranges'] = 'bytes'
        return response

    except Exception as e:
        logger.error(f"Error serving video: {str(e)}")
        return HttpResponse('Error serving video', status=500) 