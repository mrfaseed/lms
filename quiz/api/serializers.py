from rest_framework import serializers
from quiz.models import Quiz, Question, MCQuestion, Choice, Sitting, Progress

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice', 'correct']

class MCQuestionSerializer(serializers.ModelSerializer):
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = MCQuestion
        fields = ['id', 'content', 'figure', 'explanation', 'choices']
        
    def get_choices(self, obj):
        choices = obj.get_choices()
        # When sending questions, we typically don't want to expose which one is correct!
        # But for simplicity, we'll send it all, or maybe hide it? 
        # Actually, let's hide the 'correct' flag in the question serializer.
        return [{'id': c.id, 'choice': c.choice} for c in choices]

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'slug', 'description', 'category', 'pass_mark', 'random_order', 'answers_at_end', 'exam_paper', 'single_attempt']

class SittingSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    
    class Meta:
        model = Sitting
        fields = ['id', 'quiz', 'current_score', 'complete', 'start', 'end', 'get_percent_correct', 'check_if_passed']
