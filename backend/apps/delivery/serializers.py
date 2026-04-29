from rest_framework import serializers
from .models import DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'description', 'delivery_fee', 'active']
