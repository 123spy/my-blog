# Acwing算法基础课

## 基础算法

### 785.快速排序

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N];

void quick_sort(int l, int r) {
    if(l >= r) return;
    int x = a[(l + r) >> 1];
    int i = l - 1, j = r + 1;
    while(i < j) {
        do {i ++;} while(a[i] < x);
        do {j --;} while(a[j] > x);
        if(i <= j) swap(a[i], a[j]);
    }
    
    quick_sort(l, j);
    quick_sort(j + 1, r);
}

int main() {
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

const int N = 100010;

int a[N];

void quick_sort(int l, int r) {
    if(l >= r) return;
    int x = a[(l + r) >> 1];
    int i = l - 1, j = r + 1;
    while(i < j) {
        do {i ++;} while(a[i] < x);
        do {j --;} while(a[j] > x);
        if(i <= j) swap(a[i], a[j]);
    }
    quick_sort(l, j);
    quick_sort(j + 1, r);
}

int main() {
    int n, k;
    cin >> n >> k;
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    quick_sort(0, n - 1);
    cout << a[k - 1];
    return 0;
}
```

### 787.归并排序

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N], q[N];

void merge_sort(int l, int r) {
    if(l >= r) return ;
    int mid = (l + r) >> 1;
    merge_sort(l, mid);
    merge_sort(mid + 1, r);
    
    int i = l, j = mid + 1, k = 0;
    while(i <= mid && j <= r) {
        if(a[i] <= a[j]) q[k++] = a[i++];
        else q[k++] = a[j++];
    }
    
    while (i <= mid) q[k++] = a[i++];
    while (j <= r) q[k++] = a[j++];
    
    for (int x = 0; x < k; x ++ ) {
        a[l + x] = q[x];
    }
}
int main() {
    int n;
    cin >> n;
    
    for (int i = 0 ; i < n; i ++ ) cin >> a[i];
    
    merge_sort(0, n - 1);
    
    for (int i = 0; i < n; i ++ ) cout << a[i] << " ";
    
    return 0;
}
```

### 788.逆序对的数量

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N], q[N];
long long res;

void merge_sort(int l, int r) {
    if(l >= r) return ;
    int mid = (l + r) >> 1;
    merge_sort(l, mid);
    merge_sort(mid + 1, r);
    
    int i = l, j = mid + 1, k = 0;
    while(i <= mid && j <= r) {
        if(a[i] <= a[j]) {
            q[k++] = a[i++];
        }
        else {
            q[k++] = a[j++];
            res += (mid - i + 1);
        }
    }
    
    while (i <= mid) q[k++] = a[i++];
    while (j <= r) q[k++] = a[j++];
    
    for (int x = 0; x < k; x ++ ) {
        a[l + x] = q[x];
    }
}
int main() {
    int n;
    cin >> n;
    
    for (int i = 0 ; i < n; i ++ ) cin >> a[i];
    
    merge_sort(0, n - 1);
    
    cout << res;
    
    return 0;
}
```

### 789.数的范围

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N];
 
int main()
{
    int n, q;
    cin >> n >> q;
    
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    
    while(q--) {
        int x;
        cin >> x;
        
        // 左边
        int l = 0, r = n - 1;
        while(l < r) {
            int mid = (l + r) / 2;
            if(a[mid] >= x) r = mid;
            else l = mid + 1;
        }
        
        if(a[l] == x) {
            cout << l;
            l = 0, r = n - 1;
            while(l < r) {
                int mid = (l + r + 1) / 2;
                if(a[mid] <= x) l = mid;
                else r = mid - 1;
            }
            cout << " " << l << endl;
        } else {
            cout << "-1 -1" << endl;
        }
    }
}
```

### 790.数的三次方根

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

int main()
{
    double n;
    cin >> n;
    
    double l = -100, r = 100;
    while(r - l > 1e-8) {
        double mid = (l + r) / 2;
        if((mid * mid * mid) >= n) r = mid;
        else l = mid;
    }

    printf("%.6lf", l);
    return 0;
}
```

### 795.前缀和

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N];

int main()
{
    int n, m;
    cin >> n >> m;
    
    for (int i = 1; i <= n; i ++ ) 
    {
        cin >> a[i];
        a[i] += a[i-1];
    }
    
    while (m -- ) {
        int l, r;
        cin >> l >> r;
        cout << a[r] - a[l - 1] << endl;
    }
    return 0;
}
```

