from django.db import models

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