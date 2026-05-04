from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, ReservationViewSet

router = DefaultRouter()
router.register('reservations', ReservationViewSet, basename='reservation')
router.register('', TableViewSet, basename='table')

urlpatterns = [path('', include(router.urls))]
