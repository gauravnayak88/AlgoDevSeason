from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Problem, ProblemForm

# Create your views here.


def dashboard(request):
    return render(request, "dashboard.html")

def problist(request):
    problems=Problem.objects.all()

    return render(request, "problist.html", {"problems":problems})

def probdisp(request, pk):
    problem=Problem.objects.get(pk=pk)
    context={"problem":problem}
    # context={}
    return render(request, "probdisp.html", context)

def register_user(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = User.objects.filter(username=username)

        if user.exists():
            messages.info(request,'User with this username already exists')
            return redirect("/register/")
        
        user = User.objects.create_user(username=username)

        user.set_password(password)

        user.save()
        
        messages.info(request,'User created successfully')
        return redirect('/login/')

    context={}
    return render(request, "register.html", context)
    
    

def login_user(request):

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not User.objects.filter(username=username).exists():
            messages.info(request,'User with this username does not exist')
            return redirect('/login/')
        
        user = authenticate(username=username, password=password)

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
    return redirect('/login/')

@login_required
def add_problem(request):
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