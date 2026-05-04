import stripe
from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer


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

    stripe.api_key = settings.STRIPE_SECRET_KEY
    if not stripe.api_key:
        return Response({'error': 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env'}, status=500)

    try:
        # Stripe travaille en sous-unités (1 MAD = 100 centimes)
        amount_centimes = int(float(amount) * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_centimes,
            currency='mad',          # Changez en 'eur' si votre compte Stripe ne supporte pas MAD
            metadata={'user_id': str(request.user.id)},
        )
        return Response({'client_secret': intent.client_secret})
    except stripe.error.StripeError as e:
        return Response({'error': str(e.user_message or e)}, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    payload    = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
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
