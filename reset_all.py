import sys
import os
sys.path.append('C:\\simatrix\\django-lms')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.all()
for u in users:
    u.set_password('password')
    u.save()
print(f"Reset passwords for {users.count()} users to 'password'")
