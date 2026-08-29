import sys
import os
sys.path.append('C:\\simatrix\\django-lms')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
for u in User.objects.all():
    print(f"User: {u.username}, Active: {u.is_active}")
