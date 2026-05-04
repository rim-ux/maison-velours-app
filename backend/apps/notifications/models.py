from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('reservation_confirmed', 'Réservation confirmée'),
        ('reservation_cancelled', 'Réservation annulée'),
        ('reservation_pending',   'Réservation en attente'),
        ('order_update',          'Mise à jour commande'),
        ('message',               'Message'),
    ]

    recipient      = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    type           = models.CharField(max_length=30, choices=TYPE_CHOICES, default='message')
    title          = models.CharField(max_length=200)
    body           = models.TextField()
    is_read        = models.BooleanField(default=False)
    reservation_id = models.PositiveIntegerField(null=True, blank=True)
    order_id       = models.PositiveIntegerField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'

    def __str__(self):
        return f"[{self.type}] → {self.recipient.username}: {self.title}"


class Message(models.Model):
    sender    = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages'
    )
    body      = models.TextField()
    is_read   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Message'

    def __str__(self):
        return f"{self.sender.username} → {self.recipient.username}: {self.body[:40]}"
