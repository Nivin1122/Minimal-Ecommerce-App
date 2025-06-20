# users/admin_authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth.models import AnonymousUser


class AdminCookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        admin_access_token = request.COOKIES.get('admin_access_token')
        
        if not admin_access_token:
            return None
        
        try:
            validated_token = self.get_validated_token(admin_access_token)
            user = self.get_user(validated_token)
            
            if not user.is_staff:
                return None
                
            return (user, validated_token)
            
        except InvalidToken:
            return None
        except Exception as e:
            print(f"Admin authentication error: {e}")
            return None