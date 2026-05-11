from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    is_from_admin = serializers.SerializerMethodField()

    class Meta:
        model  = Message
        fields = ['id', 'body', 'is_from_admin', 'is_read', 'created_at']

    def get_is_from_admin(self, obj):
        return obj.sender.role == 'admin'
