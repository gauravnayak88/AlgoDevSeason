#include <iostream>
#include <vector>
using namespace std;

bool findDuplicatesBruteForce(vector<int> arr, int size) {
    for (int i = 0; i < size; ++i) {
        for (int j = i + 1; j < size; ++j) {
            if (arr[i] == arr[j]) {
                return true;
            }
        }
    }
    return false;
}

int main() {
    int n;
    int *m=NULL;
    cout<<*m;
    cin>>n;
    vector<int> arr(n);
    for (int i=0; i<n; i++)
        cin>>arr[i];
    if (findDuplicatesBruteForce(arr, n))
        cout<<"true";
    else
        cout<<"false";
    return 0;
}