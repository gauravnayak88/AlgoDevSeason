from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Profile, Problem, Topic, ProblemForm, TestCase, TestCaseForm, Solution, Discussion, Comment, SolutionForm, RegisterForm
from django.db.models import Q, F, Count
from django.http import HttpResponseForbidden, JsonResponse
from django.core.files.storage import default_storage
from django.conf import settings
import uuid
import subprocess
from pathlib import Path
import os
import signal
from dotenv import load_dotenv
import httpx

load_dotenv()  # Load variables from .env file
api_key = os.environ.get("API_KEY")

#DRF
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ProfileSerializer, ProblemSerializer, TopicSerializer, TestCaseSerializer, SolutionSerializer, DiscussionSerializer, CommentSerializer, EmailOrUsernameLoginSerializer
from .permissions import IsStaffUser, IsOwnerOrReadOnly


# Create your views here.

# Class based views

class EmailOrUsernameLoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameLoginSerializer


class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create']:
            return [IsStaffUser()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsStaffUser()]
        return [permissions.AllowAny()]  # Read-only access to everyone

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        problem = serializer.save(written_by=request.user)

        # Handle file pairs as input/output test cases
        input_files = request.FILES.getlist('input_files')
        output_files = request.FILES.getlist('output_files')

        if len(input_files) != len(output_files):
            return Response({"detail": "Mismatch between number of input and output files."}, status=400)

        for input_file, output_file in zip(input_files, output_files):
            TestCase.objects.create(problem=problem, input_file=input_file, output_file=output_file, written_by=request.user)

        return Response(self.get_serializer(problem).data, status=status.HTTP_201_CREATED)

