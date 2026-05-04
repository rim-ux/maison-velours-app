from rest_framework import serializers
from .models import Table, Reservation


class TableSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Table
        fields = ['id', 'number', 'capacity', 'status', 'status_display', 'location']


class ReservationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Reservation
        fields = ['id', 'user', 'user_username', 'name', 'email', 'phone',
                  'date', 'time', 'guests', 'message', 'status', 'status_display', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']
