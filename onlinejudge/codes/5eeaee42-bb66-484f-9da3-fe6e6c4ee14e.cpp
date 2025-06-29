#include <iostream>
using namespace std;

int main()
{
int a;
cin>>a;
int rev=0;
while (a>0)
{
rev=rev*10+a%10;
a/=10;
}
return 0;
}