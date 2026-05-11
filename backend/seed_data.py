import django
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'maison_velours.settings'
django.setup()

from apps.menu.models import Category, Product

cat_entree, _ = Category.objects.get_or_create(name='Entrees',  defaults={'order': 1})
cat_plat,   _ = Category.objects.get_or_create(name='Plats',    defaults={'order': 2})
cat_dessert,_ = Category.objects.get_or_create(name='Desserts', defaults={'order': 3})
cat_boisson,_ = Category.objects.get_or_create(name='Boissons', defaults={'order': 4})

dishes = [
    {'name':'Saint-Jacques poelees beurre noisette','description':'Noix de Saint-Jacques snackees en beurre noisette au citron vert, risotto cremeux a la truffe blanche.','price':'280.00','category':cat_entree,'image_url':'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Foie gras mi-cuit chutney de figues','description':'Foie gras de canard mi-cuit, chutney de figues au vin rouge, brioche toastee.','price':'220.00','category':cat_entree,'image_url':'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':"Epaule d agneau confite 12h",'description':"Agneau du Moyen Atlas confit dans ses herbes, jus reduit au romarin, puree de carottes safranees.",'price':'320.00','category':cat_plat,'image_url':'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Filet de boeuf Wellington','description':'Filet de boeuf en croute feuilletee, duxelles de champignons, sauce Perigueux.','price':'380.00','category':cat_plat,'image_url':'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Homard roti beurre cafe de Paris','description':'Demi-homard breton roti au four, beurre compose aux herbes, gratin dauphinois.','price':'450.00','category':cat_plat,'image_url':'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Fondant au chocolat coeur velours','description':'Coulant au chocolat noir 72%, ganache fleur de sel, glace vanille Bourbon.','price':'145.00','category':cat_dessert,'image_url':'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Souffle au Grand Marnier','description':"Souffle chaud au Grand Marnier, creme anglaise vanille et zestes d'orange.",'price':'135.00','category':cat_dessert,'image_url':'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Tarte Tatin revisitee','description':'Pommes caramelisees facon tarte Tatin, pate feuilletee, creme fraiche au calvados.','price':'120.00','category':cat_dessert,'image_url':'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=600&q=80&auto=format&fit=crop','available':True},
    {'name':'Eau minerale Sidi Ali','description':'Eau minerale naturelle du Maroc, plate ou gazeuse.','price':'35.00','category':cat_boisson,'image_url':'','available':True},
    {'name':'Jus de fruits frais','description':"Jus presse a la commande : orange, grenade, mangue ou citron menthe.",'price':'65.00','category':cat_boisson,'image_url':'','available':True},
]

for d in dishes:
    p, created = Product.objects.get_or_create(name=d['name'], defaults=d)
    print(('Cree' if created else 'Existant') + ': ' + p.name + ' - ' + str(p.price) + ' MAD')

print('Total produits: ' + str(Product.objects.count()))
print('Total categories: ' + str(Category.objects.count()))
