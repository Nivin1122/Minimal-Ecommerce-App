from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view,permission_classes

from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from .serializer import UserRegistrationSerializer

from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)

from .models import Address
from .serializer import AddressSerializer

import google.oauth2.id_token
import google.auth.transport.requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
import random
from django.core.cache import cache


# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('id_token')
    if not token:
        return Response({'success': False, 'message': 'Missing token'}, status=400)

    try:
        idinfo = google.oauth2.id_token.verify_oauth2_token(
            token, google.auth.transport.requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = idinfo.get('email')
        username = email.split('@')[0]

        user, _ = User.objects.get_or_create(email=email, defaults={'username': username})
        refresh = RefreshToken.for_user(user)

        res = Response({'success': True})
        res.set_cookie('access_token', str(refresh.access_token), httponly=True, secure=False, samesite='Lax', path='/')
        res.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax', path='/')
        return res

    except ValueError:
        return Response({'success': False, 'message': 'Invalid token'}, status=400)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'success': False, 'message': 'Email is required'}, status=400)

    otp = str(random.randint(100000, 999999))
    cache.set(email, otp, timeout=300)  # store OTP for 5 minutes

    # Send email
    send_mail(
        'Your OTP Code',
        f'Your OTP is: {otp}',
        'no-reply@example.com',
        [email],
        fail_silently=False,
    )
    return Response({'success': True, 'message': 'OTP sent successfully'})



class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            print("Login attempt received") 
            response = super().post(request, *args, **kwargs)
            print("Token generation successful")  
            
            tokens = response.data
            access_token = tokens['access']
            refresh_token = tokens['refresh']
            
            print(f"Access token: {access_token[:20]}...")  
            print(f"Refresh token: {refresh_token[:20]}...")  

            res = Response()
            res.data = {'success': True}

            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False, 
                samesite='Lax',
                path='/'
            )
            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,  
                samesite='Lax', 
                path='/'
            )
            
            print("Cookies set successfully") 
            return res
            
        except Exception as e:
            print(f"Login error: {e}") 
            return Response({'success': False})


class CustomRefreshTokenView(TokenRefreshView):
    def post(self,request,*args,**kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token

            response = super().post(request,*args,**kwargs)
            tokens = response.data
            access_token = tokens['access']

            res = Response()
            res.data = {'refreshed':True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            return res


        except:
            return Response({'refreshed':False})


@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {'success':True}
        res.delete_cookie('access_token',path='/',samesite='Lax')
        res.delete_cookie('refresh_token',path='/',samesite='Lax')
        return res
    
    except:
        return Response({'success':False})
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'authenticated':True})



@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    otp_from_user = data.get('otp')
    email = data.get('email')
    otp_stored = cache.get(email)

    if otp_stored != otp_from_user:
        return Response({'success': False, 'message': 'Invalid or expired OTP'}, status=400)

    serializer = UserRegistrationSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'username': user.username,
                'email': user.email
            }
        }, status=201)

    return Response({'success': False, 'errors': serializer.errors}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_addresses(request):
    addresses = Address.objects.filter(user=request.user)
    serializer = AddressSerializer(addresses, many=True)
    return Response({'addresses': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_address(request):
    serializer = AddressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'success': True, 'message': 'Address added'})
    return Response({'success': False, 'errors': serializer.errors}, status=400)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_address(request, address_id):
    try:
        address = Address.objects.get(id=address_id, user=request.user)
        address.delete()
        return Response({'success': True, 'message': 'Address deleted'})
    except Address.DoesNotExist:
        return Response({'success': False, 'message': 'Address not found'}, status=404)