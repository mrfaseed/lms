import sys
import os
sys.path.append('C:\\simatrix\\django-lms')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.get(username='admin')
admin.set_password('password')
admin.save()
print("Admin password reset to 'password'")
