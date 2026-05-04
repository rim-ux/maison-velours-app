from rest_framework import serializers
from .models import Category, Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image         = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model  = Product
        fields = ['id', 'category', 'category_name', 'name', 'description',
                  'price', 'image_url', 'image', 'available']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Resolve the image field to an absolute URL so the frontend always gets a usable URL
        if instance.image:
            request = self.context.get('request')
            url = instance.image.url
            data['image_url'] = request.build_absolute_uri(url) if request else url
        # Never expose the raw ImageField path alongside image_url — keep image write-only in reads
        data.pop('image', None)
        return data


class CategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'icon', 'order', 'products']


class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'icon', 'order']
