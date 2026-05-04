from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, FavoriteViewSet, BestSellersView, RecommendationsView

router = DefaultRouter()
router.register('categories',  CategoryViewSet,  basename='category')
router.register('products',    ProductViewSet,    basename='product')
router.register('favorites',   FavoriteViewSet,   basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
    path('best-sellers/',    BestSellersView.as_view(),    name='best-sellers'),
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
