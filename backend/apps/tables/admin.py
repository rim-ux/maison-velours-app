from django.contrib import admin
from .models import Table, Reservation


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display  = ['number', 'capacity', 'status', 'location']
    list_filter   = ['status']
    list_editable = ['status']
    search_fields = ['number', 'location']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display   = ['id', 'name', 'email', 'phone', 'date', 'time', 'guests', 'status', 'table', 'created_at']
    list_filter    = ['status', 'date']
    search_fields  = ['name', 'email', 'phone']
    readonly_fields = ['created_at']
    autocomplete_fields = []
    raw_id_fields  = ['user', 'table']
    ordering       = ['-created_at']

    fieldsets = (
        ('Client', {'fields': ('user', 'name', 'email', 'phone')}),
        ('Réservation', {'fields': ('date', 'time', 'guests', 'message')}),
        ('Gestion', {'fields': ('status', 'table', 'created_at')}),
    )
