from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = Order.objects.select_related('user', 'table', 'delivery_zone').prefetch_related('items__product')
            status_filter = self.request.query_params.get('status')
            type_filter = self.request.query_params.get('order_type')
            if status_filter:
                qs = qs.filter(status=status_filter)
            if type_filter:
                qs = qs.filter(order_type=type_filter)
            return qs
        return Order.objects.filter(user=user).prefetch_related('items__product')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
        order = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'detail': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save(update_fields=['status'])
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'], url_path='my-orders')
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__product')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
