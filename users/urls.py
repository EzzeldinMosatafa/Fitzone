from django.urls import path
from . import views
from .views import UserListView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('register/', views.register_user, name='register'),
    path('register-admin/', views.register_admin, name='register-admin'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('<int:pk>/', views.user_detail, name='user-detail'),
    path('<int:pk>/promote/', views.promote_to_admin, name='promote-to-admin'),
    path('<int:pk>/demote/', views.demote_from_admin, name='demote-from-admin'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('profile/', views.get_user_profile, name='user-profile'),
    path('profile/update/', views.update_profile_image, name='update-profile-image'),
    # Password reset URLs
    path('password-reset/request/', views.password_reset_request, name='password-reset-request'),
    path('password-reset/verify/', views.password_reset_verify, name='password-reset-verify'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    # Change password URL
    path('change-password/', views.change_password, name='change-password'),
]
