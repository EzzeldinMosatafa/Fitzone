from django.db import models
from django.conf import settings

class Video(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_file = models.FileField(upload_to='videos/', max_length=255)
    image = models.ImageField(upload_to='videos/thumbnails/', null=True, blank=True)
    duration = models.IntegerField(help_text='Duration in minutes')
    calories = models.PositiveIntegerField(default=0, help_text='Estimated calories burned')
    body_focus = models.CharField(max_length=50, choices=[
        ('Total', 'Total Body'),
        ('Core', 'Core'),
        ('Upper', 'Upper Body'),
        ('Lower', 'Lower Body')
    ])
    category = models.CharField(max_length=50, null=True, blank=True)
    difficulty = models.CharField(max_length=50, choices=[
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard')
    ])
    equipment = models.JSONField(default=list)
    structure = models.JSONField(default=list)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        db_table = 'video'

    def __str__(self):
        return self.title 

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey('Video', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.user.username} on {self.video.title}'


class VideoLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey('Video', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'video']

    def __str__(self):
        return f'{self.user.username} likes {self.video.title}'


class VideoSave(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey('Video', on_delete=models.CASCADE, related_name='saves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'video']

    def __str__(self):
        return f'{self.user.username} saved {self.video.title}'


class VideoComplete(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey('Video', on_delete=models.CASCADE, related_name='completions')
    calories_burned = models.PositiveIntegerField(default=0, help_text='Calories burned from this video')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'video']

    def __str__(self):
        return f'{self.user.username} completed {self.video.title}'
    
    def save(self, *args, **kwargs):
        # احفظ السعرات من الفيديو عند الإنشاء لأول مرة
        if not self.pk and not self.calories_burned:
            self.calories_burned = self.video.calories or 0
        super().save(*args, **kwargs) 