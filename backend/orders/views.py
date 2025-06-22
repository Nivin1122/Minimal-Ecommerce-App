from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import Address
from products.models import CartItem
from .models import Order, OrderItem
from .serializers import OrderSerializer



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