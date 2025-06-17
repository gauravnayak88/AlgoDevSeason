from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("problist/", views.problist, name="problist"),
    path("probdisp/<int:pk>", views.probdisp, name="probdisp"),
    path("register/", views.register_user, name="register-user"),
    path("login/", views.login_user, name="login-user"),
    path("logout/", views.logout_user, name="logout-user"),
    path("addprob/", views.add_problem, name="add-problem"),
    path("update/<int:pk>", views.update_problem, name="update-problem"),
    path("delete/<int:pk>", views.delete_problem, name="delete-problem"),
]
