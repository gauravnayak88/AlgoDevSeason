from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProblemViewSet, SolutionViewSet, DiscussionViewSet

router = DefaultRouter()
router.register('problems', ProblemViewSet, basename='problem')
router.register('solutions', SolutionViewSet, basename='solution')
router.register('discussions', DiscussionViewSet, basename='discussion')

urlpatterns = [
    path('', include(router.urls)),
]