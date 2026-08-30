from django.db import models
from django.urls import reverse

from accounts.models import Student
from core.models import Semester
from course.models import Course

YEARS = (
    (1, "1"),
    (2, "2"),
    (3, "3"),
    (4, "4"),
    (4, "5"),
    (4, "6"),
)

# LEVEL_COURSE = "Level course"
BACHLOAR_DEGREE = "Bachloar"
MASTER_DEGREE = "Master"

LEVEL = (
    # (LEVEL_COURSE, "Level course"),
    (BACHLOAR_DEGREE, "Bachloar Degree"),
    (MASTER_DEGREE, "Master Degree"),
)

FIRST = "First"
SECOND = "Second"
THIRD = "Third"

SEMESTER = (
    (FIRST, "First"),
    (SECOND, "Second"),
    (THIRD, "Third"),
)

A_PLUS = "A+"
A = "A"
A_MINUS = "A-"
B_PLUS = "B+"
B = "B"
B_MINUS = "B-"
C_PLUS = "C+"
C = "C"
C_MINUS = "C-"
D = "D"
F = "F"
NG = "NG"

GRADE = (
    (A_PLUS, "A+"),
    (A, "A"),
    (A_MINUS, "A-"),
    (B_PLUS, "B+"),
    (B, "B"),
    (B_MINUS, "B-"),
    (C_PLUS, "C+"),
    (C, "C"),
    (C_MINUS, "C-"),
    (D, "D"),
    (F, "F"),
    (NG, "NG"),
)

PASS = "PASS"
FAIL = "FAIL"

COMMENT = (
    (PASS, "PASS"),
    (FAIL, "FAIL"),
)


class TakenCourseManager(models.Manager):
    def new(self, user=None):
        user_obj = None
        if user is not None:
            if user.is_authenticated():
                user_obj = user
        return self.model.objects.create(user=user_obj)


class TakenCourse(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="taken_courses"
    )
    assignment = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    mid_exam = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    quiz = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    attendance = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    final_exam = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    grade = models.CharField(choices=GRADE, max_length=2, blank=True)
    point = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    ENROLLMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='APPROVED')
    comment = models.CharField(choices=COMMENT, max_length=200, blank=True)

    def get_absolute_url(self):
        return reverse("course_detail", kwargs={"slug": self.course.slug})

    def __str__(self):
        return "{0} ({1})".format(self.course.title, self.course.code)

    # @staticmethod
    def get_total(self, assignment, mid_exam, quiz, attendance, final_exam):
        return (
            float(assignment)
            + float(mid_exam)
            + float(quiz)
            + float(attendance)
            + float(final_exam)
        )

    # @staticmethod
    def get_grade(self, total):
        # total = float(assignment) + float(mid_exam) + float(quiz) + float(attendance) + float(final_exam)
        # total = self.get_total(assignment=assignment, mid_exam=mid_exam, quiz=quiz, attendance=attendance, final_exam=final_exam)
        # total = total
        if total >= 90:
            grade = A_PLUS
        elif total >= 85:
            grade = A
        elif total >= 80:
            grade = A_MINUS
        elif total >= 75:
            grade = B_PLUS
        elif total >= 70:
            grade = B
        elif total >= 65:
            grade = B_MINUS
        elif total >= 60:
            grade = C_PLUS
        elif total >= 55:
            grade = C
        elif total >= 50:
            grade = C_MINUS
        elif total >= 45:
            grade = D
        elif total < 45:
            grade = F
        else:
            grade = NG
        return grade

    # @staticmethod
    def get_comment(self, grade):
        if grade == F or grade == NG:
            comment = FAIL
        # elif grade == NG:
        #     comment = FAIL
        else:
            comment = PASS
        return comment

    def get_point(self, grade):
        # Without credits, we simply return a flat point value for the grade.
        if self.grade == A_PLUS or self.grade == A:
            return 4.0
        elif self.grade == A_MINUS:
            return 3.75
        elif self.grade == B_PLUS:
            return 3.5
        elif self.grade == B:
            return 3.0
        elif self.grade == B_MINUS:
            return 2.75
        elif self.grade == C_PLUS:
            return 2.5
        elif self.grade == C:
            return 2.0
        elif self.grade == C_MINUS:
            return 1.75
        elif self.grade == D:
            return 1.0
        return 0.0


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    semester = models.CharField(max_length=100, choices=SEMESTER)
    session = models.CharField(max_length=100, blank=True, null=True)
    level = models.CharField(max_length=25, choices=LEVEL, null=True)
