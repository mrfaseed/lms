from django.urls import path
from . import views

app_name = 'quiz-api'

urlpatterns = [
    path('<slug:course_slug>/quizzes/', views.CourseQuizListAPIView.as_view(), name='course_quizzes_list'),
    path('<slug:quiz_slug>/take/', views.QuizTakeAPIView.as_view(), name='quiz_take'),
    path('<slug:quiz_slug>/submit/', views.QuizSubmitAPIView.as_view(), name='quiz_submit'),
]
