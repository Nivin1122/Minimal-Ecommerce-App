import stripe
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import Address
from products.models import CartItem
from .models import Order, OrderItem
from .serializers import OrderSerializer
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User

import requests



stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order_cod(request):
    try:
        address_id = request.data.get('address_id')
        address = Address.objects.get(id=address_id, user=request.user)

        cart_items = CartItem.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response({'success': False, 'message': 'Cart is empty'}, status=400)

        total_price = sum(item.product.price * item.quantity for item in cart_items)

        order = Order.objects.create(
            user=request.user,
            address=address,
            total_price=total_price,
            payment_mode='COD'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        cart_items.delete()

        return Response({'success': True, 'message': 'Order placed successfully', 'order_id': order.id})
    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Invalid address'}, status=400)
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout(request):
    user = request.user
    cart_items = CartItem.objects.filter(user=user)
    if not cart_items.exists():
        return Response({'success': False, 'message': 'Cart is empty'}, status=400)

    address_id = request.data.get('address_id')
    try:
        address = Address.objects.get(id=address_id, user=user)
    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Invalid address'}, status=400)

    line_items = [{
        'price_data': {
            'currency': 'inr',
            'product_data': {'name': item.product.name},
            'unit_amount': int(item.product.price * 100),
        },
        'quantity': item.quantity,
    } for item in cart_items]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=settings.CURRENT_DOMAIN + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=settings.CURRENT_DOMAIN + '/payment-cancel',
            metadata={'user_id': str(user.id), 'address_id': str(address.id)},
        )
        return Response({'success': True, 'sessionId': session.id, 'publicKey': settings.STRIPE_PUBLISHABLE_KEY})
    except Exception as e:
        print(f"Stripe session creation error: {e}")
        return Response({'success': False, 'message': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_payment_status(request):
    session_id = request.data.get("sessionId")

    if session_id:
        url = f"https://api.stripe.com/v1/checkout/sessions/{session_id}"
        headers = {
            "Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                session_data = response.json()
                amount_total = session_data.get("amount_total")
                metadata = session_data.get("metadata", {})

                address_id = metadata.get("address_id")
                try:
                    address = Address.objects.get(id=address_id, user=request.user)
                except Address.DoesNotExist:
                    return Response({'success': False, 'message': 'Address not found'}, status=400)

                cart_items = CartItem.objects.filter(user=request.user)
                cart_total = sum(item.product.price * item.quantity for item in cart_items) * 100

                if amount_total == int(cart_total):
                    total_price = cart_total / 100 

                    order = Order.objects.create(
                        user=request.user,
                        address=address,
                        total_price=total_price,
                        payment_mode='Stripe', 
                    )

                    for item in cart_items:
                        OrderItem.objects.create(
                            order=order,
                            product=item.product,
                            quantity=item.quantity,
                            price=item.product.price
                        )

                    cart_items.delete()
                    return Response({'success': True, 'message': "Payment confirmed."})
                else:
                    return Response({'success': False, 'message': "Amount mismatch. Contact support."}, status=400)
            else:
                return Response({'success': False, 'message': "Payment verification failed."}, status=400)

        except Exception as e:
            print(f"Stripe check error: {e}")
            return Response({'success': False, 'message': "Internal error. Try again."}, status=500)

    return Response({'success': False, 'message': "Session ID missing."}, status=400)
