from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated



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