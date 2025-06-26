from django.urls import path
from .views import add_product,list_products,edit_product,delete_product,add_to_cart, get_cart_items, remove_cart_item,update_cart_quantity,add_category,list_categories,edit_category,product_detail


urlpatterns = [
    path('add/', add_product, name='add_product'),
    path('list/', list_products, name='list_products'),
    path('edit/<int:pk>/', edit_product, name='edit_product'),
    path('delete/<int:pk>/', delete_product, name='delete_product'),

    path('cart/add/', add_to_cart),
    path('cart/list/', get_cart_items),
    path('cart/remove/<int:item_id>/', remove_cart_item),
    path('cart/update-quantity/<int:item_id>/', update_cart_quantity),

    path('category/add/', add_category),
    path('category/list/', list_categories),
    path('category/edit/<int:pk>/', edit_category),

    path('detail/<int:id>/', product_detail),

]