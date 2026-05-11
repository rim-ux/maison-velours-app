from django.db.models import Q, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations(request):
    """Liste des utilisateurs avec qui l'user courant a échangé."""
    user = request.user
    msgs = Message.objects.filter(Q(sender=user) | Q(recipient=user)).select_related('sender', 'recipient').order_by('created_at')
    contact_map = {}
    for m in msgs:
        other = m.recipient if m.sender == user else m.sender
        contact_map[other.id] = {
            'user': other,
            'last_message': m.body,
            'last_at': m.created_at,
        }
    # Count unread per contact
    unread_qs = Message.objects.filter(recipient=user, is_read=False).values('sender_id').annotate(cnt=Count('id'))
    unread_map = {row['sender_id']: row['cnt'] for row in unread_qs}
    data = [
        {
            'id': info['user'].id,
            'username': info['user'].username,
            'full_name': info['user'].get_full_name() or info['user'].username,
            'last_message': info['last_message'],
            'last_at': info['last_at'],
            'unread': unread_map.get(info['user'].id, 0),
        }
        for info in contact_map.values()
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def thread(request):
    """Fil de messages entre l'user courant et un autre utilisateur."""
    with_id = request.query_params.get('with')
    if not with_id:
        return Response({'error': 'Paramètre ?with= requis'}, status=400)
    try:
        other = User.objects.get(pk=with_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable'}, status=404)

    user = request.user
    messages = Message.objects.filter(
        Q(sender=user, recipient=other) | Q(sender=other, recipient=user)
    ).select_related('sender')

    # Marquer les messages reçus comme lus
    messages.filter(recipient=user, is_read=False).update(is_read=True)

    return Response(MessageSerializer(messages, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send(request):
    """Envoyer un message à un autre utilisateur."""
    recipient_id = request.data.get('recipient_id')
    body = request.data.get('body', '').strip()

    if not recipient_id:
        return Response({'error': 'recipient_id requis'}, status=400)
    if not body:
        return Response({'error': 'Le message ne peut pas être vide'}, status=400)

    try:
        recipient = User.objects.get(pk=recipient_id)
    except User.DoesNotExist:
        return Response({'error': 'Destinataire introuvable'}, status=404)

    msg = Message.objects.create(sender=request.user, recipient=recipient, body=body)
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
