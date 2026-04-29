from django.db import models


class DeliveryZone(models.Model):
    name = models.CharField(max_length=100, verbose_name='Zone')
    description = models.TextField(blank=True)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='Frais de livraison')
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Zone de livraison'

    def __str__(self):
        return f"{self.name} ({self.delivery_fee} MAD)"
