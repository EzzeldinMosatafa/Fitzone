from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VideoViewSet, CommentViewSet, VideoListCreateView, VideoDetailView,
    video_like_view, video_save_view, video_complete_view,
    user_liked_videos, user_saved_videos, user_completed_videos, user_calories_stats
)

router = DefaultRouter()
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add direct paths for list/create and detail views
    path('videos/', VideoListCreateView.as_view(), name='video-list-create'),
    path('videos/<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
    
    # Video interaction endpoints
    path('videos/<int:video_id>/like/', video_like_view, name='video-like'),
    path('videos/<int:video_id>/save/', video_save_view, name='video-save'),
    path('videos/<int:video_id>/complete/', video_complete_view, name='video-complete'),
    
    # User video lists
    path('user/liked-videos/', user_liked_videos, name='user-liked-videos'),
    path('user/saved-videos/', user_saved_videos, name='user-saved-videos'),
    path('user/completed-videos/', user_completed_videos, name='user-completed-videos'),
    path('user/calories-stats/', user_calories_stats, name='user-calories-stats'),
] 