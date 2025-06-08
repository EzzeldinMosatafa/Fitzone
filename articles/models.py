from django.db import models
from django.conf import settings

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='articles/', null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100, default='General')
    is_featured = models.BooleanField(default=False)
    read_time = models.CharField(max_length=20, default='5 min read')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        db_table = 'article'

    def __str__(self):
        return self.title
