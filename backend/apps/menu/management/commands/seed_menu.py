from django.core.management.base import BaseCommand
from apps.menu.models import Category, Product


CATEGORIES = [
    {'name': 'Entrées',           'icon': '', 'order': 1},
    {'name': 'Plats Marocains',   'icon': '', 'order': 2},
    {'name': 'Cuisine Italienne', 'icon': '', 'order': 3},
    {'name': 'Cuisine Espagnole', 'icon': '', 'order': 4},
    {'name': 'Desserts',          'icon': '', 'order': 5},
    {'name': 'Boissons',          'icon': '', 'order': 6},
    {'name': 'Cafés',             'icon': '', 'order': 7},
]

PRODUCTS = {
    'Entrées': [
        {
            'name': 'Briouates au Poulet',
            'description': 'Petits triangles feuilletés farcis au poulet épicé et aux herbes fraîches, servis avec sauce harissa.',
            'price': '45.00',
            'image_url': 'https://images.unsplash.com/photo-1548953588-0ada5fc1e44b?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Zaalouk',
            'description': 'Salade chaude d\'aubergines et de tomates mijotées à l\'ail, au cumin et au paprika fumé.',
            'price': '40.00',
            'image_url': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Bruschetta Italienne',
            'description': 'Pain grillé à l\'huile d\'olive, garni de tomates fraîches, basilic et ail. Recette traditionnelle toscane.',
            'price': '38.00',
            'image_url': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Gazpacho Andalou',
            'description': 'Soupe froide de tomates, concombres et poivrons rouges, relevée d\'ail et d\'huile d\'olive vierge.',
            'price': '42.00',
            'image_url': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Plats Marocains': [
        {
            'name': 'Tajine de Poulet aux Olives',
            'description': 'Poulet fermier mijoté dans un tajine avec des olives vertes, citrons confits et herbes de Marrakech.',
            'price': '120.00',
            'image_url': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Couscous Royal aux 7 Légumes',
            'description': 'Semoule fine à la vapeur accompagnée d\'agneau tendre, de merguez halal et de sept légumes de saison.',
            'price': '135.00',
            'image_url': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Pastilla au Poulet',
            'description': 'Tourte feuilletée à la pâte warka farcie de poulet effiloché, amandes grillées et œufs épicés, saupoudrée de sucre glace.',
            'price': '115.00',
            'image_url': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Méchoui d\'Agneau',
            'description': 'Épaule d\'agneau entière rôtie lentement au four pendant 6 heures, servie avec semoule et pain marocain.',
            'price': '155.00',
            'image_url': 'https://images.unsplash.com/photo-1544025162-d76538891d0b?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Harira Marocaine',
            'description': 'Soupe traditionnelle aux tomates, lentilles, pois chiches et coriandre. Réconfortante et généreuse.',
            'price': '45.00',
            'image_url': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Tajine Kefta aux Œufs',
            'description': 'Boulettes de viande hachée épicées cuites dans une sauce tomate maison, garnies d\'œufs pochés.',
            'price': '110.00',
            'image_url': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Cuisine Italienne': [
        {
            'name': 'Spaghetti Bolognese Halal',
            'description': 'Pâtes al dente servies avec une sauce bolognese au bœuf halal mijotée pendant 3 heures avec tomates San Marzano.',
            'price': '95.00',
            'image_url': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Pizza Margherita',
            'description': 'Pizza napolitaine à la pâte fine et croustillante, sauce tomate maison, mozzarella fior di latte et basilic frais.',
            'price': '88.00',
            'image_url': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Risotto aux Champignons',
            'description': 'Risotto crémeux au riz Arborio, champignons de Paris et champignons forestiers, parmesan et beurre fin.',
            'price': '98.00',
            'image_url': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Lasagne al Forno',
            'description': 'Lasagnes gratinées au four avec bœuf halal, béchamel maison et couches de pâtes fraîches.',
            'price': '105.00',
            'image_url': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Pizza au Poulet Grillé',
            'description': 'Pizza garnissante au poulet grillé mariné, poivrons colorés, champignons et mozzarella fondante.',
            'price': '95.00',
            'image_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Cuisine Espagnole': [
        {
            'name': 'Paella au Poulet',
            'description': 'Riz valencien safrané aux cuisses de poulet halal, poivrons rouges et petits pois, cuit dans le bouillon maison.',
            'price': '125.00',
            'image_url': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Patatas Bravas',
            'description': 'Pommes de terre croustillantes servies avec deux sauces signature : brava épicée et aïoli maison.',
            'price': '55.00',
            'image_url': 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Tortilla Espagnole',
            'description': 'Omelette épaisse aux pommes de terre et oignons caramélisés, cuite à l\'huile d\'olive. Recette traditionnelle.',
            'price': '65.00',
            'image_url': 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Pollo al Ajillo',
            'description': 'Morceaux de poulet halal sautés à l\'ail et au paprika fumé dans l\'huile d\'olive, servis avec pain rustique.',
            'price': '115.00',
            'image_url': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Desserts': [
        {
            'name': 'Cornes de Gazelle',
            'description': 'Pâtisseries marocaines en forme de croissant, fourrées d\'amandes à la fleur d\'oranger, délicatement sucrées.',
            'price': '35.00',
            'image_url': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Tiramisu Maison',
            'description': 'Version halal du tiramisu classique : biscuits au café, mascarpone onctueux et cacao amer. Sans alcool.',
            'price': '55.00',
            'image_url': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Crème Brûlée à la Vanille',
            'description': 'Crème onctueuse infusée à la vanille de Madagascar, caramel croquant brûlé à la minute.',
            'price': '50.00',
            'image_url': 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Chebakia au Miel',
            'description': 'Gâteaux marocains frits en forme de fleur, enrobés de miel et parsemés de graines de sésame.',
            'price': '30.00',
            'image_url': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Panna Cotta aux Fruits Rouges',
            'description': 'Crème cuite italienne légèrement vanillée, nappée d\'un coulis de fruits rouges frais.',
            'price': '48.00',
            'image_url': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Boissons': [
        {
            'name': 'Thé à la Menthe',
            'description': 'Thé vert de Chine infusé avec de la menthe fraîche du jardin et du sucre naturel. Servi en théière.',
            'price': '25.00',
            'image_url': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Jus d\'Orange Frais',
            'description': 'Oranges pressées à la minute, sans sucre ajouté. Fruit de saison des vergers marocains.',
            'price': '30.00',
            'image_url': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Citronnade Marocaine',
            'description': 'Limonade artisanale au citron, eau de fleur d\'oranger et menthe fraîche. Rafraîchissante et parfumée.',
            'price': '28.00',
            'image_url': 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Jus d\'Avocat',
            'description': 'Avocat mixé avec du lait frais, miel et arôme de fleur d\'oranger. Spécialité marocaine onctueuse.',
            'price': '35.00',
            'image_url': 'https://images.unsplash.com/photo-1519996409144-56c88c71e4d6?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Eau Minérale',
            'description': 'Eau minérale naturelle plate ou gazeuse.',
            'price': '15.00',
            'image_url': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80&auto=format&fit=crop',
        },
    ],
    'Cafés': [
        {
            'name': 'Café Noir',
            'description': 'Espresso serré ou allongé, préparé avec notre blend maison de grains arabica torréfiés artisanalement.',
            'price': '18.00',
            'image_url': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Cappuccino',
            'description': 'Espresso double surmonté d\'une mousse de lait veloutée, saupoudré de cacao. Art latte sur demande.',
            'price': '28.00',
            'image_url': 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Café au Lait',
            'description': 'Café doux allongé au lait chaud entier. La douceur du matin.',
            'price': '22.00',
            'image_url': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop',
        },
        {
            'name': 'Café Marocain aux Épices',
            'description': 'Café noir infusé avec cardamome, cannelle et clous de girofle. Recette traditionnelle du Maghreb.',
            'price': '25.00',
            'image_url': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop',
        },
    ],
}


class Command(BaseCommand):
    help = 'Charge le menu initial avec plats marocains, italiens et espagnols halal'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Supprimer toutes les données existantes avant de créer')

    def handle(self, *args, **options):
        if options['clear']:
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Données existantes supprimées.'))

        created_cats = 0
        created_prods = 0

        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'icon': cat_data['icon'], 'order': cat_data['order']},
            )
            if created:
                created_cats += 1

            for prod_data in PRODUCTS.get(cat_data['name'], []):
                _, created = Product.objects.get_or_create(
                    name=prod_data['name'],
                    category=cat,
                    defaults={
                        'description': prod_data['description'],
                        'price': prod_data['price'],
                        'image_url': prod_data['image_url'],
                        'available': True,
                    },
                )
                if created:
                    created_prods += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seed termine : {created_cats} categories, {created_prods} produits crees.'
        ))
