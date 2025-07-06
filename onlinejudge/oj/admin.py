from django.contrib import admin
from .models import Profile, Problem, Solution, TestCase, Discussion, Comment, Topic, Contest
from django.contrib.auth.models import User

# Register your models here.
class ProfileAdmin(admin.ModelAdmin): # allow admin to assign staff/student role
    list_display = ('user', 'role')
    
class ProblemAdmin(admin.ModelAdmin):
    filter_horizontal = ('topics',)  # Optional, makes topic selection easier
    list_display = ('name', 'difficulty', 'written_by')
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "written_by":
            kwargs["queryset"] = User.objects.filter(profile__role="staff")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Problem, ProblemAdmin)
admin.site.register(Topic)
admin.site.register(Solution)
admin.site.register(TestCase)
admin.site.register(Discussion)
admin.site.register(Comment)
admin.site.register(Contest)