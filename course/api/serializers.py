from rest_framework import serializers
from course.models import Program, Course, Upload, UploadVideo

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ['id', 'title', 'file', 'updated_date', 'upload_time']

class UploadVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadVideo
        fields = ['id', 'title', 'slug', 'video', 'summary', 'timestamp']

from quiz.api.serializers import QuizSerializer

class CourseSerializer(serializers.ModelSerializer):
    uploads = UploadSerializer(source='upload_set', many=True, read_only=True)
    videos = UploadVideoSerializer(source='uploadvideo_set', many=True, read_only=True)
    quizzes = QuizSerializer(source='quiz_set', many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
