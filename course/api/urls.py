from django.urls import path
from .views import (
    ProgramListAPIView, ProgramDetailAPIView, CourseListAPIView, CourseDetailAPIView, 
    LecturerCoursesAPIView, AdminCourseAllocationAPIView, AdminCourseAllocationDetailAPIView,
    LecturerUploadAPIView, LecturerUploadVideoAPIView, LecturerDeleteUploadAPIView, LecturerDeleteVideoAPIView,
    CatalogListAPIView
)

urlpatterns = [
    path('list/', ProgramListAPIView.as_view(), name='program-list'),
    path('<int:pk>/', ProgramDetailAPIView.as_view(), name='program-detail'),
    path('courses/', CourseListAPIView.as_view(), name='course-list'),
    path('catalog/', CatalogListAPIView.as_view(), name='catalog-list'),
    path('courses/<slug:slug>/', CourseDetailAPIView.as_view(), name='course-detail'),
    path('lecturer/<int:lecturer_id>/courses/', LecturerCoursesAPIView.as_view(), name='lecturer-courses'),
    
    # Admin allocation endpoints
    path('allocations/', AdminCourseAllocationAPIView.as_view(), name='admin-allocations'),
    path('allocations/<int:pk>/', AdminCourseAllocationDetailAPIView.as_view(), name='admin-allocations-detail'),

    # Lecturer uploads
    path('lecturer/<slug:slug>/upload/', LecturerUploadAPIView.as_view(), name='lecturer-upload'),
    path('lecturer/<slug:slug>/upload-video/', LecturerUploadVideoAPIView.as_view(), name='lecturer-upload-video'),
    path('lecturer/<slug:slug>/upload/<int:upload_id>/', LecturerDeleteUploadAPIView.as_view(), name='lecturer-delete-upload'),
    path('lecturer/<slug:slug>/upload-video/<int:video_id>/', LecturerDeleteVideoAPIView.as_view(), name='lecturer-delete-video'),
]
