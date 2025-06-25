from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Profile, Problem, ProblemForm, TestCase, TestCaseForm, Solution, Discussion, SolutionForm, RegisterForm
from django.db.models import Q
from django.http import HttpResponseForbidden, JsonResponse
from django.conf import settings
import os
import uuid
import subprocess
from pathlib import Path

#DRF
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import ProfileSerializer, ProblemSerializer, TestCaseSerializer, SolutionSerializer, DiscussionSerializer
from .permissions import IsStaffUser

# Create your views here.

# Class based views
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

    def perform_create(self, serializer):
        language = self.request.data.get("language")
        code = self.request.data.get("code")
        input_data = self.request.data.get("input_data", "")
        print(language, code, input_data)

        output = run_code(language, code, input_data)

        serializer.save(
            written_by=self.request.user,
            verdict="accepted",  # In future, you can determine this based on output
            input_data=input_data,
            output_data=output,
        )

def run_code(language, code, input_data):
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

    if language == "cpp":
        executable_path = codes_dir / unique
        compile_result = subprocess.run(
            ["clang++", str(code_file_path), "-o", str(executable_path)]
        )
        if compile_result.returncode == 0:
            with open(input_file_path, "r") as input_file:
                with open(output_file_path, "w") as output_file:
                    subprocess.run(
                        [str(executable_path)],
                        stdin=input_file,
                        stdout=output_file,
                    )
    elif language == "python":
        # Code for executing Python script
        with open(input_file_path, "r") as input_file:
            with open(output_file_path, "w") as output_file:
                subprocess.run(
                    ["python3", str(code_file_path)],
                    stdin=input_file,
                    stdout=output_file,
                )

    # Read the output from the output file
    with open(output_file_path, "r") as output_file:
        output_data = output_file.read()

    return output_data

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     if not serializer.is_valid():
    #         print(serializer.errors)  # 👈 this will show the exact issue
    #         return Response(serializer.errors, status=400)
    #     self.perform_create(serializer)
    #     return Response(serializer.data, status=201)
    
class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)

class DiscussionViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(written_by=self.request.user)

    
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
def solution_list_api(request, pk):
    solutions = Solution.objects.filter(problem=pk)
    serializer = SolutionSerializer(solutions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def testcase_list_api(request, pk):
    testcases = TestCase.objects.filter(problem=pk)
    serializer = TestCaseSerializer(testcases, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def discussion_list_api(request):
    discussions = Discussion.objects.all()
    serializer = DiscussionSerializer(discussions, many=True)
    return Response(serializer.data)

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