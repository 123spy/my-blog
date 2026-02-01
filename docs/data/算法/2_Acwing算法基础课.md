# Acwing算法基础课

## 基础算法

### 785.快速排序

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100100;

int a[N];

void quick_sort(int l, int r) {
    
    if(l >= r) return ;

    int x = a[(l + r) >> 1], i = l - 1, j = r + 1;
    
    while(i < j) {
        do i ++ ; while (a[i] < x);
        do j -- ; while (a[j] > x);
        if (i < j) swap(a[i], a[j]);
    }
    
    quick_sort(l, j);
    quick_sort(j + 1, r);
}

int main()
{
    int n;
    cin >> n;
    
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    
    quick_sort(0, n - 1);
    
    for (int i = 0; i < n; i ++ ) cout << a[i] << " ";
    
    return 0;
}
```

### 786.第k个数

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100100;

int a[N];

void quick_sort(int l, int r) {
    if(l >= r) return ;
    int x = a[(l + r) >> 1], i = l - 1, j = r + 1;
    
    while(i < j) {
        do i ++ ; while (a[i] < x);
        do j --; while(a[j] > x);
        if(i < j) swap(a[i], a[j]);
    }
    
    quick_sort(l, j);
    quick_sort(j + 1, r);
}

int main()
{
    int n, m;
    cin >> n >> m;
    
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    
    quick_sort(0, n - 1);
    
    cout << a[m - 1];
    
    return 0;
}
```



## 数据结构

## 搜索与图论

## 数学知识

## 动态规划

## 贪心