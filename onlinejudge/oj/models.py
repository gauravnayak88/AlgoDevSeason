from django.db import models
from django.contrib.auth.models import User
from django import forms
import markdown
from django.utils.safestring import mark_safe

DIFFICULTY=[("hard","Hard"), ("easy","Easy"), ("medium", "Medium")]
ROLES=[('student', 'Student'),('staff', 'Staff')]
LANGUAGES=[('cpp', 'C++'), ('java', 'Java'), ('python', 'Python'), ('c', 'C')]

# Create your models here.
class Profile(models.Model):
    role=models.CharField(choices=ROLES, default='student', max_length=10)
    user=models.OneToOneField(User, on_delete=models.CASCADE)
    join_date=models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} {self.role}"
    
class Topic(models.Model):
    name=models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name}"

class Problem(models.Model):
    written_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="problems",
    )
    statement=models.TextField(blank=True)
    name=models.CharField(max_length=50)
    difficulty=models.CharField(choices=DIFFICULTY, max_length=10)
    date_added=models.DateField(auto_now_add=True)
    topic=models.ManyToManyField(Topic)

    def __str__(self):
        return self.name

    def formatted_statement(self):
        return mark_safe(markdown.markdown(self.statement))

class Solution(models.Model):
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE)
    language=models.CharField(choices=LANGUAGES, max_length=20)
    code=models.TextField(blank=True)
    input_data=models.TextField(blank=True, default='')
    output_data=models.TextField(blank=True, default='')
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    verdict=models.CharField(max_length=20)
    submitted_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.problem}-{self.verdict}-{self.written_by}-{self.submitted_at}"

class TestCase(models.Model):
    input=models.TextField()
    output=models.TextField()
    problem=models.ForeignKey("Problem", on_delete=models.CASCADE, related_name="testcases")
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    contributed_on=models.DateField(auto_now_add=True)
    is_sample=models.BooleanField(default=False)

    def __str__(self):
        return f"{self.input} for {self.problem.id}"
    
class Discussion(models.Model):
    title=models.TextField()
    content=models.TextField()
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    posted_on=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.written_by}-{self.title}"

class Comment(models.Model):
    discussion=models.ForeignKey(Discussion, on_delete=models.CASCADE)
    content=models.TextField()
    written_by=models.ForeignKey(User, on_delete=models.CASCADE)
    posted_on=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.written_by}-{self.discussion}"
    
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