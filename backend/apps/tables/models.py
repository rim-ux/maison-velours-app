from django.db import models


class Table(models.Model):
    STATUS_CHOICES = [
        ('libre', 'Libre'),
        ('occupee', 'Occupée'),
        ('reservee', 'Réservée'),
    ]

    number = models.PositiveIntegerField(unique=True, verbose_name='Numéro')
    capacity = models.PositiveIntegerField(default=4, verbose_name='Capacité')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='libre')
    location = models.CharField(max_length=100, blank=True, verbose_name='Emplacement')

    class Meta:
        ordering = ['number']
        verbose_name = 'Table'

    def __str__(self):
        return f"Table {self.number} ({self.get_status_display()})"
