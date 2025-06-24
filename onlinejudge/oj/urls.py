from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # DRF-React URL'S
    path('api/problems/', views.problem_list_api, name='problem-list-api'),
    path('api/problems/<int:pk>', views.problem_detail_api, name='api-problem-detail'),
    path('api/problems/<int:pk>/solutions', views.solution_list_api, name='solution-list-api'),
    path('api/solutions/<int:pk>', views.solution_detail_api, name='api-solution-detail'),
    path("api/profile/", views.user_profile, name="user-profile"),

    # HTML URL's
    path("", views.dashboard, name="dashboard"),
    path("problist/", views.problist, name="problist"),
    path("profile/", views.profile, name="profile"),
    path("probdisp/<int:pk>", views.probdisp, name="probdisp"),
    path("register/", views.register_user, name="register-user"),
    path("login/", views.login_user, name="login-user"),
    path("logout/", views.logout_user, name="logout-user"),
    path("addprob/", views.add_problem, name="add-problem"),
    path("update/<int:pk>", views.update_problem, name="update-problem"),
    path("delete/<int:pk>", views.delete_problem, name="delete-problem"),
    path("addtestcase/<int:pk>", views.add_testcase, name="add-testcase"),
    path("updatetestcase/<int:pid>/<int:cid>", views.update_testcase, name="update-testcase"),
    path("deletetestcase/<int:pid>/<int:cid>", views.delete_testcase, name="delete-testcase"),
    path("testcaselist/<int:pk>", views.testcase_list, name="testcase-list"),
    path("addsolution/<int:pid>", views.add_solution, name="add-solution"),
    path("solutionlist/<int:pid>", views.solution_list, name="solution-list"),
    path("mysolutionslist/<int:pid>", views.mysolutions_list, name="mysolutions-list"),
    path("solutiondisp/<int:sid>", views.solution_disp, name="solution-disp"),
]