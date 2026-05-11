from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.ProfileView.as_view(), name='profile'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.ClientUpdateView.as_view(), name='user_detail'),
    path('admin-contact/', views.AdminContactView.as_view(), name='admin_contact'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
]
