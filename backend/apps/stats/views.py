from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class OverviewView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(status__in=['en_attente', 'en_preparation']).count()

        total_revenue = Payment.objects.filter(status='complete').aggregate(t=Sum('amount'))['t'] or 0
        today_revenue = Payment.objects.filter(status='complete', created_at__date=today).aggregate(t=Sum('amount'))['t'] or 0
        month_revenue = Payment.objects.filter(status='complete', created_at__date__gte=month_ago).aggregate(t=Sum('amount'))['t'] or 0

        return Response({
            'orders': {
                'total': total_orders,
                'today': today_orders,
                'pending': pending_orders,
            },
            'revenue': {
                'total': float(total_revenue),
                'today': float(today_revenue),
                'month': float(month_revenue),
            },
        })


class TopProductsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        top = (
            OrderItem.objects
            .values('product__id', 'product__name', 'product__category__name')
            .annotate(total_quantity=Sum('quantity'), total_revenue=Sum(F('quantity') * F('unit_price')))
            .order_by('-total_quantity')[:limit]
        )
        return Response(list(top))


class DailyRevenueView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 7))
        start = timezone.now().date() - timedelta(days=days - 1)

        payments = (
            Payment.objects
            .filter(status='complete', created_at__date__gte=start)
            .values('created_at__date')
            .annotate(revenue=Sum('amount'), orders=Count('id'))
            .order_by('created_at__date')
        )

        result = [
            {
                'date': str(p['created_at__date']),
                'revenue': float(p['revenue']),
                'orders': p['orders'],
            }
            for p in payments
        ]
        return Response(result)


class OrdersByTypeView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        data = (
            Order.objects
            .values('order_type')
            .annotate(count=Count('id'))
        )
        return Response(list(data))
