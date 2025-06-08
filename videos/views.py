from rest_framework import generics, viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
import logging
from django.shortcuts import get_object_or_404
from .models import Video, Comment, VideoLike, VideoSave, VideoComplete
from .serializers import VideoSerializer, CommentSerializer
from users.permissions import IsAdminOrReadOnly
from django.core.cache import cache

logger = logging.getLogger(__name__)

class VideoListCreateView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def check_permissions(self, request):
        logger.info(f"Checking permissions for user: {getattr(request.user, 'email', 'Anonymous')}")
        logger.info(f"User is authenticated: {request.user.is_authenticated}")
        logger.info(f"User is staff: {request.user.is_staff}")
        logger.info(f"User is admin: {getattr(request.user, 'is_admin', False)}")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {request.headers}")
        return super().check_permissions(request)

    def get_object(self):
        pk = self.kwargs.get('pk')
        # اطبع كل الفيديوهات الموجودة
        print("DEBUG: All videos:", list(Video.objects.values('id', 'title')))
        print("DEBUG: Requested pk:", pk)
        try:
            video = get_object_or_404(Video, pk=pk)
            print(f"DEBUG: Found video: {video.title}")
            return video
        except Video.DoesNotExist:
            print(f"DEBUG: Video with ID {pk} not found")
            raise

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"Attempting to delete video {instance.id} by user {getattr(request.user, 'email', 'Anonymous')}")
            
            # Additional permission check
            if not getattr(request.user, 'is_admin', False):
                logger.warning(f"User {getattr(request.user, 'email', 'Anonymous')} attempted to delete video without admin privileges")
                return Response(
                    {"detail": "You do not have permission to delete videos."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            self.perform_destroy(instance)
            logger.info(f"Successfully deleted video {instance.id}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Video.DoesNotExist:
            logger.error(f"Video {kwargs.get('pk')} not found")
            return Response(
                {"detail": "Video not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting video: {str(e)}")
            return Response(
                {"detail": "An error occurred while deleting the video."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # حماية من زيادة views مرتين لنفس الـ IP خلال 10 ثواني
        user_ip = request.META.get('REMOTE_ADDR', 'unknown')
        cache_key = f"video_viewed_{instance.id}_{user_ip}"
        if not cache.get(cache_key):
            instance.views = (instance.views or 0) + 1
            instance.save(update_fields=["views"])
            cache.set(cache_key, True, timeout=10)  # 10 ثواني
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.select_related('user', 'video')

    def perform_create(self, serializer):
        logger.info(f"Attempting to create comment by user: {self.request.user}")
        logger.info(f"Request headers: {self.request.headers}")
        logger.info(f"Request data: {self.request.data}")
        
        try:
            # Ensure the user is authenticated
            if not self.request.user.is_authenticated:
                raise permissions.PermissionDenied("You must be authenticated to post comments.")
            
            # Add the user to the serializer data
            serializer.save(user=self.request.user)
            logger.info("Comment created successfully")
        except Exception as e:
            logger.error(f"Error creating comment: {str(e)}")
            raise

    def perform_update(self, serializer):
        logger.info(f"Attempting to update comment by user: {self.request.user}")
        comment = self.get_object()
        if comment.user != self.request.user:
            logger.warning(f"User {self.request.user} attempted to edit comment {comment.id} owned by {comment.user}")
            raise permissions.PermissionDenied("You cannot edit other users' comments.")
        serializer.save()
        logger.info("Comment updated successfully")

    def perform_destroy(self, instance):
        logger.info(f"Attempting to delete comment {instance.id} by user: {self.request.user}")
        if instance.user != self.request.user:
            logger.warning(f"User {self.request.user} attempted to delete comment {instance.id} owned by {instance.user}")
            raise permissions.PermissionDenied("You cannot delete other users' comments.")
        instance.delete()
        logger.info("Comment deleted successfully")

    def create(self, request, *args, **kwargs):
        logger.info("Comment creation request received")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        logger.info(f"Auth header: {request.headers.get('Authorization', 'No Auth header')}")
        logger.info(f"Request data: {request.data}")
        
        # Ensure user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required to post comments."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response = super().create(request, *args, **kwargs)
        logger.info(f"Comment creation response status: {response.status_code}")
        return response

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]  # Remove IsAdminOrReadOnly for general video access
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        video = self.get_object()
        
        if request.method == 'GET':
            comments = Comment.objects.filter(video=video)
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            logger.info(f"Add comment request received for video {pk}")
            logger.info(f"User authenticated: {request.user.is_authenticated}")
            logger.info(f"Auth header: {request.headers.get('Authorization', 'No Auth header')}")
            logger.info(f"Request data: {request.data}")
            
            try:
                # Add video to the request data
                data = request.data.copy()
                data['video'] = video.id
                
                serializer = CommentSerializer(data=data, context={'request': request})
                if serializer.is_valid():
                    logger.info("Comment data valid")
                    serializer.save()
                    logger.info("Comment saved successfully")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    logger.error(f"Comment data invalid: {serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error adding comment: {str(e)}")
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


# Video Like Views
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def video_like_view(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    user = request.user
    
    if request.method == 'GET':
        is_liked = VideoLike.objects.filter(user=user, video=video).exists()
        return Response({'is_liked': is_liked})
    
    elif request.method == 'POST':
        like, created = VideoLike.objects.get_or_create(user=user, video=video)
        if created:
            return Response({'message': 'Video liked successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Video already liked'}, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        try:
            like = VideoLike.objects.get(user=user, video=video)
            like.delete()
            return Response({'message': 'Video unliked successfully'}, status=status.HTTP_204_NO_CONTENT)
        except VideoLike.DoesNotExist:
            return Response({'message': 'Video not liked'}, status=status.HTTP_404_NOT_FOUND)


# Video Save Views
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def video_save_view(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    user = request.user
    
    if request.method == 'GET':
        is_saved = VideoSave.objects.filter(user=user, video=video).exists()
        return Response({'is_saved': is_saved})
    
    elif request.method == 'POST':
        save, created = VideoSave.objects.get_or_create(user=user, video=video)
        if created:
            return Response({'message': 'Video saved successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Video already saved'}, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        try:
            save = VideoSave.objects.get(user=user, video=video)
            save.delete()
            return Response({'message': 'Video unsaved successfully'}, status=status.HTTP_204_NO_CONTENT)
        except VideoSave.DoesNotExist:
            return Response({'message': 'Video not saved'}, status=status.HTTP_404_NOT_FOUND)


# Video Complete Views
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def video_complete_view(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    user = request.user
    
    if request.method == 'GET':
        is_completed = VideoComplete.objects.filter(user=user, video=video).exists()
        return Response({'is_completed': is_completed})
    
    elif request.method == 'POST':
        complete, created = VideoComplete.objects.get_or_create(
            user=user, 
            video=video,
            defaults={'calories_burned': video.calories or 0}
        )
        if created:
            return Response({'message': 'Video marked as completed successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Video already completed'}, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        try:
            complete = VideoComplete.objects.get(user=user, video=video)
            complete.delete()
            return Response({'message': 'Video marked as incomplete successfully'}, status=status.HTTP_204_NO_CONTENT)
        except VideoComplete.DoesNotExist:
            return Response({'message': 'Video not completed'}, status=status.HTTP_404_NOT_FOUND)


# User Video Lists Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_liked_videos(request):
    user = request.user
    liked_videos = Video.objects.filter(likes__user=user).order_by('-likes__created_at')
    serializer = VideoSerializer(liked_videos, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_saved_videos(request):
    user = request.user
    saved_videos = Video.objects.filter(saves__user=user).order_by('-saves__created_at')
    serializer = VideoSerializer(saved_videos, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_completed_videos(request):
    user = request.user
    completed_videos = Video.objects.filter(completions__user=user).order_by('-completions__created_at')
    serializer = VideoSerializer(completed_videos, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_calories_stats(request):
    """Get user's calories statistics"""
    user = request.user
    from django.db.models import Sum
    from django.utils import timezone
    from datetime import timedelta
    

    
    # إجمالي السعرات المحروقة
    total_calories = VideoComplete.objects.filter(user=user).aggregate(
        total=Sum('calories_burned')
    )['total'] or 0
    
    # السعرات المحروقة هذا الأسبوع
    week_ago = timezone.now() - timedelta(days=7)
    weekly_calories = VideoComplete.objects.filter(
        user=user, 
        created_at__gte=week_ago
    ).aggregate(total=Sum('calories_burned'))['total'] or 0
    
    # السعرات المحروقة اليوم
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_calories = VideoComplete.objects.filter(
        user=user,
        created_at__gte=today_start
    ).aggregate(total=Sum('calories_burned'))['total'] or 0
    
    # عدد الفيديوهات المكتملة
    completed_count = VideoComplete.objects.filter(user=user).count()
    
    result = {
        'total_calories': total_calories,
        'weekly_calories': weekly_calories,
        'daily_calories': daily_calories,
        'completed_videos_count': completed_count
    }
    

    
    return Response(result) 