from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.conversations),
    path('thread/',        views.thread),
    path('send/',          views.send),
]
