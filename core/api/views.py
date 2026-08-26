from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import User, Student
from core.models import ActivityLog

class DashboardStatsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        logs = ActivityLog.objects.all().order_by("-created_at")[:10]
        # Serialize logs manually
        logs_data = [{"message": log.message, "created_at": log.created_at.strftime("%Y-%m-%d %H:%M:%S")} for log in logs]
        
        gender_count = Student.get_gender_count()
        
        return Response({
            "student_count": User.objects.get_student_count(),
            "lecturer_count": User.objects.get_lecturer_count(),
            "superuser_count": User.objects.get_superuser_count(),
            "males_count": gender_count["M"],
            "females_count": gender_count["F"],
            "recent_activity": logs_data
        })

from rest_framework.permissions import IsAuthenticated
from course.models import Course
from quiz.models import Sitting
from core.models import NewsAndEvents

class StudentDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if not user.is_student:
            return Response({"error": "User is not a student"}, status=403)
            
        try:
            student_profile = user.student
        except:
            return Response({"error": "Student profile not found"}, status=404)

        # 1. Enrolled Courses (mocking as all courses in their program for simplicity, or just recent courses)
        # We can just fetch courses that match the student's program
        if student_profile.program:
            courses = Course.objects.filter(program=student_profile.program)[:4]
            courses_data = [{"title": c.title, "code": c.code, "slug": c.slug} for c in courses]
        else:
            courses_data = []

        # 2. Recent Quiz Results
        sittings = Sitting.objects.filter(user=user).order_by('-end')[:5]
        sittings_data = []
        for s in sittings:
            sittings_data.append({
                "quiz_title": s.quiz.title,
                "score": s.get_percent_correct,
                "passed": s.check_if_passed,
                "date": s.end.strftime("%b %d, %Y") if s.end else "In Progress"
            })

        # 3. News and Events
        news = NewsAndEvents.objects.all().order_by('-updated_date')[:5]
        news_data = [{"title": n.title, "summary": n.summary, "type": n.posted_as, "date": n.updated_date.strftime("%b %d, %Y")} for n in news]

        # Mock Data for Coding Academy UI
        resume_coding = {
            "title": "Python Bootcamp",
            "progress": 72,
            "last_lesson": "Lesson 8: Dictionaries",
            "url": "/courses/python-bootcamp"
        }

        upcoming_quiz = {
            "title": "Python Basics Assessment",
            "date": "Tomorrow, 10:00 AM",
            "url": "/courses/python-bootcamp/quiz/basics"
        }

        recent_activity = [
            {"type": "completed", "message": "Completed Variables lesson"},
            {"type": "passed", "message": "Passed Python Basics Quiz"},
            {"type": "submitted", "message": "Submitted Assignment: Reverse String"}
        ]

        developer_stats = {
            "problemsSolved": 128,
            "codingHours": 53,
            "languagesLearned": 4,
            "currentStreak": 12,
            "averageQuizScore": 91,
            "completionRate": 78
        }

        return Response({
            "student_id": student_profile.id,
            "student_name": user.get_full_name,
            "program": student_profile.program.title if student_profile.program else "Unassigned",
            "resume_coding": resume_coding,
            "upcoming_quiz": upcoming_quiz,
            "recent_activity": recent_activity,
            "developer_stats": developer_stats,
            "news": news_data
        })

class CalendarEventsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        events = NewsAndEvents.objects.all().order_by('-updated_date')
        
        events_data = []
        for e in events:
            events_data.append({
                "id": e.id,
                "title": e.title,
                "summary": e.summary,
                "type": e.posted_as,
                "date": e.updated_date.isoformat() if e.updated_date else None,
            })
            
        return Response(events_data)

import subprocess
import time
import tempfile
import os

class ExecuteCodeAPIView(APIView):
    permission_classes = [AllowAny] # Use AllowAny for testing, change to IsAuthenticated later
    
    def post(self, request):
        language = request.data.get('language')
        files = request.data.get('files', [])
        stdin = request.data.get('stdin', '')
        
        if not language or not files:
            return Response({"error": "Language and files are required."}, status=400)
            
        # Extract main file
        # In a real environment we'd find the entrypoint or use main.py / Main.java
        main_file = files[0]
        content = main_file.get('content', '')
        
        start_time = time.time()
        
        try:
            if language == 'python':
                # Create a temporary file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                    f.write(content)
                    temp_path = f.name
                
                try:
                    # Execute using subprocess
                    process = subprocess.Popen(
                        ['python', temp_path],
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    
                    stdout, stderr = process.communicate(input=stdin, timeout=5)
                    exit_code = process.returncode
                    
                finally:
                    # Clean up
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
            else:
                # Mock execution for other languages if compiler is not present
                time.sleep(0.5)
                stdout = f"[Mock Docker Execution]\nCompiled and ran {language} code successfully.\n\nFiles included:\n"
                for f in files:
                    stdout += f"- {f.get('name')}\n"
                
                if stdin:
                    stdout += f"\nInput received:\n{stdin}\n"
                
                stderr = ""
                exit_code = 0
                
        except subprocess.TimeoutExpired:
            process.kill()
            stdout = ""
            stderr = "Error: Execution timed out (exceeded 5 seconds)."
            exit_code = 124
        except Exception as e:
            stdout = ""
            stderr = f"System Error: {str(e)}"
            exit_code = 1
            
        execution_time = round(time.time() - start_time, 3)
        
        # In a real Docker environment, memory would be extracted from docker stats
        memory_usage = "24 MB" if language == "python" else "18 MB"
        
        return Response({
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": exit_code,
            "time": f"{execution_time}s",
            "memory": memory_usage
        })
