from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/tables/', include('apps.tables.urls')),
    path('api/delivery/', include('apps.delivery.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/stats/', include('apps.stats.urls')),
    path('api/',       include('apps.notifications.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
