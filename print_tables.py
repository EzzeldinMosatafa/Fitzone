from django.apps import apps
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitzone.settings')
django.setup()

for model in apps.get_models():
    print(model, getattr(model._meta, 'db_table', None))