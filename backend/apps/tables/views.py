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
        qs            = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


def _send_reservation_notification(reservation, new_status):
    """Create a Notification for the reservation's linked user."""
    if not reservation.user:
        return
    try:
        from apps.notifications.models import Notification
        table_info = ''
        if new_status == 'confirmed' and reservation.table:
            loc = f' ({reservation.table.location})' if reservation.table.location else ''
            table_info = f' Votre table N°{reservation.table.number}{loc} vous est réservée.'

        if new_status == 'confirmed':
            title = 'Réservation confirmée ✓'
            body  = (
                f"Votre réservation du {reservation.date.strftime('%d/%m/%Y')} à "
                f"{str(reservation.time)[:5]} pour {reservation.guests} "
                f"personne(s) a été confirmée.{table_info}"
            )
            ntype = 'reservation_confirmed'
        else:
            title = 'Réservation annulée'
            body  = (
                f"Votre réservation du {reservation.date.strftime('%d/%m/%Y')} à "
                f"{str(reservation.time)[:5]} a malheureusement été annulée. "
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
    queryset         = Reservation.objects.all().select_related('user', 'table')
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
        qs = Reservation.objects.filter(user=request.user).select_related('table').order_by('-created_at')
        return Response(ReservationSerializer(qs, many=True).data)

    def partial_update(self, request, *args, **kwargs):
        """
        Admin-only endpoint.
        Accepts: { status, table } — both optional.
        The pre_save signal handles auto table.status sync.
        """
        instance   = self.get_object()
        old_status = instance.status

        new_status   = request.data.get('status')
        new_table_id = request.data.get('table')

        valid_statuses = [s[0] for s in Reservation.STATUS_CHOICES]
        if new_status and new_status not in valid_statuses:
            return Response({'detail': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_table_id is not None:
            try:
                table = Table.objects.get(pk=int(new_table_id))
                instance.table = table
            except (Table.DoesNotExist, ValueError):
                return Response({'detail': 'Table introuvable.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_status:
            instance.status = new_status

        instance.save()  # triggers pre_save signal → auto table.status sync

        # Reload from DB to get fresh related objects
        instance.refresh_from_db()

        # Notify client if status changed
        if new_status and old_status != new_status and new_status in ('confirmed', 'cancelled'):
            _send_reservation_notification(instance, new_status)

        return Response(ReservationSerializer(instance).data)
