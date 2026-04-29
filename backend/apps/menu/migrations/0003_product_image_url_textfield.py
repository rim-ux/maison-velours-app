from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0002_product_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image_url',
            field=models.TextField(blank=True, default=''),
        ),
    ]
