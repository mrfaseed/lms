from django.urls import path
from . import views
from . import admin_views
from . import lecturer_views

app_name = 'quiz-api'

urlpatterns = [
    # Admin endpoints
    path('admin/quizzes/', admin_views.AdminQuizListCreateAPIView.as_view(), name='admin_quiz_list_create'),
    path('admin/quizzes/<slug:slug>/', admin_views.AdminQuizDetailAPIView.as_view(), name='admin_quiz_detail'),
    path('admin/quizzes/<slug:quiz_slug>/questions/', admin_views.AdminQuestionListCreateAPIView.as_view(), name='admin_question_list_create'),
    path('admin/quizzes/<slug:quiz_slug>/upload-excel/', admin_views.AdminBulkUploadExcelAPIView.as_view(), name='admin_bulk_upload_excel'),
    path('admin/quizzes/<slug:quiz_slug>/sittings/', admin_views.QuizSittingsAPIView.as_view(), name='admin_quiz_sittings'),
    path('admin/sittings/<int:sitting_id>/reset/', admin_views.SittingResetAPIView.as_view(), name='admin_sitting_reset'),
    
    # Lecturer endpoints
    path('lecturer/quizzes/', lecturer_views.LecturerQuizListCreateAPIView.as_view(), name='lecturer_quiz_list_create'),
    path('lecturer/quizzes/<slug:slug>/', lecturer_views.LecturerQuizDetailAPIView.as_view(), name='lecturer_quiz_detail'),
    path('lecturer/quizzes/<slug:quiz_slug>/questions/', lecturer_views.LecturerQuestionListCreateAPIView.as_view(), name='lecturer_question_list_create'),
    path('lecturer/quizzes/<slug:quiz_slug>/upload-excel/', lecturer_views.LecturerBulkUploadExcelAPIView.as_view(), name='lecturer_bulk_upload_excel'),
    path('lecturer/quizzes/<slug:quiz_slug>/sittings/', lecturer_views.LecturerQuizSittingsAPIView.as_view(), name='lecturer_quiz_sittings'),
    path('lecturer/sittings/<int:sitting_id>/reset/', lecturer_views.LecturerSittingResetAPIView.as_view(), name='lecturer_sitting_reset'),

    # Student endpoints
    path('<slug:course_slug>/quizzes/', views.CourseQuizListAPIView.as_view(), name='course_quizzes_list'),
    path('<slug:quiz_slug>/take/', views.QuizTakeAPIView.as_view(), name='quiz_take'),
    path('<slug:quiz_slug>/submit/', views.QuizSubmitAPIView.as_view(), name='quiz_submit'),
    path('<slug:quiz_slug>/violate/', views.QuizViolateAPIView.as_view(), name='quiz_violate'),
]
