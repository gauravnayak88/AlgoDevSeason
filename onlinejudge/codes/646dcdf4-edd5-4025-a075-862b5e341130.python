#include <iostream>
#include <vector>
using namespace std;

bool findDuplicatesBruteForce(int arr[], int size) {
    for (int i = 0; i < size; ++i) {
        for (int j = i + 1; j < size; ++j) {
            if (arr[i] == arr[j]) {
                return false;
            }
        }
    }
    return true;
}

int main() {
    int n;
    cin>>n;
    vector<int> arr(n);
    for (int i=0; i<n; i++)
        cin>>arr[i];
    cout<<findDuplicatesBruteForce(arr, size);
    return 0;
}