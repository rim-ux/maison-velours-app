from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, create_payment_intent, stripe_webhook

router = DefaultRouter()
router.register('', PaymentViewSet, basename='payment')

urlpatterns = [
    path('create-intent/', create_payment_intent),
    path('webhook/',       stripe_webhook),
    path('', include(router.urls)),
]
