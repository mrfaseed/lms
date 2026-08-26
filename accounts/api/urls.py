from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

app_name = "accounts-api"

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.CurrentUserAPIView.as_view(), name="current_user"),
    path("", views.UserListAPIView.as_view(), name="users-api"),
    path("admin/stats/", views.AdminStatsAPIView.as_view(), name="admin-stats"),
    path("admin/users/", views.AdminUserListAPIView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", views.AdminUserDetailAPIView.as_view(), name="admin-user-detail"),
]
