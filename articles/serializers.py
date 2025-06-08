from rest_framework import serializers
from .models import Article
from users.serializers import UserSerializer

class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return 'http://127.0.0.1:8000' + obj.image.url
        return None
    
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'image', 'image_url', 'tags', 'category', 'is_featured', 'read_time', 'author', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']
