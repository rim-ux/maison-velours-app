from django.urls import path
from .views import OverviewView, TopProductsView, DailyRevenueView, OrdersByTypeView

urlpatterns = [
    path('overview/', OverviewView.as_view(), name='stats-overview'),
    path('top-products/', TopProductsView.as_view(), name='stats-top-products'),
    path('daily-revenue/', DailyRevenueView.as_view(), name='stats-daily-revenue'),
    path('orders-by-type/', OrdersByTypeView.as_view(), name='stats-orders-by-type'),
]
