from django.db import models
from django.conf import settings


class Category(models.Model):
    name  = models.CharField(max_length=100)
    icon  = models.CharField(max_length=10, blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Catégorie'

    def __str__(self):
        return self.name


class Product(models.Model):
    category    = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=8, decimal_places=2)
    image_url   = models.TextField(blank=True, default='')
    image       = models.ImageField(upload_to='products/', blank=True, null=True)
    available   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Produit'

    def __str__(self):
        return self.name


class Favorite(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']
        verbose_name = 'Favori'

    def __str__(self):
        return f"{self.user.username} ♥ {self.product.name}"
