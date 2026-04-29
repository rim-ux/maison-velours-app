from django.db import models
from django.conf import settings
from apps.menu.models import Product
from apps.tables.models import Table
from apps.delivery.models import DeliveryZone


class Order(models.Model):
    TYPE_CHOICES = [
        ('sur_place', 'Sur place'),
        ('emporter', 'À emporter'),
        ('livraison', 'Livraison'),
    ]
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_preparation', 'En préparation'),
        ('prete', 'Prête'),
        ('livree', 'Livrée / Servie'),
        ('annulee', 'Annulée'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    order_type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='en_attente')
    table = models.ForeignKey(Table, null=True, blank=True, on_delete=models.SET_NULL)
    delivery_zone = models.ForeignKey(DeliveryZone, null=True, blank=True, on_delete=models.SET_NULL)
    delivery_address = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Commande'

    def __str__(self):
        return f"Commande #{self.id} — {self.user.username} ({self.get_status_display()})"

    def calculate_total(self):
        items_total = sum(item.subtotal for item in self.items.all())
        delivery_fee = self.delivery_zone.delivery_fee if self.delivery_zone else 0
        self.total = items_total + delivery_fee
        self.save(update_fields=['total'])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
