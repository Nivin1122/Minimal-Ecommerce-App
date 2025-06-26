from django.urls import path
from .views import AdminTokenObtainPairView, AdminRefreshTokenView, is_admin_authenticated, admin_logout, get_dashboard_stats

urlpatterns = [
    path('token/', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    path('token/refresh/', AdminRefreshTokenView.as_view(), name='admin_token_refresh'),
    path('authenticated/', is_admin_authenticated, name='admin_authenticated'),
    path('logout/', admin_logout, name='admin_logout'),
    path('stats/', get_dashboard_stats, name='dashboard_stats'),
]