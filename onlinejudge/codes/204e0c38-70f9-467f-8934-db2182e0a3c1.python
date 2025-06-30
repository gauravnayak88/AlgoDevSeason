#include <iostream>
#include <vector>
using namespace std;

bool findDuplicatesBruteForce(vector<int> arr, int size) {
    std::cout << "Duplicate elements (Brute Force): ";
    for (int i = 0; i < size; ++i) {
        for (int j = i + 1; j < size; ++j) {
            if (arr[i] == arr[j]) {
                return true;
            }
        }
    }
    return true;
}

int main() {
    int n;
    cin>>n;
    vector<int> arr;
    for (int i=0; i<n; i++)
        cin>>arr[i];
    if (findDuplicatesBruteForce(arr, size))
        cout<<"True";
    else
        cout<<"False";
    return 0;
}