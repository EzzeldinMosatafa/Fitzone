from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from users.permissions import IsAdminOrReadOnly
from rest_framework.response import Response
from .models import Article
from .serializers import ArticleSerializer

# Create your views here.

class ArticleListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views = (instance.views or 0) + 1
        instance.save(update_fields=["views"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
