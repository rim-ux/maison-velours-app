from rest_framework import viewsets, permissions
from .models import DeliveryZone
from .serializers import DeliveryZoneSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    queryset = DeliveryZone.objects.filter(active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = DeliveryZone.objects.all()
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return qs
        return qs.filter(active=True)
