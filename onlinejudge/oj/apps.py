from django.apps import AppConfig


class OjConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'oj'

def ready(self):
    import oj.signals