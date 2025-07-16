from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.contrib import messages
from .models import Profile, Problem, Topic, Contest, ProblemForm, TestCase, TestCaseForm, Solution, Discussion, Comment, SolutionForm, RegisterForm
from django.db.models import Q, F, Count, Sum, Case, When, IntegerField
from django.http import HttpResponseForbidden, JsonResponse, FileResponse, Http404
from collections import defaultdict
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
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ProfileSerializer, ProblemSerializer, ContestSerializer, TopicSerializer, TestCaseSerializer, SolutionSerializer, DiscussionSerializer, CommentSerializer, EmailOrUsernameLoginSerializer
from .permissions import IsStaffUser, IsOwnerOrReadOnly


# Create your views here.

def serve_media(request, path):
    full_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(full_path):
        return FileResponse(open(full_path, 'rb'))
    raise Http404("File not found")

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

@api_view(['POST'])
def ai_hint_api(request):
    problem = request.data.get("problem", "")
    code = request.data.get("code", "")
    language = request.data.get("language", "")

    prompt = f"""You are a helpful programming mentor.

    The user is solving the following problem in {language}:
    {problem}

    Here is their current code attempt:
    {code}

    Give 2–3 actionable hints that guide the user toward a better or correct solution. 
    - Avoid giving the full solution.
    - Focus on helping the user identify possible mistakes, edge cases, or logic gaps.
    - Be concise and use bullet points if appropriate.
    """


    hint = query_openrouter(prompt)
    print(hint)
    return Response({"hint": hint})

@api_view(['POST'])
def ai_generate_code_api(request):
    problem = request.data.get("problem", "")
    language = request.data.get("language", "")

    prompt = f"""You are a skilled competitive programmer.

    Write an efficient and well-structured solution in {language} for the following problem:

    {problem}

    Guidelines:
    - Use clear and concise code.
    - Include brief inline comments explaining key steps.
    - Avoid unnecessary input/output handling (assume input is already provided).
    - Optimize for readability and performance.
    """


    code = query_openrouter(prompt)
    print(code)
    return Response({"code": code})

@api_view(['POST'])
def ai_review_api(request):
    code = request.data.get("code")
    language = request.data.get("language")

    prompt = f"""You're a senior software engineer.

    Review the following {language} code for logic, clarity, and style:

    {code}

    Your review should include:
    - Strengths of the code
    - Potential bugs or logic issues (if any)
    - Suggestions for improving performance, readability, or structure

    Keep the review brief and constructive.
    """


    review = query_openrouter(prompt)
    print(review)
    return Response({"review": review})


# Helper used in all three
def query_openrouter(prompt):
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
        }

        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json={
                "model": "google/gemini-2.5-flash-lite-preview-06-17",
                "messages": [
                    {"role": "system", "content": "You are a helpful programming assistant."},
                    {"role": "user", "content": prompt}
                ]
            }
        )
        
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI response unavailable. Error: {str(e)}"
    
# def query_gemini(prompt):
#     try:
#         headers = {
#             "Content-Type": "application/json",
#         }

#         payload = {
#             "contents": [
#                 {
#                     "parts": [
#                         {"text": prompt}
#                     ]
#                 }
#             ]
#         }

#         response = httpx.post(
#             f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}",
#             headers=headers,
#             json=payload
#         )

#         data = response.json()

#         return data["candidates"][0]["content"]["parts"][0]["text"]

#     except Exception as e:
#         return f"AI response unavailable. Error: {str(e)}"


@method_decorator(never_cache, name='dispatch')
class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = []

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaffUser()]  # only staff
        return [IsAuthenticated()]
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        contest = self.get_object()
        contest.joined_users.add(request.user)
        return Response({"joined": True})
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def joined(self, request):
        contests = Contest.objects.filter(joined_users=request.user)
        serializer = self.get_serializer(contests, many=True)
        return Response(serializer.data)

class ContestLeaderboardAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        contest = Contest.objects.get(pk=pk)
        users_scores = {}

        solutions = Solution.objects.filter(problem__contest=contest, verdict='Accepted').select_related('problem', 'written_by')

        for sol in solutions:
            user = sol.written_by
            problem = sol.problem
            difficulty = problem.difficulty

            # Assign score based on difficulty
            if difficulty == "easy":
                score = 50
            elif difficulty == "medium":
                score = 100
            elif difficulty == "hard":
                score = 150
            else:
                score = 0

            users_scores.setdefault(user, {"score": 0, "solved": set(), "last_time": sol.submitted_at})

            if problem.id not in users_scores[user]["solved"]:
                users_scores[user]["score"] += score
                users_scores[user]["solved"].add(problem.id)
                if sol.submitted_at > users_scores[user]["last_time"]:
                    users_scores[user]["last_time"] = sol.submitted_at

        leaderboard = sorted([
            {
                "user": user.username,
                "score": data["score"],
                "solved_problems": list(data["solved"]),
                "last_submission_time": data["last_time"]
            } for user, data in users_scores.items()
        ], key=lambda x: (-x["score"], x["last_submission_time"]))

        return Response(leaderboard)


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
        mle_count = 0
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
            output = run_code(language, code, input_text, problem.time_limit, problem.memory_limit)
            print("VERDICT CHECK OUTPUT:", repr(output))
            actual = output.strip()
            expected = expected_output.strip()

            print(output)
            

            if actual == expected:
                verdict = "Passed"
                passed_count += 1
            elif "Compilation Error" in output:
                verdict = "Compilation Error"
                compilation_error_count += 1
                break
            elif "Memory Limit Exceeded" in output:
                verdict = "Memory Limit Exceeded"
                mle_count += 1
            elif "Runtime Error" in output or "Segmentation Fault" in output:
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
        elif mle_count>0:
            final_verdict = "Memory Limit Exceeded"
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


