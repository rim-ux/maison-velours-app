from rest_framework import serializers
from .models import Notification, Message


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'type', 'title', 'body', 'is_read',
                  'reservation_id', 'order_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name    = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    is_from_admin  = serializers.SerializerMethodField()

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'sender_name', 'recipient', 'recipient_name',
                  'body', 'is_read', 'is_from_admin', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name() or obj.recipient.username

    def get_is_from_admin(self, obj):
        return obj.sender.role == 'admin'
