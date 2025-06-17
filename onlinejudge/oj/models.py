from django.db import models
from django.contrib.auth.models import User
from django import forms

DIFFICULTY=[("Hard","Hard"), ("Easy","Easy"), ("Medium", "Medium")]

# Create your models here.
class Problem(models.Model):
    written_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="problems"
    )
    statement=models.TextField(blank=True)
    name=models.CharField()
    difficulty=models.CharField(choices=DIFFICULTY)

    def __str__(self):
        return self.name

class Solution(models.Model):
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE)
    code=models.TextField(blank=True)
    verdict=models.CharField()
    submitted_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id} {self.submitted_at}"

class TestCase(models.Model):
    input=models.TextField()
    output=models.CharField()
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE)

    def __str__(self):
        return self.input
    
    
class ProblemForm(forms.ModelForm):
    class Meta:
        model=Problem
        exclude=["written_by"]

class TestCaseForm(forms.ModelForm):
    class Meta:
        model=TestCase
        exclude=["problem"]