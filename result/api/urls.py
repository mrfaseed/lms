from django.urls import path
from .views import StudentTranscriptAPIView, StudentAnalyticsAPIView, LecturerGradesAPIView, AdminEnrollmentAPIView, AdminEnrollmentDetailAPIView, StudentSelfEnrollAPIView

urlpatterns = [
    path('transcript/<int:student_id>/', StudentTranscriptAPIView.as_view(), name='student-transcript-api'),
    path('analytics/<int:student_id>/', StudentAnalyticsAPIView.as_view(), name='student-analytics-api'),
    path('lecturer/<int:lecturer_id>/grades/', LecturerGradesAPIView.as_view(), name='lecturer-grades-api'),
    path('admin-enrollments/', AdminEnrollmentAPIView.as_view(), name='admin-enrollments-api'),
    path('admin-enrollments/<int:pk>/', AdminEnrollmentDetailAPIView.as_view(), name='admin-enrollments-detail-api'),
    path('student/enroll/', StudentSelfEnrollAPIView.as_view(), name='student-enroll-api'),
]
