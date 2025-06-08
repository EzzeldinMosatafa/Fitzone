from django.urls import path
from . import views

urlpatterns = [
    path('', views.ArticleListCreateView.as_view(), name='article-list-create'),
    path('<int:pk>/', views.ArticleDetailView.as_view(), name='article-detail'),
] 