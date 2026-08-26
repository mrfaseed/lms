from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from result.models import TakenCourse, Result
from accounts.models import Student
from django.shortcuts import get_object_or_404

class StudentTranscriptAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        student = get_object_or_404(Student, id=student_id)
        
        # Get all completed courses (grades)
        taken_courses = TakenCourse.objects.filter(student=student)
        
        transcript_data = []
        for tc in taken_courses:
            transcript_data.append({
                "id": tc.id,
                "course_code": tc.course.code,
                "course_title": tc.course.title,
                "assignment": tc.assignment,
                "mid_exam": tc.mid_exam,
                "quiz": tc.quiz,
                "attendance": tc.attendance,
                "final_exam": tc.final_exam,
                "total": tc.total,
                "grade": tc.grade,
                "point": tc.point,
                "comment": tc.comment,
            })
            
        return Response({
            "student_name": student.student.get_full_name,
            "student_id": student.id,
            "program": student.program.title if student.program else "N/A",
            "transcript": transcript_data
        })

class StudentAnalyticsAPIView(APIView):
    permission_classes = [AllowAny] # Usually IsAuthenticated, but keeping it simple for the LMS Phase 14 demo

    def get(self, request, student_id):
        student = get_object_or_404(Student, id=student_id)
        
        # 1. Score History for the Chart
        score_history = [
            {"semester": "Cohort 1", "score": 85},
            {"semester": "Cohort 2", "score": 92},
            {"semester": "Cohort 3", "score": 88},
            {"semester": "Cohort 4", "score": 95}
        ]

        # 2. Developer Analytics (Mocked for Phase 1 UI)
        developer_stats = {
            "problemsSolved": 128,
            "codingHours": 53,
            "languagesLearned": 4,
            "currentStreak": 12,
            "averageQuizScore": 91,
            "completionRate": 78
        }

        return Response({
            "score_history": score_history,
            "developer_stats": developer_stats
        })

class LecturerGradesAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, lecturer_id):
        # 1. Fetch courses allocated to this lecturer
        from course.models import CourseAllocation
        allocations = CourseAllocation.objects.filter(lecturer_id=lecturer_id)
        course_ids = []
        for alloc in allocations:
            course_ids.extend([c.id for c in alloc.courses.all()])
            
        # 2. Fetch all TakenCourses for these courses
        taken_courses = TakenCourse.objects.filter(course_id__in=course_ids)
        
        grades_data = []
        for tc in taken_courses:
            grades_data.append({
                "id": tc.id,
                "student_id": tc.student.id,
                "student_name": tc.student.student.get_full_name,
                "course_code": tc.course.code,
                "course_title": tc.course.title,
                "assignment": float(tc.assignment) if tc.assignment else 0,
                "mid_exam": float(tc.mid_exam) if tc.mid_exam else 0,
                "quiz": float(tc.quiz) if tc.quiz else 0,
                "attendance": float(tc.attendance) if tc.attendance else 0,
                "final_exam": float(tc.final_exam) if tc.final_exam else 0,
                "total": float(tc.total) if tc.total else 0,
                "grade": tc.grade,
                "point": float(tc.point) if tc.point else 0,
                "comment": tc.comment,
            })
            
        return Response(grades_data)
        
    def patch(self, request, lecturer_id):
        # Update a student's grade
        taken_course_id = request.data.get('id')
        try:
            tc = TakenCourse.objects.get(id=taken_course_id)
            
            # Basic authorization check: verify this course is allocated to this lecturer
            from course.models import CourseAllocation
            allocations = CourseAllocation.objects.filter(lecturer_id=lecturer_id)
            course_ids = []
            for alloc in allocations:
                course_ids.extend([c.id for c in alloc.courses.all()])
                
            if tc.course.id not in course_ids:
                return Response({"error": "Unauthorized"}, status=403)
                
            # Update fields
            if 'assignment' in request.data: tc.assignment = request.data['assignment']
            if 'mid_exam' in request.data: tc.mid_exam = request.data['mid_exam']
            if 'quiz' in request.data: tc.quiz = request.data['quiz']
            if 'attendance' in request.data: tc.attendance = request.data['attendance']
            if 'final_exam' in request.data: tc.final_exam = request.data['final_exam']
            
            tc.save() # This triggers the post_save/pre_save to calculate total, grade, point
            
            return Response({"status": "success", "total": tc.total, "grade": tc.grade})
        except Exception as e:
            return Response({"error": str(e)}, status=400)
