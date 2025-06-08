from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
import random
import string

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, default='')
    last_name = models.CharField(max_length=30, default='')
    is_admin = models.BooleanField(default=False)
    target = models.CharField(max_length=100, default='')
    source = models.CharField(max_length=100, default='')
    points = models.PositiveIntegerField(default=0)  # Add points field
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def add_points(self, points):
        """Add points to user's total points"""
        self.points += points
        self.save(update_fields=['points'])


class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        super().save(*args, **kwargs)
    
    def generate_token(self):
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        """Check if token is expired (valid for 15 minutes)"""
        return timezone.now() > (self.created_at + timezone.timedelta(minutes=15))
    
    def __str__(self):
        return f"Reset token for {self.user.email}: {self.token}"
    
    @classmethod
    def cleanup_expired_tokens(cls):
        """Delete expired tokens"""
        expired_tokens = cls.objects.filter(
            created_at__lt=timezone.now() - timezone.timedelta(minutes=15)
        )
        count = expired_tokens.count()
        expired_tokens.delete()
        return count
