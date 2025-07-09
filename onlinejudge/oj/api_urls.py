from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProblemViewSet, SolutionViewSet, ContestViewSet, DiscussionViewSet, CommentViewSet, TestCaseViewSet, problem_list_api

router = DefaultRouter()
router.register('problems', ProblemViewSet, basename='problem')
router.register('solutions', SolutionViewSet, basename='solution')
router.register('testcases', TestCaseViewSet, basename='testcase')
router.register('discussions', DiscussionViewSet, basename='discussion')
router.register('comments', CommentViewSet, basename='comment')
router.register('contests', ContestViewSet, basename='contest')

urlpatterns = [
    path('', include(router.urls)),
]