#include <iostream>
using namespace std;

int main()
{
int n;
cin>>n;
int r=0;
while (n>1)
{
r=r*10+n%10;
n=n/10;
}
cout<<r;
return 0;
}