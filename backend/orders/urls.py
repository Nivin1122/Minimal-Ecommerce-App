from django.urls import path
from .views import place_order_cod,list_user_orders


urlpatterns = [
    path('place-order/', place_order_cod),
    path('user-orders/', list_user_orders),
]