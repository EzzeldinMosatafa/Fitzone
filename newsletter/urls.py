from django.urls import path
from . import views

urlpatterns = [
    path('', views.newsletter_list, name='newsletter-list'),
    path('subscribe/', views.subscribe, name='newsletter_subscribe'),
    path('send/', views.send_newsletter_email, name='newsletter_send'),
    path('<int:pk>/', views.delete_newsletter_subscriber, name='newsletter-delete'),
] 