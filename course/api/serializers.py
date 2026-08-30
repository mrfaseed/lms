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
    student_enrollment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'

    def get_student_enrollment_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'student'):
            from result.models import TakenCourse
            tc = TakenCourse.objects.filter(student=request.user.student, course=obj).first()
            if tc:
                return tc.status
        return None
