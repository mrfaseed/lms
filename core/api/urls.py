from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('student-dashboard/', views.StudentDashboardAPIView.as_view(), name='student-dashboard-stats'),
    path('calendar/', views.CalendarEventsAPIView.as_view(), name='calendar-events'),
    path('execute/', views.ExecuteCodeAPIView.as_view(), name='execute-code'),
]