def get_ai_feedback(code, language):
    prompt = f"Review this {language} code:\n\n{code}\n\nBriefly comment on its quality, improvements, and logic."

    # print(f"Code: {code}, Language: {language}")
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
        }

        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json={
                "model": "mistralai/mistral-7b-instruct",  # or any other free model
                "messages": [
                    {"role": "system", "content": "You are a helpful code reviewer."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI feedback unavailable. Error: {str(e)}"

class SolutionViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = SolutionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        language = request.data.get("language")
        code = request.data.get("code")
        problem_id = request.data.get("problem")

        if not all([language, code, problem_id]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)

        testcases = TestCase.objects.filter(problem=problem)
        results = []
        passed_count = 0
        tle_count = 0
        compilation_error_count = 0
        runtime_error_count = 0

        for tc in testcases:
            try:
                with default_storage.open(tc.input_file.name, 'r') as f:
                    input_text = f.read()

                with default_storage.open(tc.output_file.name, 'r') as f:
                    expected_output = f.read()
            except Exception as e:
                return Response({"error": f"Error reading test case files: {str(e)}"}, status=500)
            output = run_code(language, code, input_text, problem.time_limit)
            actual = output.strip()
            expected = expected_output.strip()

            if actual == expected:
                verdict = "Passed"
                passed_count += 1
            elif "Compilation Error" in output:
                verdict = "Compilation Error"
                compilation_error_count += 1
                break
            elif "Runtime Error" in output:
                verdict = "Runtime Error"
                runtime_error_count += 1
            elif output == "Time Limit Exceeded":
                verdict = "Time Limit Exceeded"
                tle_count += 1
            else:
                verdict = "Failed"

            results.append({
                "input": input_text,
                "expected": expected,
                "actual": actual,
                "verdict": verdict
            })

        if passed_count == len(testcases):
            final_verdict = "Accepted"
        elif compilation_error_count>0:
            final_verdict = "Compilation Error"
        elif runtime_error_count>0:
            final_verdict = "Runtime Error"
        elif tle_count>0:
            final_verdict = "Time Limit Exceeded"
        else:
            final_verdict = "Wrong Answer"

        # ai_feedback = get_ai_feedback(request.data["code"], request.data["language"])

        solution = Solution.objects.create(
            written_by=request.user,
            problem=problem,
            code=code,
            language=language,
            verdict=final_verdict,
            passed_count=passed_count,
            total_count=len(testcases)
        )

        serializer = self.get_serializer(solution)
        return Response({
            "solution": serializer.data,
            "verdict": final_verdict,
            "results": results,
        }, status=status.HTTP_201_CREATED)


def run_code(language, code, input_data, time_limit, memory_limit=128*1024*1024):
    print(time_limit)
    time_limit = float(time_limit)
    memory_limit = int(memory_limit)
    project_path = Path(settings.BASE_DIR)
    directories = ["codes", "inputs", "outputs"]

    for directory in directories:
        dir_path = project_path / directory
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)

    codes_dir = project_path / "codes"
    inputs_dir = project_path / "inputs"
    outputs_dir = project_path / "outputs"

    unique = str(uuid.uuid4())

    code_file_name = f"{unique}.{language}"
    input_file_name = f"{unique}.txt"
    output_file_name = f"{unique}.txt"

    code_file_path = codes_dir / code_file_name
    input_file_path = inputs_dir / input_file_name
    output_file_path = outputs_dir / output_file_name

    with open(code_file_path, "w") as code_file:
        code_file.write(code)

    with open(input_file_path, "w") as input_file:
        input_file.write(input_data)

    with open(output_file_path, "w") as output_file:
        # output_file.write("10")
        pass  # This will create an empty file

    def set_limits():
        import resource
        resource.setrlimit(resource.RLIMIT_AS, (memory_limit, resource.RLIM_INFINITY))  # Memory
        resource.setrlimit(resource.RLIMIT_CPU, (time_limit, time_limit))  # CPU Time


    if language == "cpp":
        executable_path = codes_dir / unique
        compile_result = subprocess.run(
            ["clang++", str(code_file_path), "-o", str(executable_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if compile_result.returncode == 0:
            with open(input_file_path, "r") as input_file:
                with open(output_file_path, "w") as output_file:
                    try:
                        result = subprocess.run(
                            [str(executable_path)],
                            stdin=input_file,
                            stdout=output_file,
                            stderr=subprocess.PIPE,
                            text=True,               # Capture error
                            timeout=time_limit,             
                        )
                        if result.returncode != 0:
                            return "Runtime Error!!!\n" + result.stderr.strip()
                    except subprocess.TimeoutExpired:
                        return "Time Limit Exceeded"
        else:
            return "Compilation Error!!!\n" + compile_result.stderr.strip()

    elif language == 'c':
        executable_path = codes_dir / unique
        compile_result = subprocess.run(
            ["clang", str(code_file_path), "-o", str(executable_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if compile_result.returncode == 0:
            with open(input_file_path, "r") as input_file:
                with open(output_file_path, "w") as output_file:
                    try:
                        result = subprocess.run(
                            [str(executable_path)],
                            stdin=input_file,
                            stdout=output_file,
                            stderr=subprocess.PIPE,
                            text=True,               # Capture error
                            timeout=time_limit,             
                        )
                        if result.returncode != 0:
                            return "Runtime Error!!!\n" + result.stderr.strip()
                    except subprocess.TimeoutExpired:
                        return "Time Limit Exceeded"
        else:
            return "Compilation Error!!!\n" + compile_result.stderr.strip()
        
    elif language == "python":
        # Code for executing Python script
        with open(input_file_path, "r") as input_file:
            with open(output_file_path, "w") as output_file:
                try:
                    result = subprocess.run(
                        ["python3", str(code_file_path)],
                        stdin=input_file,
                        stdout=output_file,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=time_limit,
                        start_new_session=True  # Start new process group
                    )
                    if result.returncode != 0:
                        return "Runtime Error!!!\n" + result.stderr.strip()
                except subprocess.TimeoutExpired as e:
                    # Kill the entire process group
                    try:
                        os.killpg(e.pid, signal.SIGKILL)
                    except Exception:
                        pass
                    return "Time Limit Exceeded"

                
    # Write solution as public class Main { public static void main () { ... }}
    elif language == "java":
        import re

        # Ensure class name starts with a letter
        class_name = f"UserMain_{unique.replace('-', '_')}"

        # Replace only the 'public class Main' (or 'class Main') line
        code_with_class_name = re.sub(
            r'\b(public\s+)?class\s+Main\b',
            f'public class {class_name}',
            code
        )

        # Write the modified code to file
        code_file_path = codes_dir / f"{class_name}.java"
        with open(code_file_path, "w") as code_file:
            code_file.write(code_with_class_name)

        # Compile Java file to codes_dir
        compile_result = subprocess.run([
            "javac",
            "-d", str(codes_dir),
            str(code_file_path)
        ])

        # If compilation succeeded, run the class
        # ["java", "-cp", str(codes_dir), class_name],
        if compile_result.returncode == 0:
            with open(input_file_path, "r") as input_file:
                with open(output_file_path, "w") as output_file:
                    try:
                        result = subprocess.run(
                            ["java", "-cp", str(codes_dir), class_name],
                            stdin=input_file,
                            stdout=output_file,
                            stderr=subprocess.PIPE,
                            text=True,               # Capture error
                            timeout=time_limit,             
                        )
                        if result.returncode != 0:
                            return "Runtime Error!!!\n" + result.stderr.strip()
                    except subprocess.TimeoutExpired:
                        return "Time Limit Exceeded"
        else:
            return "Compilation Error!!!\n" + compile_result.stderr.strip()


    # Read the output from the output file
    with open(output_file_path, "r") as output_file:
        output_data = output_file.read()

    return output_data

class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)


class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Discussion.objects.all().order_by('-posted_on')

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(written_by=self.request.user)

    def perform_destroy(self, instance):
        if instance.written_by == self.request.user:
            instance.delete()


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.all().order_by('-posted_on')

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)

    def perform_update(self, serializer):
        print("Updating comment:", serializer.validated_data)
        serializer.save()

    def perform_destroy(self, instance):
        if instance.written_by == self.request.user:
            instance.delete()



    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile = Profile.objects.get(user=request.user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

#DRF-React view
@api_view(['GET'])
def problem_list_api(request):
    problems = Problem.objects.all()
    serializer = ProblemSerializer(problems, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def topicwise_problem_list_api(request, pk):
    topic = Topic.objects.get(pk=pk)
    problems = Problem.objects.filter(topic=topic)
    serializer = ProblemSerializer(problems, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def solution_list_api(request, pk):
    solutions = Solution.objects.filter(problem=pk).order_by('-submitted_at')
    serializer = SolutionSerializer(solutions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def solved_problems_api(request):
    accepted_solutions = Solution.objects.filter(
        written_by=request.user,
        verdict="Accepted",
        problem__isnull=False
    ).select_related('problem')

    problems = {s.problem for s in accepted_solutions if s.problem}
    problems = list(problems)
    serializer = ProblemSerializer(problems, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def testcase_list_api(request, pk):
    testcases = TestCase.objects.filter(problem=pk)
    serializer = TestCaseSerializer(testcases, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def discussion_list_api(request):
    discussions = Discussion.objects.all().order_by('-posted_on')
    serializer = DiscussionSerializer(discussions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def discussion_comment_list_api(request, pk):
    discussion = Discussion.objects.get(pk=pk)
    comments = Comment.objects.filter(discussion=discussion).order_by('-posted_on')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def topic_list_api(request):
    topics = Topic.objects.all()
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def leaderboard(request):
    data = (
    Solution.objects
    .filter(verdict="Accepted")
    .values(username=F("written_by__username"))  # alias it to `username`
    .annotate(solved_count=Count("problem", distinct=True))
    .order_by("-solved_count")
    )
    return Response(data)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])  # Optional: only if login is required to run
def run_code_api(request):
    problem = request.data.get("problem")
    language = request.data.get("language")
    code = request.data.get("code")
    input_data = request.data.get("input_data", "")
    print(problem)

    if not all([language, code]):
        return Response({"error": "Language and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        output = run_code(language, code, input_data, time_limit=problem['time_limit'])
        return Response({"output": output})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ai_review_api(request):
    code = request.data.get("code")
    language = request.data.get("language")

    review = get_ai_feedback(code, language)

    return Response({"review": review})



#Another DRF-React view
@api_view(['GET'])
def problem_detail_api(request, pk):
    try:
        problem = Problem.objects.get(pk=pk)
        serializer = ProblemSerializer(problem, context={'request': request})
        return Response(serializer.data)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=404)
    
def solution_detail_api(request, pk):
    try:
        solution = Solution.objects.get(pk=pk)
        data = {
            "id": solution.id,
            "language": solution.language,
            "code": solution.code,
            "verdict": solution.verdict,
            "written_by": solution.written_by.username,
            "submitted_at": solution.submitted_at,
        }
        return JsonResponse(data)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Solution not found"}, status=404)
    
def discussion_detail_api(request, pk):
    try:
        discussion = Discussion.objects.get(pk=pk)
        data = {
            'id':discussion.id,
            'title':discussion.title,
            'content':discussion.content,
            'posted_on':discussion.posted_on,
            'written_by':discussion.written_by.username
        }
        return JsonResponse(data)
    except:
        return JsonResponse({"error", "Discussion not found"}, status=404)