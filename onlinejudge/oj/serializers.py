# serializers.py
from rest_framework import serializers
from .models import Problem

class ProblemSerializer(serializers.ModelSerializer):
    written_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Problem
        fields = ['id', 'name', 'statement', 'difficulty', 'written_by']
        read_only_fields = ['written_by']

    def get_written_by(self, obj):
        return obj.written_by.username