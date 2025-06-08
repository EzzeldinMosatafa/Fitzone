from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser, PasswordResetToken
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, BasePermission
from .serializers import UserSerializer, UserRegistrationSerializer, PasswordResetRequestSerializer, PasswordResetVerifySerializer, PasswordResetConfirmSerializer
from .email_utils import send_password_reset_email, send_password_reset_success_email
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework import generics
import os
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db.models import Count
from newsletter.models import Newsletter
from articles.models import Article
from videos.models import Video
from django.utils import timezone
from datetime import timedelta
from django.db import connection
from .points_system import award_points
from django.core.cache import cache
import datetime
from rest_framework.parsers import MultiPartParser, FormParser

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.check_password(password):
                # Check if this is the first login of the day
                last_login_key = f"last_login_{user.id}"
                last_login = cache.get(last_login_key)
                now = timezone.now()
                
                if not last_login or (now - last_login).days >= 1:
                    # Award points for daily login
                    award_points(user, 'daily_login')
                    cache.set(last_login_key, now, timeout=86400)  # 24 hours
                
                # Update last login
                user.last_login = now
                user.save(update_fields=['last_login'])
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    },
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_admin': user.is_admin,
                        'points': user.points
                    }
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class IsAdminOrReadOnly(IsAdminUser):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_admin

