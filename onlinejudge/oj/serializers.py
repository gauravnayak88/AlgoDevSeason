# serializers.py
from rest_framework import serializers
from .models import Profile, Problem, Solution
from django.contrib.auth.models import User

class CustomUserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=[("student", "Student"), ("staff", "Staff")], write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, role=role)
        return user
    
    def to_representation(self, instance):
        # Avoid trying to return `role`, which is not part of User
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
        }
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Profile
        fields = ['username', 'email', 'role', 'join_date']

class ProblemSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Problem
        fields = ['id', 'name', 'statement', 'difficulty', 'written_by']
        read_only_fields = ['written_by']

    def get_written_by(self, obj):
        return obj.written_by.username
    

class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = ['id', 'problem', 'language', 'code', 'written_by', 'verdict', 'submitted_at']
        read_only_fields = ['written_by', 'verdict', 'submitted_at']