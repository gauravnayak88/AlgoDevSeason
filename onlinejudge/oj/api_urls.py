from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProblemViewSet

router = DefaultRouter()
router.register('problems', ProblemViewSet, basename='problem')

urlpatterns = [
    path('', include(router.urls)),
]