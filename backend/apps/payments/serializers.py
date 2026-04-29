from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_total = serializers.DecimalField(source='order.total', max_digits=10, decimal_places=2, read_only=True)
    client_name = serializers.CharField(source='order.user.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_total', 'client_name',
            'method', 'method_display', 'amount',
            'status', 'status_display', 'transaction_ref', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'method', 'amount', 'transaction_ref']

    def validate_order(self, order):
        if hasattr(order, 'payment'):
            raise serializers.ValidationError("Cette commande a déjà été payée.")
        return order
