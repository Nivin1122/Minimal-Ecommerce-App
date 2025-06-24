from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view,permission_classes

from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from .serializer import UserRegistrationSerializer

from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)

from .models import Address,EmailOTP
from .serializer import AddressSerializer

import google.oauth2.id_token
import google.auth.transport.requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
import random
from django.core.cache import cache

from .tasks import delete_otp_after_5_minutes
from django.utils.timezone import now

import logging




# Create your views here.

logger = logging.getLogger(__name__)


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

    try:
        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Delete any existing OTPs for this email first
        EmailOTP.objects.filter(email=email).delete()

        # Save new OTP in database
        EmailOTP.objects.create(email=email, otp=otp)

        # Schedule Celery task to delete OTP after 5 minutes (300 seconds)
        task_result = delete_otp_after_5_minutes.apply_async(
            args=[email], 
            countdown=300  # 5 minutes = 300 seconds
        )
        
        logger.info(f"📧 OTP created for {email}, scheduled deletion task: {task_result.id}")

        # Send email
        send_mail(
            'Your OTP Code',
            f'Your OTP is: {otp}. This OTP will expire in 5 minutes.',
            'no-reply@example.com',
            [email],
            fail_silently=False,
        )
        
        return Response({
            'success': True, 
            'message': 'OTP sent successfully. Valid for 5 minutes.',
            'task_id': task_result.id  # Optional: return task ID for tracking
        })
        
    except Exception as e:
        logger.error(f"❌ Error sending OTP to {email}: {str(e)}")
        return Response({
            'success': False, 
            'message': 'Failed to send OTP. Please try again.'
        }, status=500)



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
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    otp = request.data.get('otp')

    # Validate required fields
    if not all([username, email, password, otp]):
        return Response({
            'success': False, 
            'message': 'All fields are required'
        }, status=400)

    try:
        # Get the latest OTP for this email
        otp_entry = EmailOTP.objects.filter(email=email).latest('created_at')
        
        # Check if OTP is expired
        if otp_entry.is_expired():
            EmailOTP.objects.filter(email=email).delete()  # Clean up expired OTP
            return Response({
                'success': False, 
                'message': 'OTP has expired. Please request a new one.'
            }, status=400)
            
    except EmailOTP.DoesNotExist:
        return Response({
            'success': False, 
            'message': 'OTP not found or expired. Please request a new one.'
        }, status=400)

    # Verify OTP
    if otp_entry.otp != otp:
        return Response({
            'success': False, 
            'message': 'Incorrect OTP'
        }, status=400)

    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'success': False, 
                'message': 'Username already exists'
            }, status=400)
            
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False, 
                'message': 'Email already registered'
            }, status=400)

        # Create user
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password
        )

        # Clean up all OTPs for this email
        EmailOTP.objects.filter(email=email).delete()

        logger.info(f"✅ User registered successfully: {username} ({email})")

        return Response({
            'success': True, 
            'message': 'Account created successfully'
        })
        
    except Exception as e:
        logger.error(f"❌ Error creating user {username}: {str(e)}")
        return Response({
            'success': False, 
            'message': 'Failed to create account. Please try again.'
        }, status=500)




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