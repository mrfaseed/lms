from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
import pandas as pd # For Excel upload

from course.models import Course
from quiz.models import Quiz, MCQuestion, Choice
from .serializers import QuizSerializer

class AdminQuizListCreateAPIView(generics.ListCreateAPIView):
    """
    List all quizzes or create a new one.
    Admin only.
    """
    permission_classes = [IsAdminUser]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all().order_by('-id')

    def perform_create(self, serializer):
        # The serializer should include 'course' ID in the request data, 
        # or we can default it. For now we assume course ID is passed in request.
        course_id = self.request.data.get('course_id')
        if course_id:
            course = get_object_or_404(Course, id=course_id)
            serializer.save(course=course)
        else:
            serializer.save()


class AdminQuizDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a quiz.
    """
    permission_classes = [IsAdminUser]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()
    lookup_field = 'slug'


class AdminQuestionListCreateAPIView(APIView):
    """
    List or Create questions for a specific quiz.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
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

    def delete(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        quiz.delete()
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

    def post(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        
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


class AdminBulkUploadExcelAPIView(APIView):
    """
    Upload an Excel file to bulk create MC questions.
    Format expected: 
    Columns: Question, Choice A, Choice B, Choice C, Choice D, Correct Answer (A/B/C/D), Explanation
    """
    permission_classes = [IsAdminUser]

    def post(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        file = request.FILES.get('file')

        if not file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read excel using pandas
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

                    q = MCQuestion.objects.create(
                        content=question_text,
                        explanation=explanation
                    )
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

from quiz.models import Sitting
from .serializers import SittingSerializer

class QuizSittingsAPIView(APIView):
    """
    List all sittings for a specific quiz.
    Admin only.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        sittings = Sitting.objects.filter(quiz=quiz).order_by('-start').select_related('user')
        
        # Serialize the sitting and include username manually
        data = []
        for s in sittings:
            d = SittingSerializer(s).data
            d['username'] = s.user.username
            data.append(d)
            
        return Response(data)

class SittingResetAPIView(APIView):
    """
    Delete a sitting, allowing the user to take the test again.
    """
    permission_classes = [IsAdminUser]

    def delete(self, request, sitting_id):
        sitting = get_object_or_404(Sitting, id=sitting_id)
        sitting.delete()
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

