from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['unit_price', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order_type', 'status', 'total', 'created_at']
    list_filter = ['status', 'order_type']
    inlines = [OrderItemInline]
    readonly_fields = ['total', 'created_at', 'updated_at']
