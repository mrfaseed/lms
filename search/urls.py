from django.urls import path
from .views import SearchView, SearchAPIView

urlpatterns = [
    path("", SearchView.as_view(), name="query"),
    path("api/", SearchAPIView.as_view(), name="api_query"),
]
