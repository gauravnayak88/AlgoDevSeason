from django.db import models
from django.contrib.auth.models import User
from django import forms

DIFFICULTY=[("hard","Hard"), ("easy","Easy"), ("medium", "Medium")]
ROLES=[('student', 'Student'),('staff', 'Staff')]
LANGUAGES=[('C++', 'C++'), ('Java', 'Java'), ('Python', 'Python')]

# Create your models here.
class Profile(models.Model):
    role=models.CharField(choices=ROLES, default='student')
    user=models.OneToOneField(User, on_delete=models.CASCADE)
    join_date=models.DateField(auto_now_add=True)

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
    date_added=models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class Solution(models.Model):
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE)
    language=models.CharField(choices=LANGUAGES)
    code=models.TextField(blank=True)
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    verdict=models.CharField()
    submitted_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id} {self.submitted_at}"

class TestCase(models.Model):
    input=models.TextField()
    output=models.TextField()
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE, related_name="testcases")
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    contributed_on=models.DateField(auto_now_add=True)
    is_sample=models.BooleanField(default=False)

    def __str__(self):
        return self.input
    
class RegisterForm(forms.Form):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    role = forms.ChoiceField(choices=ROLES)
    
    
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