class IsAdminUserDB(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin,
                'points': user.points,
                'target': user.target,
                'source': user.source
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def register_admin(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        # Set is_admin to True
        serializer.validated_data['is_admin'] = True
        
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user_data = {
        'id': request.user.id,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'is_admin': request.user.is_admin,
        'target': request.user.target,
        'source': request.user.source,
        'points': request.user.points,
        'date_joined': request.user.date_joined
    }
    return Response(user_data)

class UserListView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = CustomUser.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            if role == 'admin':
                queryset = queryset.filter(is_admin=True)
            elif role == 'user':
                queryset = queryset.filter(is_admin=False)
        return queryset

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user_role(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        is_admin = request.data.get('is_admin')
        if is_admin is not None:
            user.is_admin = is_admin
            user.save()
            return Response(UserSerializer(user).data)
        return Response({'error': 'is_admin field is required'}, status=status.HTTP_400_BAD_REQUEST)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserDB])
def user_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def promote_to_admin(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.is_admin = True
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def demote_from_admin(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user.is_admin = False
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserDB])
def admin_stats(request):
    try:
        time_filter = request.query_params.get('time_filter', 'week')
        total_users = CustomUser.objects.count()
        total_admins = CustomUser.objects.filter(is_admin=True).count()
        
        # Count articles from workout_article table
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM workout_article")
            total_articles = cursor.fetchone()[0]
        
        total_videos = Video.objects.count()
        total_subscribers = Newsletter.objects.count()

        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        last_7_days = now - timedelta(days=7)

        new_users_this_month = CustomUser.objects.filter(date_joined__gte=start_of_month).count()
        new_users_this_week = CustomUser.objects.filter(date_joined__gte=start_of_week).count()
        active_users = CustomUser.objects.filter(last_login__gte=last_7_days).count()

        # Get most viewed articles from workout_article table
        from workout_analysis.models import Article as WorkoutArticle
        most_viewed_articles = list(WorkoutArticle.objects.order_by('-views')
            .values('id', 'title', 'views', 'category', 'created_at')[:5])
        
        # Get most viewed videos
        most_viewed_videos = list(Video.objects.order_by('-views')
            .values('id', 'title', 'views', 'category', 'created_at')[:5])
        
        # Most active users (by points and last_login)
        most_active_users = list(CustomUser.objects.exclude(last_login=None)
            .order_by('-points', '-last_login')
            .values('id', 'email', 'first_name', 'last_name', 'last_login', 'date_joined', 'points')[:5])

        # Format dates for most active users
        for user in most_active_users:
            if user['last_login']:
                user['last_login'] = user['last_login'].strftime('%Y-%m-%d %H:%M:%S')
            if user['date_joined']:
                user['date_joined'] = user['date_joined'].strftime('%Y-%m-%d %H:%M:%S')

        # Calculate user growth data based on time filter
        user_growth_data = []
        if time_filter == 'day':
            # Hourly data for the last 24 hours
            for i in range(24, -1, -1):
                hour_start = now - timedelta(hours=i)
                hour_end = now - timedelta(hours=i-1) if i > 0 else now
                count = CustomUser.objects.filter(date_joined__gte=hour_start, date_joined__lt=hour_end).count()
                user_growth_data.append({
                    'date': hour_start.strftime('%H:%M'),
                    'count': count
                })
        elif time_filter == 'week':
            # Daily data for the last 7 days
            for i in range(7, -1, -1):
                day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = (now - timedelta(days=i-1)).replace(hour=0, minute=0, second=0, microsecond=0) if i > 0 else now
                count = CustomUser.objects.filter(date_joined__gte=day_start, date_joined__lt=day_end).count()
                user_growth_data.append({
                    'date': day_start.strftime('%a %d'),
                    'count': count
                })
        elif time_filter == 'month':
            # Data for each day of the current month
            current_month = now.month
            current_year = now.year
            days_in_month = (datetime.date(current_year, current_month + 1, 1) if current_month < 12 
                             else datetime.date(current_year + 1, 1, 1)).replace(day=1) - datetime.timedelta(days=1)
            days_in_month = days_in_month.day
            
            for day in range(1, days_in_month + 1):
                day_date = datetime.date(current_year, current_month, day)
                if day_date > now.date():
                    break
                day_start = datetime.datetime.combine(day_date, datetime.time.min, tzinfo=timezone.get_current_timezone())
                day_end = datetime.datetime.combine(day_date, datetime.time.max, tzinfo=timezone.get_current_timezone())
                count = CustomUser.objects.filter(date_joined__gte=day_start, date_joined__lte=day_end).count()
                user_growth_data.append({
                    'date': day_date.strftime('%d %b'),
                    'count': count
                })
        elif time_filter == 'year':
            # Monthly data for the last 12 months
            for i in range(11, -1, -1):
                month_date = (now - timedelta(days=30*i)).replace(day=1)
                month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if month_date.month == 12:
                    next_month = datetime.date(month_date.year + 1, 1, 1)
                else:
                    next_month = datetime.date(month_date.year, month_date.month + 1, 1)
                month_end = datetime.datetime.combine(next_month, datetime.time.min, tzinfo=timezone.get_current_timezone())
                count = CustomUser.objects.filter(date_joined__gte=month_start, date_joined__lt=month_end).count()
                user_growth_data.append({
                    'date': month_date.strftime('%b %Y'),
                    'count': count
                })

        # Calculate content growth data
        content_growth_data = []
        if time_filter == 'day':
            # Hourly data for the last 24 hours
            for i in range(24, -1, -1):
                hour_start = now - timedelta(hours=i)
                hour_end = now - timedelta(hours=i-1) if i > 0 else now
                
                # Count articles
                article_count = 0
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT COUNT(*) FROM workout_article WHERE created_at >= %s AND created_at < %s",
                        [hour_start, hour_end]
                    )
                    article_count = cursor.fetchone()[0]
                
                # Count videos
                video_count = Video.objects.filter(created_at__gte=hour_start, created_at__lt=hour_end).count()
                
                content_growth_data.append({
                    'date': hour_start.strftime('%H:%M'),
                    'articles': article_count,
                    'videos': video_count,
                    'total': article_count + video_count
                })
        elif time_filter == 'week':
            # Daily data for the last 7 days
            for i in range(7, -1, -1):
                day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = (now - timedelta(days=i-1)).replace(hour=0, minute=0, second=0, microsecond=0) if i > 0 else now
                
                # Count articles
                article_count = 0
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT COUNT(*) FROM workout_article WHERE created_at >= %s AND created_at < %s",
                        [day_start, day_end]
                    )
                    article_count = cursor.fetchone()[0]
                
                # Count videos
                video_count = Video.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
                
                content_growth_data.append({
                    'date': day_start.strftime('%a %d'),
                    'articles': article_count,
                    'videos': video_count,
                    'total': article_count + video_count
                })
        elif time_filter == 'month':
            # Data for each day of the current month
            current_month = now.month
            current_year = now.year
            days_in_month = (datetime.date(current_year, current_month + 1, 1) if current_month < 12 
                          else datetime.date(current_year + 1, 1, 1)).replace(day=1) - datetime.timedelta(days=1)
            days_in_month = days_in_month.day
            
            for day in range(1, days_in_month + 1):
                day_date = datetime.date(current_year, current_month, day)
                if day_date > now.date():
                    break
                day_start = datetime.datetime.combine(day_date, datetime.time.min, tzinfo=timezone.get_current_timezone())
                day_end = datetime.datetime.combine(day_date, datetime.time.max, tzinfo=timezone.get_current_timezone())
                
                # Count articles
                article_count = 0
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT COUNT(*) FROM workout_article WHERE created_at >= %s AND created_at <= %s",
                        [day_start, day_end]
                    )
                    article_count = cursor.fetchone()[0]
                
                # Count videos
                video_count = Video.objects.filter(created_at__gte=day_start, created_at__lte=day_end).count()
                
                content_growth_data.append({
                    'date': day_date.strftime('%d %b'),
                    'articles': article_count,
                    'videos': video_count,
                    'total': article_count + video_count
                })
        elif time_filter == 'year':
            # Monthly data for the last 12 months
            for i in range(11, -1, -1):
                month_date = (now - timedelta(days=30*i)).replace(day=1)
                month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if month_date.month == 12:
                    next_month = datetime.date(month_date.year + 1, 1, 1)
                else:
                    next_month = datetime.date(month_date.year, month_date.month + 1, 1)
                month_end = datetime.datetime.combine(next_month, datetime.time.min, tzinfo=timezone.get_current_timezone())
                
                # Count articles
                article_count = 0
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT COUNT(*) FROM workout_article WHERE created_at >= %s AND created_at < %s",
                        [month_start, month_end]
                    )
                    article_count = cursor.fetchone()[0]
                
                # Count videos
                video_count = Video.objects.filter(created_at__gte=month_start, created_at__lt=month_end).count()
                
                content_growth_data.append({
                    'date': month_date.strftime('%b %Y'),
                    'articles': article_count,
                    'videos': video_count,
                    'total': article_count + video_count
                })
        
        return Response({
            'total_users': total_users,
            'total_admins': total_admins,
            'total_articles': total_articles,
            'total_videos': total_videos,
            'total_subscribers': total_subscribers,
            'new_users_this_month': new_users_this_month,
            'new_users_this_week': new_users_this_week,
            'active_users': active_users,
            'most_viewed_articles': most_viewed_articles,
            'most_viewed_videos': most_viewed_videos,
            'most_active_users': most_active_users,
            'user_growth_data': user_growth_data,
            'content_growth_data': content_growth_data
        })
    except Exception as e:
        print(f"Error in admin_stats: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile_image(request):
    try:
        user = request.user
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
            user.save()
            serializer = UserSerializer(user, context={'request': request})
            return Response({
                'message': 'Profile image updated successfully',
                'profile_image': serializer.data.get('profile_image_url')
            })
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Password Reset Views
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset - send verification code to email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = CustomUser.objects.get(email=email)
        
        # Delete any existing tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()
        
        # Create new token
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Send email with verification code
        email_sent = send_password_reset_email(user, reset_token.token)
        
        if email_sent:
            return Response({
                'message': 'Verification code sent to your email',
                'expires_in_minutes': 15
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_verify(request):
    """Verify the reset token"""
    serializer = PasswordResetVerifySerializer(data=request.data)
    if serializer.is_valid():
        return Response({
            'message': 'Token verified successfully',
            'verified': True
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Reset password with verified token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        # Send confirmation email
        send_password_reset_success_email(user)
        
        return Response({
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """تغيير كلمة السر للمستخدم المتصل"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    # التحقق من وجود البيانات المطلوبة
    if not current_password or not new_password:
        return Response({
            'detail': 'يرجى تقديم كلمة السر الحالية والجديدة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # التحقق من كلمة السر الحالية
    if not user.check_password(current_password):
        return Response({
            'detail': 'كلمة السر الحالية غير صحيحة'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # التحقق من طول كلمة السر الجديدة
    if len(new_password) < 8:
        return Response({
            'detail': 'كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # تحديث كلمة السر
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'تم تغيير كلمة السر بنجاح'
    }, status=status.HTTP_200_OK)
