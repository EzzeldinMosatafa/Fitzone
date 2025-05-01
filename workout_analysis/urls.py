from django.urls import path
from . import views

urlpatterns = [
    path('analyze-squat/', views.analyze_squat, name='analyze_squat'),
    path('analyze-pushup/', views.analyze_pushup, name='analyze_pushup'),
    path('analyze-plank/', views.analyze_plank, name='analyze_plank'),
    path('analyze-lunges/', views.analyze_lunges, name='analyze_lunges'),
    path('analyze-running/', views.analyze_running, name='analyze_running'),
    path('analyze-bicepcurl/', views.analyze_bicepcurl, name='analyze_bicepcurl'),
    path('media/<path:video_path>', views.serve_video, name='serve_video'),
] 