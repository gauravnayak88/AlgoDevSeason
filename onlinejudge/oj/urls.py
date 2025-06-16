from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("problist/", views.problist, name="problist"),
    path("probdisp/<int:pk>", views.probdisp, name="probdisp")
]
