from django.urls import path
from .views import place_order_cod,list_user_orders,create_stripe_checkout, check_payment_status,list_all_orders,update_order_status


urlpatterns = [
    path('place-order/', place_order_cod),
    path('user-orders/', list_user_orders),
    path('all/', list_all_orders),
    path('stripe/create-checkout/', create_stripe_checkout),
    path('check-payment-status/', check_payment_status),
    path('update-status/<int:order_id>/', update_order_status),
    
]