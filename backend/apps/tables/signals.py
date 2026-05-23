from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Reservation


@receiver(pre_save, sender=Reservation)
def sync_table_status_on_reservation_change(sender, instance, **kwargs):
    """
    Automatically keeps Table.status in sync with Reservation.status.
    - confirmed + table assigned  → table becomes 'reservee'
    - cancelled / pending         → previously assigned table becomes 'libre'
    - table reassigned by admin   → old table freed, new table reserved
    """
    if not instance.pk:
        return  # new reservation, nothing to sync yet

    try:
        old = Reservation.objects.select_related('table').get(pk=instance.pk)
    except Reservation.DoesNotExist:
        return

    old_status = old.status
    new_status = instance.status
    old_table  = old.table
    new_table  = instance.table

    status_changed = old_status != new_status
    table_changed  = old_table != new_table

    if not status_changed and not table_changed:
        return

    # Free the old table if it was reserved by this reservation and is being replaced or cancelled
    if old_table and (table_changed or new_status in ('cancelled', 'pending')):
        if old_table.status == 'reservee':
            old_table.status = 'libre'
            old_table.save(update_fields=['status'])

    # Reserve the new table when reservation is confirmed
    if new_table and new_status == 'confirmed':
        new_table.status = 'reservee'
        new_table.save(update_fields=['status'])
