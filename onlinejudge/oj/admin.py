from django.contrib import admin
from .models import Profile, Problem, Solution, TestCase

# Register your models here.
class ProfileAdmin(admin.ModelAdmin): # allow admin to assign staff/student role
    list_display = ('user', 'role')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Problem)
admin.site.register(Solution)
admin.site.register(TestCase)