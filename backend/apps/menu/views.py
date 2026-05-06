from rest_framework import viewsets, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, IntegerField, Value, Case, When
from django.db.models.functions import Coalesce

from .models import Category, Product, Favorite
from .serializers import CategorySerializer, CategorySimpleSerializer, ProductSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return CategorySerializer
        return CategorySimpleSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        qs = super().get_queryset()
        category  = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        if category:
            qs = qs.filter(category_id=category)
        if available is not None:
            qs = qs.filter(available=available.lower() == 'true')
        return qs


# ── Best Sellers ──────────────────────────────────────────────────────────────
class BestSellersView(generics.ListAPIView):
    """Top N products by order volume — available to all authenticated users."""
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from apps.orders.models import OrderItem
        limit   = min(int(self.request.query_params.get('limit', 6)), 20)
        top_ids = list(
            OrderItem.objects
            .values('product')
            .annotate(total=Sum('quantity'))
            .order_by('-total')
            .values_list('product', flat=True)[:limit]
        )
        if not top_ids:
            return Product.objects.filter(available=True)[:limit]
        preserved_order = Case(*[When(id=pk, then=pos) for pos, pk in enumerate(top_ids)])
        return Product.objects.filter(id__in=top_ids, available=True).order_by(preserved_order)


# ── Recommendations ───────────────────────────────────────────────────────────
class RecommendationsView(generics.ListAPIView):
    """Products similar to given IDs (same categories), sorted by popularity."""
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ids_param   = self.request.query_params.get('ids', '')
        exclude_ids = [int(i) for i in ids_param.split(',') if i.strip().isdigit()]

        if not exclude_ids:
            # Fallback: globally popular products
            from apps.orders.models import OrderItem
            top_ids = list(
                OrderItem.objects.values('product')
                .annotate(total=Sum('quantity'))
                .order_by('-total')
                .values_list('product', flat=True)[:4]
            )
            return Product.objects.filter(id__in=top_ids, available=True)

        categories = Product.objects.filter(
            id__in=exclude_ids
        ).values_list('category', flat=True).distinct()

        return (
            Product.objects
            .filter(category__in=categories, available=True)
            .exclude(id__in=exclude_ids)
            .annotate(
                total_ordered=Coalesce(
                    Sum('orderitem__quantity'),
                    Value(0),
                    output_field=IntegerField(),
                )
            )
            .order_by('-total_ordered')[:4]
        )


# ── Favorites ─────────────────────────────────────────────────────────────────
class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Return list of favorited product IDs for the current user."""
        ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
        return Response(list(ids))

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        """Toggle favorite status for a product."""
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        fav, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if not created:
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True})

    @action(detail=False, methods=['get'], url_path='products')
    def products(self, request):
        """Return full product data for favorited products."""
        favs     = Favorite.objects.filter(user=request.user).select_related('product__category')
        products = [f.product for f in favs]
        return Response(ProductSerializer(products, many=True, context={'request': request}).data)
