from django.urls import path
from .views import CustomTokenObtainPairView,CustomRefreshTokenView,is_authenticated,register,logout,list_addresses, add_address, delete_address,google_login,send_otp

urlpatterns = [
    
    path('google-login/', google_login),
    path('send-otp/', send_otp),

    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('authenticated/',is_authenticated),
    path('register/',register),
    path('logout/', logout, name='logout'),

    path('address/list/', list_addresses),
    path('address/add/', add_address),
    path('address/delete/<int:address_id>/', delete_address),

]