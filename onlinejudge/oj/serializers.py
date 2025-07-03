# serializers.py
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import Profile, Problem, Topic, TestCase, Solution, Discussion, Comment
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q


class CustomUserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=[("student", "Student"), ("staff", "Staff")], write_only=True)
    email= serializers.EmailField(required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email is already registered.")])

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
    

class EmailOrUsernameLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        user = User.objects.filter(Q(username=username_or_email) | Q(email=username_or_email)).first()

        if user is None:
            raise AuthenticationFailed("No user found with this username or email")

        authenticated_user = authenticate(username=user.username, password=password)

        if authenticated_user is None:
            raise AuthenticationFailed("Incorrect password")

        data = super().validate({"username": user.username, "password": password})
        return data
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Profile
        fields = ['username', 'email', 'role', 'join_date']

class SampleTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_file', 'output_file']

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model= Topic
        fields = ['id', 'name']

class ProblemSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField()
    sample_test_cases = serializers.SerializerMethodField()
    topics = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Problem
        fields = ['id', 'name', 'statement', 'difficulty','constraints', 'time_limit', 'memory_limit', 'written_by', 'sample_test_cases', 'topics']
        read_only_fields = ['written_by']

    def get_written_by(self, obj):
        return obj.written_by.username
    
    def get_sample_test_cases(self, obj):
        request = self.context.get('request')  # <== Required to get full domain
        return [
            {
                'id': tc.id,
                'input_file': request.build_absolute_uri(tc.input_file.url),
                'output_file': request.build_absolute_uri(tc.output_file.url)
            }
            for tc in obj.testcases.filter(is_sample=True)
        ]
    


class TestCaseSerializer(serializers.ModelSerializer):
    problem = serializers.CharField(source='problem.name', read_only=True)
    class Meta:
        model= TestCase
        fields = ['id', 'input_file', 'output_file', 'problem', 'written_by', 'contributed_on', 'is_sample']
        read_only_fields = ['written_by', 'contributed_by']

class SolutionSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField()

    class Meta:
        model = Solution
        fields = '__all__'
        read_only_fields = ['written_by', 'verdict', 'submitted_at', 'output_data', 'passed_count', 'total_count']

    def get_written_by(self, obj):
        return obj.written_by.username
    
    def get_passed_count(self, obj):
        return obj.results.filter(verdict='Passed').count()

    def get_total_count(self, obj):
        return obj.results.count()
    
class DiscussionSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField() #?

    class Meta:
        model= Discussion
        fields = ['id', 'title', 'content', 'posted_on', 'written_by']
        read_only_fields = ['written_by']


    def get_written_by(self, obj):
        return obj.written_by.username if obj.written_by else None
    
class CommentSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'discussion', 'content', 'written_by', 'posted_on']
        read_only_fields = ['written_by', 'posted_on']

    def get_written_by(self, obj):
        return obj.written_by.username if obj.written_by else None