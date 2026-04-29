from django.db import models
from apps.orders.models import Order


class Payment(models.Model):
    METHOD_CHOICES = [
        ('especes', 'Espèces'),
        ('carte', 'Carte bancaire'),
        ('en_ligne', 'Paiement en ligne'),
    ]
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('complete', 'Complété'),
        ('rembourse', 'Remboursé'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='complete')
    transaction_ref = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Paiement'

    def __str__(self):
        return f"Paiement #{self.id} — Commande #{self.order_id} ({self.amount} MAD)"