def run_code(language, code, input_data, time_limit, memory_limit):
    print(f"[DEBUG] language={language}, time_limit={time_limit}, memory_limit={memory_limit}")
    # print(time_limit)
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

    def get_limit_function(memory_limit, time_limit):
        safe_limit = max(memory_limit, 128 * 1024 * 1024)
        def set_limits():
            import resource
            try:
                if memory_limit > 0:
                    resource.setrlimit(resource.RLIMIT_AS, (safe_limit, safe_limit))
                if time_limit > 0:
                    resource.setrlimit(resource.RLIMIT_CPU, (int(time_limit), int(time_limit)))
            except Exception as e:
                print("set_limits error:", e)
                raise
        return set_limits


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
                            preexec_fn=get_limit_function(memory_limit, time_limit)            
                        )
                        if result.returncode != 0:
                            signal_num = -result.returncode
                            signal_name = signal.Signals(signal_num).name
                            if signal_name == "SIGKILL":
                                return "Memory Limit Exceeded"
                            elif signal_name in ["SIGSEGV", "SIGABRT", "SIGBUS"]:
                                if "bad_alloc" in result.stderr or "std::bad_alloc" in result.stderr:
                                    return "Memory Limit Exceeded"
                                elif signal_name == 'SIGSEGV':
                                    return "Segmentation Fault"
                                else:
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
                            preexec_fn=get_limit_function(memory_limit, time_limit)            
                        )
                        if result.returncode != 0:
                            signal_num = -result.returncode
                            signal_name = signal.Signals(signal_num).name
                            if signal_name == "SIGKILL":
                                return "Memory Limit Exceeded"
                            elif signal_name in ["SIGSEGV", "SIGABRT", "SIGBUS"]:
                                if "bad_alloc" in result.stderr or "std::bad_alloc" in result.stderr:
                                    return "Memory Limit Exceeded"
                                elif signal_name == 'SIGSEGV':
                                    return "Segmentation Fault"
                                else:
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
                        preexec_fn=get_limit_function(memory_limit, time_limit)   # Enforce limits
                    )
                    if result.returncode != 0:
                        signal_num = -result.returncode
                        if signal_num > 0:
                            signal_name = signal.Signals(signal_num).name
                            if signal_name == "SIGXCPU":
                                return "Time Limit Exceeded"
                            elif signal_name == "SIGKILL":
                                # Try to infer cause from stderr
                                if "MemoryError" in result.stderr:
                                    return "Memory Limit Exceeded"
                                elif "RecursionError" in result.stderr:
                                    return "Memory Limit Exceeded"
                                else:
                                    return "Time Limit Exceeded"  # Assume TLE unless evidence of MLE
                            else:
                                return f"Runtime Error!!!\nKilled by signal: {signal_name}"

                except subprocess.TimeoutExpired:
                    return "Time Limit Exceeded"

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
                        # Use /usr/bin/time to capture memory usage (optional)
                        result = subprocess.run(
                            ["java", "-Xmx256m", "-cp", str(codes_dir), class_name],
                            stdin=input_file,
                            stdout=output_file,
                            stderr=subprocess.PIPE,
                            text=True,
                            timeout=time_limit,
                        )

                        if result.returncode != 0:
                            # Handle Java out-of-memory
                            if "java.lang.OutOfMemoryError" in result.stderr:
                                return "Memory Limit Exceeded"
                            else:
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
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


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
    print("=== problem_list_api HIT ===")
    problems = Problem.objects.filter(is_hidden=False)
    serializer = ProblemSerializer(problems, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def topicwise_problem_list_api(request, pk):
    topics = Topic.objects.get(pk=pk)
    problems = Problem.objects.filter(topics=topics, is_hidden=False)
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
    accepted = (
        Solution.objects
        .filter(verdict="Accepted")
        .select_related("written_by", "problem")
    )

    # (username, problem_id) → ensure uniqueness
    user_problem_set = set()
    user_stats = defaultdict(lambda: {"solved_count": 0, "score": 0})

    for sol in accepted:
        key = (sol.written_by.username, sol.problem.id)
        if key not in user_problem_set:
            user_problem_set.add(key)
            difficulty = sol.problem.difficulty
            if difficulty == "easy":
                user_stats[sol.written_by.username]["score"] += 50
            elif difficulty == "medium":
                user_stats[sol.written_by.username]["score"] += 100
            elif difficulty == "hard":
                user_stats[sol.written_by.username]["score"] += 150
            user_stats[sol.written_by.username]["solved_count"] += 1

    # Convert to list and sort by score descending
    leaderboard = [
        {"username": username, **stats}
        for username, stats in user_stats.items()
    ]
    leaderboard.sort(key=lambda x: x["score"], reverse=True)

    return Response(leaderboard)



@api_view(['POST'])
# @permission_classes([IsAuthenticated])  # Optional: only if login is required to run
def run_code_api(request):
    language = request.data.get("language")
    code = request.data.get("code")
    input_data = request.data.get("input_data", "")

    if not all([language, code]):
        return Response({"error": "Language and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        output = run_code(language, code, input_data, time_limit=2, memory_limit=128*1024*1024)
        print(output)
        return Response({"output": output})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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