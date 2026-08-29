from rest_framework import generics
from rest_framework.permissions import AllowAny
from course.models import Program, Course
from .serializers import ProgramSerializer, CourseSerializer

from rest_framework.permissions import IsAuthenticated, AllowAny

class ProgramListAPIView(generics.ListCreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny] # Allow unauthenticated fetch for Phase 1 demo

class ProgramDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]
from rest_framework.permissions import IsAuthenticated

class CourseListAPIView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class CourseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
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
                    "title": str(course.title or ''),
                    "code": str(course.code or ''),
                    "slug": str(course.slug or ''),
                    "credit": getattr(course, 'credit', 3),
                    "summary": str(course.summary or ''),
                })
        
        # Remove duplicates if any
        unique_courses = { c['id']: c for c in courses_data }.values()
        
        return Response(list(unique_courses))

class AdminCourseAllocationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=403)
            
        allocations = CourseAllocation.objects.all().select_related('lecturer')
        data = []
        for alloc in allocations:
            courses = alloc.courses.all()
            data.append({
                'id': alloc.id,
                'lecturer_id': alloc.lecturer.id,
                'lecturer_name': alloc.lecturer.username,
                'courses': [{'id': c.id, 'title': c.title, 'code': c.code} for c in courses]
            })
        return Response(data)

    def post(self, request):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=403)
            
        lecturer_id = request.data.get('lecturer_id')
        course_ids = request.data.get('course_ids', [])
        
        if not lecturer_id or not course_ids:
            return Response({'error': 'Lecturer and courses are required.'}, status=400)
            
        # Optional: check if lecturer already has an allocation
        alloc, created = CourseAllocation.objects.get_or_create(lecturer_id=lecturer_id)
        alloc.courses.add(*course_ids)
        alloc.save()
        
        return Response({'success': True}, status=201)

class AdminCourseAllocationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=403)
            
        try:
            alloc = CourseAllocation.objects.get(pk=pk)
            alloc.delete()
            return Response({'success': True}, status=204)
        except CourseAllocation.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

from rest_framework.parsers import MultiPartParser, FormParser
from course.models import Upload, UploadVideo
from django.shortcuts import get_object_or_404

class LecturerUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        
        # Check if user is allocated
        is_allocated = CourseAllocation.objects.filter(lecturer=request.user, courses=course).exists()
        if not is_allocated and not request.user.is_superuser:
            return Response({'error': 'Not authorized for this course'}, status=403)
            
        file_obj = request.FILES.get('file')
        title = request.data.get('title', file_obj.name if file_obj else 'Untitled')
        
        if not file_obj:
            return Response({'error': 'File is required'}, status=400)
            
        upload = Upload.objects.create(
            title=title,
            course=course,
            file=file_obj
        )
        return Response({'success': True, 'id': upload.id, 'title': upload.title}, status=201)

class LecturerUploadVideoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        
        is_allocated = CourseAllocation.objects.filter(lecturer=request.user, courses=course).exists()
        if not is_allocated and not request.user.is_superuser:
            return Response({'error': 'Not authorized for this course'}, status=403)
            
        video_obj = request.FILES.get('video')
        title = request.data.get('title', video_obj.name if video_obj else 'Untitled')
        summary = request.data.get('summary', '')
        
        if not video_obj:
            return Response({'error': 'Video file is required'}, status=400)
            
        upload = UploadVideo.objects.create(
            title=title,
            course=course,
            video=video_obj,
            summary=summary
        )
        return Response({'success': True, 'id': upload.id, 'title': upload.title}, status=201)

class LecturerDeleteUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug, upload_id):
        course = get_object_or_404(Course, slug=slug)
        
        is_allocated = CourseAllocation.objects.filter(lecturer=request.user, courses=course).exists()
        if not is_allocated and not request.user.is_superuser:
            return Response({'error': 'Not authorized for this course'}, status=403)
            
        upload = get_object_or_404(Upload, id=upload_id, course=course)
        upload.file.delete()
        upload.delete()
        return Response(status=204)

class LecturerDeleteVideoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug, video_id):
        course = get_object_or_404(Course, slug=slug)
        
        is_allocated = CourseAllocation.objects.filter(lecturer=request.user, courses=course).exists()
        if not is_allocated and not request.user.is_superuser:
            return Response({'error': 'Not authorized for this course'}, status=403)
            
        video = get_object_or_404(UploadVideo, id=video_id, course=course)
        video.video.delete()
        video.delete()
        return Response(status=204)

class CatalogListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CourseSerializer

    def get_queryset(self):
        # Only return published courses, and order by promoted courses first
        return Course.objects.filter(is_published=True).order_by('-is_promoted', 'title')
