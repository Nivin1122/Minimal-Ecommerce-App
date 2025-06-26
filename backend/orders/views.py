import stripe
import requests
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from users.models import Address
from products.models import CartItem
from .models import Order, OrderItem
from .serializers import OrderSerializer
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User


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
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
        
        cart_items.delete()
        return Response({'success': True, 'message': 'Order placed successfully', 'order_id': order.id})
    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Invalid address'}, status=400)
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout(request):
    user = request.user
    cart_items = CartItem.objects.filter(user=user)
    if not cart_items.exists():
        return Response({'success': False, 'message': 'Cart is empty'}, status=400)

    try:
        address_id = request.data.get('address_id')
        address = Address.objects.get(id=address_id, user=user)
    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Invalid address'}, status=400)


    current_domain = getattr(settings, 'CURRENT_DOMAIN', None)
    if not current_domain or '://' not in current_domain:
        error_message = 'Server configuration error: CURRENT_DOMAIN is not a valid URL in settings.py.'
        print(f"Stripe Error: {error_message}")
        return Response({'success': False, 'message': error_message}, status=500)

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
            success_url=f"{current_domain}/payment-result?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{current_domain}/payment-result?cancelled=true",
            metadata={'user_id': str(user.id), 'address_id': str(address.id)},
        )
        return Response({'success': True, 'sessionId': session.id})
    except Exception as e:
        print(f"Stripe session creation error: {e}")
        return Response({'success': False, 'message': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_payment_status(request):
    session_id = request.data.get("sessionId")

    if not session_id:
        return Response({'success': False, 'message': "Session ID missing."}, status=400)

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            metadata = session.metadata
            address = Address.objects.get(id=metadata['address_id'], user=request.user)
            
            
            if Order.objects.filter(stripe_session_id=session.id).exists():
                return Response({'success': True, 'message': "Payment confirmed. Order already processed."})

            cart_items = CartItem.objects.filter(user=request.user)
            if not cart_items.exists():
                return Response({'success': True, 'message': "Payment confirmed, but cart was empty."})
            
            total_price = session.amount_total / 100

            order = Order.objects.create(
                user=request.user,
                address=address,
                total_price=total_price,
                payment_mode='Stripe',
                payment_status='Paid',
                stripe_session_id=session.id
            )

            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price
                )

            cart_items.delete()
            return Response({'success': True, 'message': "Payment successful and order placed."})
        else:
            return Response({'success': False, 'message': "Payment not successful."}, status=400)

    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Address not found for this order.'}, status=400)
    except stripe.error.StripeError as e:
        print(f"Stripe API error: {e}")
        return Response({'success': False, 'message': f"Stripe error: {e}"}, status=500)
    except Exception as e:
        print(f"Payment check error: {e}")
        return Response({'success': False, 'message': "An internal error occurred."}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_all_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        if new_status not in ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']:
            return Response({'success': False, 'message': 'Invalid status'}, status=400)

        order.status = new_status
        order.save()
        return Response({'success': True, 'message': 'Order status updated successfully'})
    except Order.DoesNotExist:
        return Response({'success': False, 'message': 'Order not found'}, status=404)