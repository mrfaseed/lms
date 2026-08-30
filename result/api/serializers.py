from rest_framework import serializers
from result.models import TakenCourse

class TakenCourseSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)

    class Meta:
        model = TakenCourse
        fields = ['id', 'student', 'student_name', 'course', 'course_title', 'course_code', 'grade', 'total', 'status']
