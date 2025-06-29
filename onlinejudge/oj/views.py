from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Profile, Problem, Topic, ProblemForm, TestCase, TestCaseForm, Solution, Discussion, Comment, SolutionForm, RegisterForm
from django.db.models import Q
from django.http import HttpResponseForbidden, JsonResponse
from django.conf import settings
import os
import uuid
import subprocess
from pathlib import Path

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

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)

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

        for tc in testcases:
            output = run_code(language, code, tc.input)
            actual = output.strip()
            expected = tc.output.strip()

            if actual == expected:
                verdict = "Passed"
                passed_count += 1
            elif output == "Time Limit Exceeded":
                verdict = "Time Limit Exceeded"
            else:
                verdict = "Failed"

            results.append({
                "input": tc.input,
                "expected": expected,
                "actual": actual,
                "verdict": verdict
            })

        final_verdict = "Accepted" if passed_count == len(testcases) else "Wrong Answer"

        solution = Solution.objects.create(
            written_by=request.user,
            problem=problem,
            code=code,
            language=language,
            verdict=final_verdict,
        )

        serializer = self.get_serializer(solution)
        return Response({
            "solution": serializer.data,
            "verdict": final_verdict,
            "results": results
        }, status=status.HTTP_201_CREATED)


def run_code(language, code, input_data, time_limit=2, memory_limit=128*1024*1024):
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


    try:
        if language == "cpp":
            executable_path = codes_dir / unique
            compile_result = subprocess.run(
                ["clang++", str(code_file_path), "-o", str(executable_path)]
            )
            if compile_result.returncode == 0:
                with open(input_file_path, "r") as input_file:
                    with open(output_file_path, "w") as output_file:
                        try:
                            result = subprocess.run(
                                [str(executable_path)],
                                stdin=input_file,
                                stdout=output_file,
                                stderr=subprocess.PIPE,  # Capture error
                                timeout=2,               # Example: 2 seconds for TLE
                            )
                        except subprocess.TimeoutExpired:
                            return "Time Limit Exceeded"
        elif language == "python":
            # Code for executing Python script
            with open(input_file_path, "r") as input_file:
                with open(output_file_path, "w") as output_file:
                    subprocess.run(
                        ["python3", str(code_file_path)],
                        stdin=input_file,
                        stdout=output_file,
                        stderr=output_file,
                    )

        elif language == 'c':
            executable_path = codes_dir / unique
            compile_result = subprocess.run(
                ["clang", str(code_file_path), "-o", str(executable_path)]
            )
            if compile_result.returncode == 0:
                with open(input_file_path, "r") as input_file:
                    with open(output_file_path, "w") as output_file:
                        subprocess.run(
                            [str(executable_path)],
                            stdin=input_file,
                            stdout=output_file,
                            stderr=output_file,
                        )

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
            if compile_result.returncode == 0:
                with open(input_file_path, "r") as input_file, open(output_file_path, "w") as output_file:
                    subprocess.run(
                        ["java", "-cp", str(codes_dir), class_name],
                        stdin=input_file,
                        stdout=output_file,
                        stderr=output_file
                    )
                if result.returncode != 0:
                    verdict = "RE"
                else:
                    verdict = "OK"

                return {
                    "verdict": verdict,
                    "output": result.stdout.strip(),
                    "stderr": result.stderr.strip()
                }
    except subprocess.TimeoutExpired:
        return {
            "verdict": "TLE",
            "output": "",
            "stderr": ""
        }
    except MemoryError:
        return {
            "verdict": "MLE",
            "output": "",
            "stderr": ""
        }



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
    serializer = ProblemSerializer(problems, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def topicwise_problem_list_api(request, pk):
    topic = Topic.objects.get(pk=pk)
    problems = Problem.objects.filter(topic=topic)
    serializer = ProblemSerializer(problems, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def solution_list_api(request, pk):
    solutions = Solution.objects.filter(problem=pk).order_by('-submitted_at')
    serializer = SolutionSerializer(solutions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def solved_problems_api(request):
    solutions = Solution.objects.filter(written_by=request.user).select_related('problem')
    problems = {s.problem for s in solutions}
    serializer = ProblemSerializer(problems, many=True)
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


@api_view(['POST'])
# @permission_classes([IsAuthenticated])  # Optional: only if login is required to run
def run_code_api(request):
    language = request.data.get("language")
    code = request.data.get("code")
    input_data = request.data.get("input_data", "")

    if not all([language, code]):
        return Response({"error": "Language and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        output = run_code(language, code, input_data)
        return Response({"output": output})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#Another DRF-React view
def problem_detail_api(request, pk):
    try:
        problem = Problem.objects.get(pk=pk)
        data = {
            "id": problem.id,
            "name": problem.name,
            "statement": problem.statement,
            "difficulty": problem.difficulty,
            "written_by": problem.written_by.username,
        }
        return JsonResponse(data)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Problem not found"}, status=404)
    
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

def dashboard(request):
    return render(request, "dashboard.html")

def profile(request):
     # Filter user's accepted solutions
    solutions = Solution.objects.filter(written_by=request.user, verdict="accepted")
    
    # Extract unique problem instances
    problems_solved = Problem.objects.filter(
        id__in=solutions.values_list('problem_id', flat=True).distinct()
    )

    context = {
        'problems_solved': problems_solved,
        'solutions': solutions,
    }

    return render(request, "profile.html", context)

def problist(request):
    problems=Problem.objects.all()

    return render(request, "problist.html", {"problems":problems})

def probdisp(request, pk):
    problem=Problem.objects.get(pk=pk)
    form=SolutionForm()
    context={"problem":problem, "form": form}
    # context={}
    return render(request, "probdisp.html", context)

def register_user(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            role = form.cleaned_data['role']
            if User.objects.filter(username=username).exists():
                messages.info(request, 'User with this username already exists')
                return redirect("/register/")

            if User.objects.filter(email=email).exists():
                messages.info(request, 'User with this email already exists')
                return redirect("/register/")
            
            user = User.objects.create_user(username=username, email=email)

            user.set_password(password)

            user.save()

            # Create the profile 
            Profile.objects.create(user=user, role=role)
            
            messages.info(request,'User created successfully')
            return redirect('/login/')

    form = RegisterForm()
    context={'form':form}
    return render(request, "register.html", context)
    
    

def login_user(request):

    if request.method == "POST":
        login_input = request.POST.get('username')
        password = request.POST.get('password')

        try:
            # Try to fetch user by username or email
            user_obj = User.objects.get(Q(username=login_input) | Q(email=login_input))
        except User.DoesNotExist:
            messages.info(request, 'User with this username/email does not exist')
            return redirect('/login/')
        
        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            messages.info(request,'invalid password')
            return redirect('/login')
        

        login(request,user)
        messages.info(request,'login successful')

        return redirect('/')
    
    context ={}
    return render(request, "login.html", context)

def logout_user(request):
    logout(request)
    messages.info(request,'logout successful')
    return redirect('/')

@login_required
def add_problem(request):
    if request.user.profile.role != 'staff':
        return HttpResponseForbidden("Only staff can add problems")
    if request.method=="POST":
        form = ProblemForm(request.POST)
        if form.is_valid():
            problem = form.save(commit=False)
            problem.written_by=request.user
            problem.save()
            return redirect('/problist/')
        
    form=ProblemForm()
    context={"form":form}
    return render(request, "addprob.html", context)

def update_problem(request, pk):
    problem = Problem.objects.get(pk=pk)

    if request.method == 'POST':
        form = ProblemForm(request.POST, instance=problem)
        if form.is_valid():
            updated_problem = form.save(commit=False)
            updated_problem.written_by = problem.written_by  # retain original user
            updated_problem.save()
            return redirect('/problist/')
    else:
        form = ProblemForm(instance=problem)

    context = {"form": form}
    return render(request, "addprob.html", context)

def delete_problem(request, pk):
    problem = Problem.objects.get(pk=pk)
    if problem:
        problem.delete()
        messages.info(request,'Deleted Successfully')

    return redirect('/problist/')

def add_testcase(request, pk):
    if request.method=='POST':
        form = TestCaseForm(request.POST)
        if form.is_valid():
            tc=form.save(commit=False)
            Tc=TestCase.objects.filter(input=tc.input)
            if Tc.exists():
                messages.info(request, 'Test case with given input already exists')
                return redirect(f"/addtestcase/{pk}")
            tc.problem=Problem.objects.get(pk=pk)
            tc.written_by=request.user
            tc.save()

            return redirect(f"/testcaselist/{pk}")
        
    form= TestCaseForm()
    context={"form":form}
    return render(request, "addtc.html", context)

def testcase_list(request, pk):
    problem=Problem.objects.get(pk=pk)
    tcs=TestCase.objects.filter(problem=problem)

    return render(request, "tclist.html", {"cases":tcs, "problem":problem})

def update_testcase(request, pid, cid):
    problem=Problem.objects.get(pk=pid)
    tc=TestCase.objects.get(pk=cid)

    if request.method=='POST':
        form = TestCaseForm(request.POST, instance=tc)
        if form.is_valid():
            tc=form.save(commit=False)
            tc.problem=problem
            tc.written_by=request.user
            tc.save()

            return redirect(f"/testcaselist/{pid}")
        
    form= TestCaseForm(instance=tc)
    context={"form":form}
    return render(request, "addtc.html", context)

def delete_testcase(request, pid, cid):
    tc=TestCase.objects.get(pk=cid)
    if tc:
        tc.delete()

    return redirect(f"/testcaselist/{pid}")

def solution_list(request, pid):
    problem=Problem.objects.get(pk=pid)
    solutions=Solution.objects.filter(problem=problem)
    context={"solutions":solutions}
    return render(request, "sollist.html", context)

@login_required
def add_solution(request, pid):
    if (request.method=='POST'):
        form=SolutionForm(request.POST)
        solution=form.save(commit=False)
        solution.problem=Problem.objects.get(pk=pid)
        solution.verdict="accepted"
        solution.written_by=request.user
        solution.save()

        return redirect(f'/probdisp/{pid}')
    
def mysolutions_list(request, pid):
    problem=Problem.objects.get(pk=pid)
    solutions=Solution.objects.filter(problem=problem, written_by=request.user)
    context={"solutions":solutions}
    return render(request, "sollist.html", context)

def solution_disp(request, sid):
    solution=Solution.objects.get(pk=sid)

    return render(request, 'soldisp.html', {'solution':solution})