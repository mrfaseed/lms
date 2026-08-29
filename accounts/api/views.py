from rest_framework import generics
from django.contrib.auth import get_user_model

from .serializers import UserSerializer


class UserListAPIView(generics.ListAPIView):
    lookup_field = "id"
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = get_user_model().objects.all()
        query = self.request.GET.get("q")
        if query is not None:
            queryset = queryset.filter(username__iexact=q)
        return queryset


class UserDetailView(generics.RetrieveAPIView):
    User = get_user_model()
    lookup_field = "id"
    queryset = User.objects.all()
    model = User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, ProfileUpdateSerializer

class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full user data after update
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

class AdminStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Only superusers may access these stats
        if not user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        User = get_user_model()
        from course.models import Course, Program

        total_students = User.objects.filter(is_student=True).count()
        total_courses = Course.objects.count()
        total_programs = Program.objects.count()

        data = {
            'total_students': total_students,
            'total_courses': total_courses,
            'total_active_programs': total_programs,
        }
        return Response(data)


class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        User = get_user_model()
        qs = User.objects.all().order_by('-date_joined')
        q = request.GET.get('q')
        role = request.GET.get('role')
        if q:
            qs = qs.filter(username__icontains=q)
        if role == 'lecturer':
            qs = qs.filter(is_lecturer=True)
        elif role == 'student':
            qs = qs.filter(is_student=True)

        # Pagination parameters
        page = request.GET.get('page', 1)
        page_size = int(request.GET.get('page_size', 10))

        paginator = Paginator(qs, page_size)
        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        serializer = UserSerializer(page_obj.object_list, many=True)
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'results': serializer.data,
        })

    def post(self, request):
        user = request.user
        if not user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
            
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        role = request.data.get('role', 'student')
        
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        if role == 'superuser':
            new_user.is_superuser = True
            new_user.is_staff = True
        elif role == 'lecturer':
            new_user.is_lecturer = True
        else:
            new_user.is_student = True
            
        new_user.save()
        return Response({'success': True, 'id': new_user.id}, status=status.HTTP_201_CREATED)


from rest_framework.generics import RetrieveUpdateDestroyAPIView

class AdminUserDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().get(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

# Trigger reload
