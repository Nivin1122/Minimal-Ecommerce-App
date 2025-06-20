from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view,permission_classes

from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from .models import Note
from .serializer import NoteSerializer,UserRegistrationSerializer

from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)


# Create your views here.

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
    serializer = UserRegistrationSerializer(data=request.data)
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
    
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request):
    user = request.user
    notes = Note.objects.filter(owner=user)
    serializer = NoteSerializer(notes,many=True)
    return Response(serializer.data)