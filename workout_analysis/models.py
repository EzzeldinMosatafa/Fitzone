from django.db import models
from django.conf import settings

class ProcessedVideo(models.Model):
    original_video = models.FileField(upload_to='uploads/')
    processed_video = models.FileField(upload_to='processed/')
    exercise_type = models.CharField(max_length=50)
    analysis_results = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.exercise_type} - {self.created_at}"

class Article(models.Model):
    title = models.CharField(max_length=200, db_collation='utf8mb4_unicode_ci')
    content = models.TextField(db_collation='utf8mb4_unicode_ci')
    image = models.ImageField(upload_to='articles/', null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True, db_collation='utf8mb4_unicode_ci')
    category = models.CharField(max_length=100, default='General', db_collation='utf8mb4_unicode_ci')
    is_featured = models.BooleanField(default=False)
    read_time = models.CharField(max_length=20, default='5 min read')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        db_table = 'workout_article'

    def __str__(self):
        return self.title

class Video(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_file = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(upload_to='video_thumbnails/', null=True, blank=True)
    category = models.CharField(max_length=50)
    duration = models.DurationField(null=True, blank=True)
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title 