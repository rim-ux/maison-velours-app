from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, MessageViewSet

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notification')
router.register('messages',      MessageViewSet,      basename='message')

urlpatterns = [path('', include(router.urls))]
