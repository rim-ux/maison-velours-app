from django.contrib import admin
from .models import DeliveryZone


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'delivery_fee', 'active']
    list_editable = ['active', 'delivery_fee']
