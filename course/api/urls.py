from django.urls import path
from .views import ProgramListAPIView, CourseListAPIView, CourseDetailAPIView, LecturerCoursesAPIView

urlpatterns = [
    path('list/', ProgramListAPIView.as_view(), name='program-list'),
    path('courses/', CourseListAPIView.as_view(), name='course-list'),
    path('courses/<slug:slug>/', CourseDetailAPIView.as_view(), name='course-detail'),
    path('lecturer/<int:lecturer_id>/courses/', LecturerCoursesAPIView.as_view(), name='lecturer-courses'),
]
