from django.urls import path
from .views import place_order_cod,list_user_orders,create_stripe_checkout, check_payment_status


urlpatterns = [
    path('place-order/', place_order_cod),
    path('user-orders/', list_user_orders),
    path('stripe/create-checkout/', create_stripe_checkout),
    path('stripe/payment-status/', check_payment_status),

]