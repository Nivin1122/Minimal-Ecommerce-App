# users/admin_views.py
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from products.models import Product, Category
from orders.models import Order, OrderItem
from django.db.models import Sum, Count
from orders.serializers import OrderSerializer
from decimal import Decimal


class AdminTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            print("Admin login attempt received")
            
            username = request.data.get('username')
            password = request.data.get('password')
            
            user = authenticate(username=username, password=password)
            
            if user is None:
                print("Authentication failed")
                return Response({'success': False, 'message': 'Invalid credentials'}, status=401)
            
            if not user.is_staff:
                print("User is not admin")
                return Response({'success': False, 'message': 'Admin access required'}, status=403)
            
            print("Admin authentication successful")
            
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            print(f"Admin Access token: {access_token[:20]}...")
            print(f"Admin Refresh token: {refresh_token[:20]}...")
            
            res = Response()
            res.data = {
                'success': True,
                'message': 'Admin login successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            }
            
            res.set_cookie(
                key="admin_access_token",
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            res.set_cookie(
                key="admin_refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            
            print("Admin cookies set successfully")
            return res
            
        except Exception as e:
            print(f"Admin login error: {e}")
            return Response({'success': False, 'message': 'Login failed'}, status=500)


class AdminRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('admin_refresh_token')
            
            if not refresh_token:
                return Response({'refreshed': False, 'message': 'No refresh token found'}, status=401)
            
            request.data['refresh'] = refresh_token
            
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens['access']
            
            res = Response()
            res.data = {'refreshed': True, 'message': 'Token refreshed successfully'}
            
            res.set_cookie(
                key='admin_access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            return res
            
        except Exception as e:
            print(f"Admin token refresh error: {e}")
            return Response({'refreshed': False, 'message': 'Token refresh failed'}, status=401)


@api_view(['POST'])
def admin_logout(request):
    try:
        res = Response()
        res.data = {'success': True, 'message': 'Admin logged out successfully'}
        res.delete_cookie('admin_access_token', path='/', samesite='Lax')
        res.delete_cookie('admin_refresh_token', path='/', samesite='Lax')
        return res
        
    except Exception as e:
        print(f"Admin logout error: {e}")
        return Response({'success': False, 'message': 'Logout failed'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_admin_authenticated(request):
    try:
       
        if not request.user.is_staff:
            return Response({'authenticated': False, 'message': 'Admin access required'}, status=403)
        
        return Response({
            'authenticated': True,
            'user': {
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    except Exception as e:
        print(f"Admin auth check error: {e}")
        return Response({'authenticated': False, 'message': 'Authentication check failed'}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_dashboard_stats(request):
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    
    order_stats = Order.objects.aggregate(
        total_sales=Sum('total_price'),
        total_orders=Count('id')
    )
    
    total_sales = order_stats.get('total_sales') or 0
    total_orders = order_stats.get('total_orders') or 0
    
    # Calculate profit (e.g., 25% margin)
    if total_sales:
        total_profit = total_sales * Decimal('0.25')
    else:
        total_profit = 0
    
    # Get recent orders
    recent_orders = Order.objects.order_by('-created_at')[:5]
    recent_orders_serializer = OrderSerializer(recent_orders, many=True)
    
    stats = {
        'total_products': total_products,
        'total_categories': total_categories,
        'total_orders': total_orders,
        'total_sales': total_sales,
        'total_profit': total_profit,
        'recent_orders': recent_orders_serializer.data,
    }
    
    return Response(stats)