### 796.子矩阵的和

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 1010;

int a[N][N], s[N][N];

int main()
{
    int n, m, q;
    cin >> n >> m >> q;
    
    for (int i = 1; i <= n; i ++ ) {
        for (int j = 1; j <= m; j ++ ) {
            cin >> a[i][j];
            s[i][j] = a[i][j] + s[i-1][j] + s[i][j-1] - s[i-1][j-1];
        }
    }
    
    while (q -- ) {
        int x1,y1,x2,y2;
        cin >> x1 >> y1 >> x2 >> y2;
        cout << (s[x2][y2] - s[x2][y1 - 1] - s[x1 - 1][y2] + s[x1 - 1][y1 - 1]) << endl;
    }
    
    return 0;
}
```

### 797.差分

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N], b[N];

int main()
{
    int n, m;
    cin >> n >> m;
    
    for (int i = 1; i <= n; i ++ ) {
        cin >> a[i];
        b[i] = a[i] - a[i - 1]; 
    }
    
    while (m -- ) {
        int l, r, c;
        cin >> l >> r >> c;
        b[l] += c;
        b[r + 1] -= c;
    }
    
    for (int i = 1; i <= n; i ++ ) {
        b[i] += b[i - 1];
        cout << b[i] << " ";
    }

    return 0;
}
```

### 798.差分矩阵

```c++
#include <iostream>

using namespace std;

const int N = 1010;

int n, m, q;
int a[N][N], b[N][N];

void insert(int x1, int y1, int x2, int y2, int c)
{
    b[x1][y1] += c;
    b[x2 + 1][y1] -= c;
    b[x1][y2 + 1] -= c;
    b[x2 + 1][y2 + 1] += c;
}

int main()
{
    scanf("%d%d%d", &n, &m, &q);

    for (int i = 1; i <= n; i ++ )
        for (int j = 1; j <= m; j ++ )
            scanf("%d", &a[i][j]);

    for (int i = 1; i <= n; i ++ )
        for (int j = 1; j <= m; j ++ )
            insert(i, j, i, j, a[i][j]);

    while (q -- )
    {
        int x1, y1, x2, y2, c;
        cin >> x1 >> y1 >> x2 >> y2 >> c;
        insert(x1, y1, x2, y2, c);
    }

    for (int i = 1; i <= n; i ++ )
        for (int j = 1; j <= m; j ++ )
            b[i][j] += b[i - 1][j] + b[i][j - 1] - b[i - 1][j - 1];

    for (int i = 1; i <= n; i ++ )
    {
        for (int j = 1; j <= m; j ++ ) printf("%d ", b[i][j]);
        puts("");
    }

    return 0;
}
```

### 799.最长连续不重复子序列

```c++
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N], s[N];
int res;

int main()
{
    int n;
    cin >> n;
    
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    
    for (int i = 0, j = 0; i < n; i ++ )
    {
        s[a[i]] ++ ;
        while (j < i && s[a[i]] > 1) s[a[j ++ ]] -- ;
        res = max(res, i - j + 1);
    }
    cout << res;
    return 0;
}
```

### 800.数组元素的目标和

```
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 100010;

int a[N], b[N];

int main()
{
    int n, m, x;
    cin >> n >> m >> x;
    
    for (int i = 0; i < n; i ++ ) cin >> a[i];
    for (int i = 0; i < m; i ++ ) cin >> b[i];
    
    int i = 0, j = m - 1;
    while(1) {
        if(a[i] + b[j] == x) {
            cout << i << " " << j;
            return 0;
        }
        if(a[i] + b[j] > x) j --;
        if(a[i] + b[j] < x) i ++;
    }
    return 0;
}
```

### 2816.判断子序列

```c++
#include <iostream>
#include <cstring>

using namespace std;

const int N = 100010;

int n, m;
int a[N], b[N];

int main()
{
    scanf("%d%d", &n, &m);
    for (int i = 0; i < n; i ++ ) scanf("%d", &a[i]);
    for (int i = 0; i < m; i ++ ) scanf("%d", &b[i]);

    int i = 0, j = 0;
    while (i < n && j < m)
    {
        if (a[i] == b[j]) i ++ ;
        j ++ ;
    }

    if (i == n) puts("Yes");
    else puts("No");

    return 0;
}
```



## 数据结构

## 搜索与图论

## 数学知识

## 动态规划

## 贪心