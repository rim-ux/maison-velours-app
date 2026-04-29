from rest_framework import serializers
from .models import Table


class TableSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Table
        fields = ['id', 'number', 'capacity', 'status', 'status_display', 'location']
