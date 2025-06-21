from django.urls import path
from .views import add_product,list_products

urlpatterns = [
    path('add/', add_product, name='add_product'),
    path('list/', list_products, name='list_products'), 
]