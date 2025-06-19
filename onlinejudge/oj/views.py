from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Profile, Problem, ProblemForm, TestCase, TestCaseForm, Solution, SolutionForm, RegisterForm
from django.db.models import Q
from django.http import HttpResponseForbidden

# Create your views here.


def dashboard(request):
    return render(request, "dashboard.html")

def profile(request):
    return render(request, "profile.html")

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
    
def solution_disp(request, sid):
    solution=Solution.objects.get(pk=sid)

    return render(request, 'soldisp.html', {'solution':solution})