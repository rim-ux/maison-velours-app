from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Table, Reservation
from .serializers import TableSerializer, ReservationSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and request.user.role == 'admin')


class TableViewSet(viewsets.ModelViewSet):
    queryset           = Table.objects.all()
    serializer_class   = TableSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs     = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs


def _send_reservation_notification(reservation, new_status):
    """Create a Notification for the reservation's linked user."""
    if not reservation.user:
        return
    try:
        from apps.notifications.models import Notification
        if new_status == 'confirmed':
            title = 'Réservation confirmée ✓'
            body  = (
                f"Votre réservation du {reservation.date} à {reservation.time} "
                f"pour {reservation.guests} personne(s) a été confirmée. "
                "Connectez-vous et passez votre commande pour finaliser votre expérience !"
            )
            ntype = 'reservation_confirmed'
        else:
            title = 'Réservation annulée'
            body  = (
                f"Votre réservation du {reservation.date} à {reservation.time} "
                "a malheureusement été annulée. "
                "Contactez-nous pour plus d'informations."
            )
            ntype = 'reservation_cancelled'

        Notification.objects.create(
            recipient      = reservation.user,
            type           = ntype,
            title          = title,
            body           = body,
            reservation_id = reservation.id,
        )
    except Exception:
        pass  # Never break the reservation update if notification fails


class ReservationViewSet(viewsets.ModelViewSet):
    queryset         = Reservation.objects.all().select_related('user')
    serializer_class = ReservationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticatedOrReadOnly()]
        if self.action == 'my_reservations':
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

    @action(detail=False, methods=['get'])
    def my_reservations(self, request):
        qs = Reservation.objects.filter(user=request.user).order_by('-created_at')
        return Response(ReservationSerializer(qs, many=True).data)

    def partial_update(self, request, *args, **kwargs):
        instance   = self.get_object()
        old_status = instance.status
        response   = super().partial_update(request, *args, **kwargs)
        new_status = instance.status
        # Notify user if status changed to confirmed or cancelled
        if old_status != new_status and new_status in ('confirmed', 'cancelled'):
            _send_reservation_notification(instance, new_status)
        return response
