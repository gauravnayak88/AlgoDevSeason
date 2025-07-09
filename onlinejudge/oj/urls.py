from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # DRF-React URL'S
    path('api/problems/practice', views.problem_list_api, name='problem-list-api'),
    path('api/problems/<int:pk>', views.problem_detail_api, name='api-problem-detail'),
    path('api/problems/<int:pk>/testcases', views.testcase_list_api, name='testcase-list-api'),
    path('api/problems/<int:pk>/solutions', views.solution_list_api, name='solution-list-api'),
    path('api/problems/solved', views.solved_problems_api, name='solved-problems-api'),
    path('api/topics/', views.topic_list_api, name='topic-list-api'),
    path('api/topics/<int:pk>/problems', views.topicwise_problem_list_api, name='topicwise-problem-list-api'),
    path('api/solutions/<int:pk>', views.solution_detail_api, name='api-solution-detail'),
    # path('api/aireview/', views.ai_review_api, name='api-ai-review'),
    path("api/ai-review/", views.ai_review_api),
    path("api/ai-hint/", views.ai_hint_api),
    path("api/ai-generate/", views.ai_generate_code_api),
    path('api/leaderboard/', views.leaderboard, name='api-leaderboard'),
    path("api/contests/<int:pk>/leaderboard/", views.ContestLeaderboardAPIView.as_view()),
    # path('api/discuss/', views.discussion_list_api, name='discussion-list-api'),
    path('api/discuss/<int:pk>', views.discussion_detail_api, name='api-discussion-detail'),
    path('api/discussions/<int:pk>/comments', views.discussion_comment_list_api, name='discussion-comment-list'),
    path("api/profile/", views.user_profile, name="user-profile"),
    path("api/run", views.run_code_api, name='run-code-api'),
    path("auth/jwt/create/", views.EmailOrUsernameLoginView.as_view(), name="custom_jwt_create"),
]