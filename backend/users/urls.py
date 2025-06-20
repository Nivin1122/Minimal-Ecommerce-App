from django.urls import path
from .views import get_notes,CustomTokenObtainPairView,CustomRefreshTokenView,is_authenticated,register,logout

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('notes/',get_notes),
    path('authenticated/',is_authenticated),
    path('register/',register),
    path('logout/', logout, name='logout'),

]