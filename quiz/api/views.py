from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from course.models import Course
from quiz.models import Quiz, Sitting, MCQuestion, Choice
from .serializers import QuizSerializer, MCQuestionSerializer, SittingSerializer

class CourseQuizListAPIView(generics.ListAPIView):
    """
    List all quizzes for a specific course.
    """
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_slug = self.kwargs.get('course_slug')
        return Quiz.objects.filter(course__slug=course_slug, draft=False)

class QuizTakeAPIView(APIView):
    """
    Start or continue a quiz sitting. Returns the next question to answer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        course = quiz.course

        sitting = Sitting.objects.user_sitting(request.user, quiz, course)
        if sitting is False:
            return Response({'error': 'You have already taken this single-attempt quiz.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get first question from the sitting's question_list
        question = sitting.get_first_question()
        if question is False:
            # Quiz is complete
            sitting.mark_quiz_complete()
            return Response({
                'complete': True,
                'sitting': SittingSerializer(sitting).data
            })

        # Check what kind of question it is (we only support MCQuestion right now for simplicity)
        if hasattr(question, 'mcquestion'):
            question = question.mcquestion
            serializer = MCQuestionSerializer(question)
            return Response({
                'complete': False,
                'question': serializer.data,
                'progress': sitting.progress()
            })
            
        return Response({'error': 'Unsupported question type'}, status=status.HTTP_400_BAD_REQUEST)

class QuizSubmitAPIView(APIView):
    """
    Submit an answer for the current question in the sitting.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_slug):
        quiz = get_object_or_404(Quiz, slug=quiz_slug)
        sitting = Sitting.objects.user_sitting(request.user, quiz, quiz.course)
        
        if sitting is False or sitting.complete:
            return Response({'error': 'Sitting is already complete or invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        question = sitting.get_first_question()
        if not question:
            return Response({'error': 'No active question.'}, status=status.HTTP_400_BAD_REQUEST)

        guess_id = request.data.get('answer_id')
        if not guess_id:
            return Response({'error': 'Please provide answer_id.'}, status=status.HTTP_400_BAD_REQUEST)

        # Record answer
        sitting.add_user_answer(question, guess_id)
        
        # Check if correct (only supporting MCQuestion)
        if hasattr(question, 'mcquestion'):
            is_correct = question.mcquestion.check_if_correct(guess_id)
            if is_correct:
                sitting.add_to_score(1)
            else:
                sitting.add_incorrect_question(question)
        
        # Remove from list
        sitting.remove_first_question()
        
        return Response({'success': True, 'correct': is_correct if hasattr(question, 'mcquestion') else False})
