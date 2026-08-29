import sys
import os
sys.path.append('C:\\simatrix\\django-lms')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.contrib.auth import authenticate
user = authenticate(username='admin', password='password') # replace with a test password if known, but let's just see if it crashes
print(f"User: {user}")
