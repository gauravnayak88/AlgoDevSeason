#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++)
        cin >> nums[i];

    cin >> target;

    unordered_map<int, int> seen; // value -> index

    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            int a = seen[complement];
            int b = i;
            if (a > b) swap(a, b);
            cout << a << " " << b << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }

    // If no solution is found (not expected as per the problem)
    cout << "No solution found" << endl;
    return 0;
}
