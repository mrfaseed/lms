from rest_framework import generics
from rest_framework.permissions import AllowAny
from course.models import Program, Course
from .serializers import ProgramSerializer, CourseSerializer

class ProgramListAPIView(generics.ListAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny] # Allow unauthenticated fetch for Phase 1 demo

class CourseListAPIView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailAPIView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from course.models import CourseAllocation

class LecturerCoursesAPIView(APIView):
    permission_classes = [AllowAny] # Using AllowAny for demo, in prod use IsAuthenticated and request.user

    def get(self, request, lecturer_id):
        allocations = CourseAllocation.objects.filter(lecturer_id=lecturer_id)
        
        # Get unique courses from allocations
        courses_data = []
        for alloc in allocations:
            for course in alloc.courses.all():
                courses_data.append({
                    "id": course.id,
                    "title": course.title,
                    "code": course.code,
                    "slug": course.slug,
                    "level": course.level,
                })
        
        # Remove duplicates if any
        unique_courses = { c['id']: c for c in courses_data }.values()
        
        return Response(list(unique_courses))
