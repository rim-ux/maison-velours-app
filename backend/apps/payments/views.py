import socket
import ssl
import json
import urllib.parse
import http.client

from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer

# IPs IPv4 de api.stripe.com (DNS64/NAT64 bloque la résolution DNS Python)
_STRIPE_IPS = ['34.241.54.72', '34.240.123.193', '34.241.202.139']


def _stripe_post(path, params, api_key, timeout=10):
    """
    Appelle l'API Stripe en contournant le DNS problématique.
    On crée un socket IPv4 direct, puis on enveloppe avec TLS (SNI=api.stripe.com).
    """
    body = urllib.parse.urlencode(params).encode()
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': str(len(body)),
        'User-Agent': 'stripe-python/8.9.0',
        'Stripe-Version': '2023-10-16',
    }

    ctx = ssl.create_default_context()
    last_err = None

    for ip in _STRIPE_IPS:
        try:
            tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            tcp.settimeout(timeout)
            tcp.connect((ip, 443))
            ssl_sock = ctx.wrap_socket(tcp, server_hostname='api.stripe.com')
            ssl_sock.settimeout(timeout)

            conn = http.client.HTTPSConnection('api.stripe.com', timeout=timeout)
            conn.sock = ssl_sock

            conn.request('POST', path, body, headers)
            resp = conn.getresponse()
            data = json.loads(resp.read().decode())
            conn.close()
            return resp.status, data
        except Exception as e:
            last_err = e
            try:
                tcp.close()
            except Exception:
                pass

    raise ConnectionError(f'Stripe injoignable sur toutes les IPs : {last_err}')


class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.select_related('order__user').all()
        return Payment.objects.filter(order__user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    amount = request.data.get('amount')
    if not amount:
        return Response({'error': 'Le champ amount est requis.'}, status=400)

    api_key = settings.STRIPE_SECRET_KEY
    if not api_key:
        return Response({'error': 'Stripe non configuré — ajoutez STRIPE_SECRET_KEY dans backend/.env'}, status=500)

    try:
        amount_centimes = int(float(amount) * 100)
        status_code, data = _stripe_post(
            '/v1/payment_intents',
            {
                'amount': amount_centimes,
                'currency': 'eur',
                'metadata[user_id]': str(request.user.id),
            },
            api_key,
        )

        if status_code == 200 and 'client_secret' in data:
            return Response({'client_secret': data['client_secret']})

        # Stripe retourne un objet erreur
        err_msg = data.get('error', {}).get('message', 'Erreur Stripe inconnue')
        err_type = data.get('error', {}).get('type', '')
        if err_type == 'invalid_request_error' and 'authentication' in err_msg.lower():
            return Response({'error': f'Clé Stripe invalide : {err_msg}'}, status=400)
        return Response({'error': err_msg}, status=400)

    except ConnectionError as e:
        return Response({'error': f'Impossible de joindre Stripe : {e}'}, status=503)
    except Exception as e:
        return Response({'error': f'Erreur serveur : {e}'}, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload    = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, Exception):
        return Response(status=400)

    if event['type'] == 'payment_intent.succeeded':
        pi = event['data']['object']
        try:
            payment = Payment.objects.get(transaction_ref=pi['id'])
            payment.status = 'complete'
            payment.save()
        except Payment.DoesNotExist:
            pass

    return Response({'status': 'ok'})
