from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer,CategorySerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from .models import CartItem,Category
from .serializers import CartItemSerializer



@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def add_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'product': serializer.data})
    return Response({'success': False, 'errors': serializer.errors}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_products(request):
    products = Product.objects.all().order_by('-id')
    serializer = ProductSerializer(products, many=True)
    return Response({'success': True, 'products': serializer.data})



@api_view(['PUT'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def edit_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found'}, status=404)

    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Product updated successfully', 'product': serializer.data})
    
    return Response({'success': False, 'errors': serializer.errors}, status=400)



@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({'success': True, 'message': 'Product deleted successfully'})
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found'}, status=404)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'success': False, 'message': 'Product not found'}, status=404)

    item, created = CartItem.objects.get_or_create(user=user, product=product)
    if not created:
        item.quantity += quantity
        item.save()

    return Response({'success': True, 'message': 'Product added to cart'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart_items(request):
    cart_items = CartItem.objects.filter(user=request.user)
    serializer = CartItemSerializer(cart_items, many=True)
    return Response({'success': True, 'cart': serializer.data})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, user=request.user)
        item.delete()
        return Response({'success': True, 'message': 'Item removed from cart'})
    except CartItem.DoesNotExist:
        return Response({'success': False, 'message': 'Item not found'}, status=404)
    


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, user=request.user)
        action = request.data.get('action')

        if action == 'increment':
            item.quantity += 1
        elif action == 'decrement' and item.quantity > 1:
            item.quantity -= 1
        else:
            return Response({'success': False, 'message': 'Invalid action or quantity too low'}, status=400)

        item.save()
        return Response({'success': True, 'message': 'Quantity updated'})
    except CartItem.DoesNotExist:
        return Response({'success': False, 'message': 'Item not found'}, status=404)
    

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_category(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Category added successfully'})
    return Response({'success': False, 'errors': serializer.errors}, status=400)


@api_view(['GET'])
def list_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response({'categories': serializer.data})


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def edit_category(request, pk):
    try:
        category = Category.objects.get(id=pk)
    except Category.DoesNotExist:
        return Response({'success': False, 'message': 'Category not found'}, status=404)
    
    serializer = CategorySerializer(category, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Category updated successfully'})
    return Response({'success': False, 'message': 'Invalid data', 'errors': serializer.errors}, status=400)