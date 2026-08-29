from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
import pandas as pd

from course.models import Course, CourseAllocation
from quiz.models import Quiz, MCQuestion, Choice, Sitting
from .serializers import QuizSerializer, SittingSerializer

class IsLecturerPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.is_lecturer or request.user.is_superuser)

class LecturerQuizListCreateAPIView(generics.ListCreateAPIView):
    """
    List quizzes for courses the lecturer is allocated to, or create a new one.
    """
    permission_classes = [IsLecturerPermission]
    serializer_class = QuizSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Quiz.objects.all().order_by('-id')
        
        # Get courses allocated to this lecturer
        allocated_courses = Course.objects.filter(allocated_course__lecturer=user)
        return Quiz.objects.filter(course__in=allocated_courses).order_by('-id')

    def perform_create(self, serializer):
        course_id = self.request.data.get('course_id')
        user = self.request.user
        
        if course_id:
            course = get_object_or_404(Course, id=course_id)
            # Verify lecturer is allocated to this course
            if not user.is_superuser and not CourseAllocation.objects.filter(lecturer=user, courses=course).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You are not allocated to this course.")
                
            serializer.save(course=course)
        else:
            serializer.save()

class LecturerQuizDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsLecturerPermission]
    serializer_class = QuizSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Quiz.objects.all()
            
        allocated_courses = Course.objects.filter(allocated_course__lecturer=user)
        return Quiz.objects.filter(course__in=allocated_courses)

class LecturerQuestionListCreateAPIView(APIView):
    permission_classes = [IsLecturerPermission]

    def get_quiz(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        if not request.user.is_superuser:
            if not CourseAllocation.objects.filter(lecturer=request.user, courses=quiz.course).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You don't have access to this quiz.")
        return quiz

    def get(self, request, quiz_slug):
        quiz = self.get_quiz(request, quiz_slug)
        questions = quiz.question_set.all().select_subclasses()
        data = []
        for q in questions:
            if hasattr(q, 'mcquestion'):
                mcq = q.mcquestion
                choices = mcq.get_choices()
                data.append({
                    'id': mcq.id,
                    'content': mcq.content,
                    'explanation': mcq.explanation,
                    'choices': [{'id': c.id, 'choice': c.choice, 'correct': c.correct} for c in choices]
                })
        return Response(data)

    def post(self, request, quiz_slug):
        quiz = self.get_quiz(request, quiz_slug)
        
        content = request.data.get('content')
        choices_data = request.data.get('choices', [])
        explanation = request.data.get('explanation', '')

        if not content or not choices_data:
            return Response({'error': 'Content and choices are required.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            question = MCQuestion.objects.create(
                content=content,
                explanation=explanation
            )
            question.quiz.add(quiz)

            for choice_data in choices_data:
                Choice.objects.create(
                    question=question,
                    choice=choice_data.get('choice'),
                    correct=choice_data.get('correct', False)
                )

        return Response({'success': True, 'question_id': question.id}, status=status.HTTP_201_CREATED)

class LecturerBulkUploadExcelAPIView(APIView):
    permission_classes = [IsLecturerPermission]

    def post(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        if not request.user.is_superuser:
            if not CourseAllocation.objects.filter(lecturer=request.user, courses=quiz.course).exists():
                return Response({'error': 'You do not have permission.'}, status=status.HTTP_403_FORBIDDEN)
                
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)
            with transaction.atomic():
                count = 0
                for index, row in df.iterrows():
                    question_text = str(row.get('Question', '')).strip()
                    if not question_text or pd.isna(row.get('Question')):
                        continue
                    
                    choice_a = str(row.get('Choice A', '')).strip()
                    choice_b = str(row.get('Choice B', '')).strip()
                    choice_c = str(row.get('Choice C', '')).strip()
                    choice_d = str(row.get('Choice D', '')).strip()
                    correct_col = str(row.get('Correct Answer', '')).strip().upper()
                    explanation = str(row.get('Explanation', '')).strip()
                    
                    if pd.isna(explanation):
                        explanation = ''

                    q = MCQuestion.objects.create(content=question_text, explanation=explanation)
                    q.quiz.add(quiz)

                    Choice.objects.create(question=q, choice=choice_a, correct=(correct_col == 'A'))
                    Choice.objects.create(question=q, choice=choice_b, correct=(correct_col == 'B'))
                    if choice_c and choice_c != 'nan':
                        Choice.objects.create(question=q, choice=choice_c, correct=(correct_col == 'C'))
                    if choice_d and choice_d != 'nan':
                        Choice.objects.create(question=q, choice=choice_d, correct=(correct_col == 'D'))
                    count += 1

            return Response({'success': True, 'imported_count': count}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LecturerQuizSittingsAPIView(APIView):
    """
    List all sittings for a specific quiz (Lecturer access).
    """
    permission_classes = [IsLecturerPermission]
    
    def get(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        user = request.user
        
        if not user.is_superuser and not CourseAllocation.objects.filter(lecturer=user, courses=quiz.course).exists():
            return Response({'error': 'Not authorized for this course.'}, status=status.HTTP_403_FORBIDDEN)
            
        sittings = Sitting.objects.filter(quiz=quiz).order_by('-start').select_related('user')
        
        data = []
        for s in sittings:
            d = SittingSerializer(s).data
            d['username'] = s.user.username
            data.append(d)
            
        return Response(data)

class LecturerSittingResetAPIView(APIView):
    """
    Delete a sitting (Lecturer access).
    """
    permission_classes = [IsLecturerPermission]

    def delete(self, request, sitting_id):
        sitting = get_object_or_404(Sitting, id=sitting_id)
        user = request.user
        
        if not user.is_superuser and not CourseAllocation.objects.filter(lecturer=user, courses=sitting.quiz.course).exists():
            return Response({'error': 'Not authorized for this course.'}, status=status.HTTP_403_FORBIDDEN)
            
        sitting.delete()
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)
