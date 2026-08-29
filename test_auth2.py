import sys
import os
sys.path.append('C:\\simatrix\\django-lms')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.contrib.auth import authenticate
try:
    user = authenticate(username='monika@gmail.com', password='password') 
    print(f"User: {user}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
