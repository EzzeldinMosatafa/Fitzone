from rest_framework import serializers
from .models import Video, Comment

class VideoSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    def get_video_url(self, obj):
        if obj.video_file:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.video_file.url)
            except Exception:
                pass
            # fallback to absolute URL
            return f"/media/{obj.video_file.name}"
        return ''
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return 'http://127.0.0.1:8000' + obj.image.url
        return None
    
    def get_comments(self, obj):
        comments = Comment.objects.filter(video=obj)
        return CommentSerializer(comments, many=True).data
    
    def validate_video_file(self, value):
        if not value:
            raise serializers.ValidationError("Video file is required")
        # Check file size (e.g., 100MB limit)
        if value.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("Video file size must be no more than 100MB")
        # Check file type
        if not value.name.lower().endswith(('.mp4', '.avi', '.mov', '.wmv')):
            raise serializers.ValidationError("Unsupported video format. Please upload MP4, AVI, MOV, or WMV files.")
        return value

    def validate_image(self, value):
        if value:
            # Check file size (e.g., 5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image file size must be no more than 5MB")
            # Check file type
            if not value.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise serializers.ValidationError("Unsupported image format. Please upload JPG, JPEG, or PNG files.")
        return value

    def validate_duration(self, value):
        if not value:
            raise serializers.ValidationError("Duration is required")
        if not isinstance(value, (int, float)) or value <= 0:
            raise serializers.ValidationError("Duration must be a positive number")
        return value

    def validate_body_focus(self, value):
        if not value:
            raise serializers.ValidationError("Body focus is required")
        valid_choices = ['Total', 'Core', 'Upper', 'Lower']
        if value not in valid_choices:
            raise serializers.ValidationError(f"Body focus must be one of: {', '.join(valid_choices)}")
        return value

    def validate_difficulty(self, value):
        if not value:
            raise serializers.ValidationError("Difficulty is required")
        valid_choices = ['Easy', 'Medium', 'Hard']
        if value not in valid_choices:
            raise serializers.ValidationError(f"Difficulty must be one of: {', '.join(valid_choices)}")
        return value

    def validate(self, data):
        # Set category based on body_focus if not provided
        if 'body_focus' in data and not data.get('category'):
            data['category'] = data['body_focus']
        return data
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_file', 'video_url',
            'image', 'image_url', 'duration', 'calories', 'body_focus', 'category',
            'difficulty', 'equipment', 'structure', 'details', 'created_at', 'updated_at',
            'comments'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'video', 'content', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None

    def validate(self, data):
        # Ensure we have a user from the request
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({
                "detail": "You must be authenticated to post comments"
            })

        # Validate video
        video = data.get('video')
        if not video:
            raise serializers.ValidationError({
                "video": "Video is required"
            })

        # Validate content
        content = data.get('content')
        if not content or not content.strip():
            raise serializers.ValidationError({
                "content": "Comment content cannot be empty"
            })

        # Clean the data
        data['content'] = content.strip()
        return data

    def create(self, validated_data):
        # Get the request from context
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError({
                "detail": "Request context is required"
            })

        # Set the user from the request
        validated_data['user'] = request.user
        return super().create(validated_data)

    def to_representation(self, instance):
        # Get the base representation
        data = super().to_representation(instance)
        
        # Add user's email to the response
        data['user_email'] = instance.user.email if instance.user else None
        
        # Add timestamps in a readable format
        data['created_at'] = instance.created_at.strftime('%Y-%m-%d %H:%M:%S')
        data['updated_at'] = instance.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        
        return data

# NOTE: Frontend must upload video_file using FormData, not JSON, with the key 'video_file'. 