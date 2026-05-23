from rest_framework import serializers
from .models import Table, Reservation


class TableSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Table
        fields = ['id', 'number', 'capacity', 'status', 'status_display', 'location']


class ReservationSerializer(serializers.ModelSerializer):
    user_username  = serializers.CharField(source='user.username', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # Table info (read-only — table assignment is done via partial_update in the view)
    table_number   = serializers.IntegerField(source='table.number',   read_only=True, default=None, allow_null=True)
    table_location = serializers.CharField(source='table.location',    read_only=True, default=None, allow_null=True)
    table_capacity = serializers.IntegerField(source='table.capacity', read_only=True, default=None, allow_null=True)

    class Meta:
        model  = Reservation
        fields = [
            'id', 'user', 'user_username',
            'name', 'email', 'phone',
            'date', 'time', 'guests', 'message',
            'status', 'status_display',
            'table', 'table_number', 'table_location', 'table_capacity',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'status', 'table', 'created_at']
