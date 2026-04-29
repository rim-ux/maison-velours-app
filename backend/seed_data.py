# -*- coding: utf-8 -*-
import os, sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maison_velours.settings')
django.setup()

from apps.users.models import User
from apps.menu.models import Category, Product
from apps.tables.models import Table
from apps.delivery.models import DeliveryZone

print("=== Maison Velours - Initialisation des donnees ===")

# Admin
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser(
        username='admin', email='admin@maisonvelours.ma',
        password='Admin2024!', first_name='Admin', last_name='Velours',
    )
    admin.role = 'admin'
    admin.save()
    print("[OK] Compte admin cree  (login: admin / Admin2024!)")
else:
    print("[OK] Admin existe deja")

# Categories
cats_data = [
    ('Entrees',   'E', 0),
    ('Plats',     'P', 1),
    ('Desserts',  'D', 2),
    ('Boissons',  'B', 3),
    ('Cafes',     'C', 4),
    ('Vins',      'V', 5),
]
cats = {}
for name, icon, order in cats_data:
    c, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon, 'order': order})
    cats[name] = c
print("[OK] %d categories creees" % len(cats))

# Products
products_data = [
    ('Soupe a l\'oignon gratinee',  'Bouillon de boeuf, oignons caramelises, croutons, gruyere fondu',  45.00, 'Entrees'),
    ('Salade Nicoise',              'Thon, oeufs durs, tomates cerises, olives, anchois',               55.00, 'Entrees'),
    ('Velout de champignons',       'Champignons de Paris, creme fraiche, persil',                       40.00, 'Entrees'),
    ('Coq au Vin',                  'Poulet fermier, vin rouge, lardons, champignons, carottes',        120.00, 'Plats'),
    ('Magret de Canard',            'Sauce aux cerises, puree de pommes de terre, haricots verts',      145.00, 'Plats'),
    ('Filet de Bar en croute',      'Bar de ligne, croute d\'herbes, sauce vierge, legumes du jour',    155.00, 'Plats'),
    ('Entrecote grille',            'Boeuf Angus 300g, sauce bearnaise, frites maison',                 160.00, 'Plats'),
    ('Tajine de poulet aux citrons','Poulet marine, citrons confits, olives, coriandre',                 95.00, 'Plats'),
    ('Risotto aux truffes',         'Riz Arborio, truffe noire, parmesan, beurre',                      130.00, 'Plats'),
    ('Creme brulee',                'Vanille de Madagascar, caramel craquant',                           45.00, 'Desserts'),
    ('Fondant au chocolat',         'Chocolat 70%, coeur coulant, glace vanille',                        50.00, 'Desserts'),
    ('Tarte Tatin',                 'Pommes caramelisees, pate feuilletee, creme fraiche',               48.00, 'Desserts'),
    ('Mousse au chocolat blanc',    'Chocolat blanc, framboises fraiches, coulis',                       42.00, 'Desserts'),
    ('Eau minerale 50cl',           'Eau plate ou gazeuse',                                              15.00, 'Boissons'),
    ('Jus d\'orange frais',         'Oranges pressees a la commande',                                    30.00, 'Boissons'),
    ('Limonade maison',             'Citron, menthe, sucre de canne, eau petillante',                    35.00, 'Boissons'),
    ('Espresso',                    'Cafe arabica selectionne',                                           18.00, 'Cafes'),
    ('Cappuccino',                  'Espresso, mousse de lait, cacao',                                   25.00, 'Cafes'),
    ('The a la menthe',             'The vert, menthe fraiche, sucre',                                   20.00, 'Cafes'),
    ('Vin rouge Medaillon',         'Domaine Larroque, Bordeaux AOC (verre)',                             55.00, 'Vins'),
    ('Vin blanc Chablis',           'Premier Cru, mineral et frais (verre)',                              60.00, 'Vins'),
    ('Rose Provence',               'Chateau Miraval, delicat et fruite (verre)',                         50.00, 'Vins'),
]

count = 0
for name, desc, price, cat_name in products_data:
    _, created = Product.objects.get_or_create(
        name=name,
        defaults={'description': desc, 'price': price, 'category': cats[cat_name], 'available': True},
    )
    if created: count += 1
print("[OK] %d produits crees" % count)

# Tables
tables_data = [
    (1, 2, 'Terrasse'), (2, 2, 'Terrasse'), (3, 4, 'Terrasse'),
    (4, 4, 'Salle principale'), (5, 4, 'Salle principale'),
    (6, 6, 'Salle principale'), (7, 6, 'Salle principale'),
    (8, 8, 'Salon prive'), (9, 10, 'Grande salle'),
]
for number, capacity, location in tables_data:
    Table.objects.get_or_create(number=number, defaults={'capacity': capacity, 'location': location, 'status': 'libre'})
print("[OK] %d tables creees" % len(tables_data))

# Zones de livraison
zones_data = [
    ('Centre-ville',    'Quartier Hassan II, Maarif, Gauthier',       20.00),
    ('Ain Sebaa',       'Ain Sebaa, Sidi Moumen',                      30.00),
    ('Casablanca Sud',  'Hay Hassani, Sidi Bernoussi',                 35.00),
    ('Banlieue proche', 'Ain Chock, Ben M\'sik, Hay Mohammadi',        40.00),
    ('Grand Casablanca','Mohammedia, Bouskoura, Nouaceur',             50.00),
]
for name, desc, fee in zones_data:
    DeliveryZone.objects.get_or_create(name=name, defaults={'description': desc, 'delivery_fee': fee, 'active': True})
print("[OK] %d zones de livraison creees" % len(zones_data))

print("")
print("=== Initialisation terminee avec succes ! ===")
print("Admin: http://localhost:8000/admin")
print("Login: admin / Admin2024!")
