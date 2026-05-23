from django.db import models
from django.conf import settings


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending',   'En attente'),
        ('confirmed', 'Confirmée'),
        ('cancelled', 'Annulée'),
    ]

    user    = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reservations',
        verbose_name='Compte client'
    )
    name    = models.CharField(max_length=100, verbose_name='Nom complet')
    email   = models.EmailField(verbose_name='Email')
    phone   = models.CharField(max_length=20, verbose_name='Téléphone')
    date    = models.DateField(verbose_name='Date')
    time    = models.TimeField(verbose_name='Heure')
    guests  = models.PositiveIntegerField(default=2, verbose_name='Nombre de convives')
    message = models.TextField(blank=True, verbose_name='Message')
    status  = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    table   = models.ForeignKey(
        'Table', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reservations',
        verbose_name='Table assignée'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Réservation'

    def __str__(self):
        return f"Réservation {self.name} — {self.date} {self.time}"


class Table(models.Model):
    STATUS_CHOICES = [
        ('libre',    'Libre'),
        ('occupee',  'Occupée'),
        ('reservee', 'Réservée'),
    ]

    number   = models.PositiveIntegerField(unique=True, verbose_name='Numéro')
    capacity = models.PositiveIntegerField(default=4, verbose_name='Capacité')
    status   = models.CharField(max_length=10, choices=STATUS_CHOICES, default='libre')
    location = models.CharField(max_length=100, blank=True, verbose_name='Emplacement')

    class Meta:
        ordering = ['number']
        verbose_name = 'Table'

    def __str__(self):
        return f"Table {self.number} ({self.get_status_display()})"
