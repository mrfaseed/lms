from django.urls import path
from .views import StudentTranscriptAPIView, StudentAnalyticsAPIView, LecturerGradesAPIView

urlpatterns = [
    path('transcript/<int:student_id>/', StudentTranscriptAPIView.as_view(), name='student-transcript-api'),
    path('analytics/<int:student_id>/', StudentAnalyticsAPIView.as_view(), name='student-analytics-api'),
    path('lecturer/<int:lecturer_id>/grades/', LecturerGradesAPIView.as_view(), name='lecturer-grades-api'),
]
