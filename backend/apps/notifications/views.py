from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Notification, Message
from .serializers import NotificationSerializer, MessageSerializer

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'patch', 'post', 'head', 'options']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'read'})

    @action(detail=False, methods=['post'])
    def read_all(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all_read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count})


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            # Admin sees all messages
            return Message.objects.all().select_related('sender', 'recipient')
        # Client sees only their own messages
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Return list of unique conversation partners (admin only)."""
        if request.user.role != 'admin':
            return Response(status=status.HTTP_403_FORBIDDEN)
        # Get distinct clients who have sent messages
        client_ids = Message.objects.values_list('sender_id', flat=True).distinct()
        clients = User.objects.filter(id__in=client_ids, role='client')
        data = []
        for client in clients:
            last_msg = Message.objects.filter(
                Q(sender=client) | Q(recipient=client)
            ).order_by('-created_at').first()
            unread = Message.objects.filter(sender=client, recipient=request.user, is_read=False).count()
            data.append({
                'user_id':   client.id,
                'username':  client.username,
                'full_name': client.get_full_name() or client.username,
                'last_message': last_msg.body[:60] if last_msg else '',
                'last_at':   last_msg.created_at.isoformat() if last_msg else None,
                'unread':    unread,
            })
        data.sort(key=lambda x: x['last_at'] or '', reverse=True)
        return Response(data)

    @action(detail=False, methods=['get'])
    def thread(self, request):
        """Return messages between current user and a specific user."""
        other_id = request.query_params.get('with')
        if not other_id:
            return Response({'error': 'Missing ?with=user_id'}, status=400)
        user = request.user
        try:
            other = User.objects.get(id=other_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        # Mark incoming messages as read
        Message.objects.filter(sender=other, recipient=user, is_read=False).update(is_read=True)
        msgs = Message.objects.filter(
            Q(sender=user, recipient=other) | Q(sender=other, recipient=user)
        ).select_related('sender', 'recipient').order_by('created_at')
        return Response(MessageSerializer(msgs, many=True).data)

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Send a message to a user."""
        recipient_id = request.data.get('recipient_id')
        body = request.data.get('body', '').strip()
        if not recipient_id or not body:
            return Response({'error': 'recipient_id and body are required'}, status=400)
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=404)
        msg = Message.objects.create(sender=request.user, recipient=recipient, body=body)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
