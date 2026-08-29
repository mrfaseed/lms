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
    user_sitting = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'slug', 'description', 'category', 'pass_mark', 'random_order', 'answers_at_end', 'exam_paper', 'single_attempt', 'user_sitting']

    def get_user_sitting(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        sitting = Sitting.objects.filter(quiz=obj, user=request.user).order_by('-start').first()
        if not sitting:
            return None
            
        return {
            'terminated': sitting.terminated,
            'violation_reason': sitting.violation_reason,
            'complete': sitting.complete
        }

class SittingSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    
    class Meta:
        model = Sitting
        fields = ['id', 'quiz', 'current_score', 'complete', 'terminated', 'violation_reason', 'start', 'end', 'get_percent_correct', 'check_if_passed']
