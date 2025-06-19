from django.db import models
from django.contrib.auth.models import User
from django import forms

DIFFICULTY=[("hard","Hard"), ("easy","Easy"), ("medium", "Medium")]

# Create your models here.
class Profile(models.Model):
    ROLES=[('student', 'Student'),('staff', 'Staff')]
    role=models.CharField(choices=ROLES, default='student')
    user=models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} {self.role}"

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
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    verdict=models.CharField()
    submitted_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id} {self.submitted_at}"

class TestCase(models.Model):
    input=models.TextField()
    output=models.TextField()
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE)
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.input
    
    
class ProblemForm(forms.ModelForm):
    class Meta:
        model=Problem
        exclude=["written_by"]

class TestCaseForm(forms.ModelForm):
    class Meta:
        model=TestCase
        exclude=["problem", "written_by"]

class SolutionForm(forms.ModelForm):
    class Meta:
        model=Solution
        exclude=["problem", "verdict", "written_by"]