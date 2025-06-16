from django.shortcuts import render
from .models import Problem

# Create your views here.
def problist(request):
    problems=Problem.objects.all()

    return render(request, "problist.html", {"problems":problems})

def probdisp(request, pk):
    problem=Problem.objects.get(pk=pk)
    context={"problem":problem}
    # context={}
    return render(request, "probdisp.html", context)