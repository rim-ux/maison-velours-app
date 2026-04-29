from rest_framework import serializers
from .models import Order, OrderItem
from apps.menu.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True)
    zone_name = serializers.CharField(source='delivery_zone.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'order_type', 'type_display',
            'status', 'status_display', 'table', 'table_number',
            'delivery_zone', 'zone_name', 'delivery_address',
            'total', 'notes', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'total', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['order_type', 'table', 'delivery_zone', 'delivery_address', 'notes', 'items']

    def validate(self, data):
        order_type = data.get('order_type')
        if order_type == 'sur_place' and not data.get('table'):
            raise serializers.ValidationError("Une table est requise pour une commande sur place.")
        if order_type == 'livraison' and not data.get('delivery_zone'):
            raise serializers.ValidationError("Une zone de livraison est requise.")
        if not data.get('items'):
            raise serializers.ValidationError("La commande doit contenir au moins un produit.")
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,
            )
        order.calculate_total()
        return order
