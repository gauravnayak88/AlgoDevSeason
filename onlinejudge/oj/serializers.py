# serializers.py
from rest_framework import serializers
from .models import Problem

class ProblemSerializer(serializers.ModelSerializer):
    written_by = serializers.CharField(source='written_by.username')
    
    class Meta:
        model = Problem
        fields = '__all__'
