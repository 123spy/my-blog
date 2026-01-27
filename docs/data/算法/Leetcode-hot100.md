# LeetCode 热题 100

## 哈希

### 两数之和

解题思路：

朴素思想，我们会想到使用for的两层循环来解决问题，但是这样的时间复杂度为O(n*n)。

改进思想，如何能优化掉一层for循环使一层O(n)的查询，变为O(1)？把过去已经用过的数据（数值与下标）使用map存储起来，这样既能在O(1)级别的时间查询出来。

```c++
class Solution {
public:
    map<int, int> h;
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> res;
        for (int i = 0; i < nums.size(); i ++ ) {
            auto k = h.find(target - nums[i]);            
            if(k != h.end()) {
                res.push_back(i);
                res.push_back(k->second);
                return res;
            }
            h[nums[i]]=i;
        }
        return res;
    }
};
```



### 字母异位词分组

解题思路：

string本质上可以看作是一个vector\<char>，可以使用sort()函数对其进行排序，将所有单词内部排序后，互为异位词的重排序单词是相同的。

例如：abc, acb, bac排序后都是abc。我们就知道是一组的。

```c++
class Solution {
public:
    map<string, vector<string>> h;
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        for (int i = 0; i < strs.size(); i ++ ) {
            string tmp = strs[i];
            sort(tmp.begin(), tmp.end());
            h[tmp].push_back(strs[i]);
        }
        vector<vector<string>> res;
        for (auto item : h) {
            res.push_back(item.second);
        }
        return res;
    }
};
```



### 最长连续序列

解题思路：

朴素思想，可以使用vector的sort + unique + erase处理后，使用一次for循环来判断，但是这个方法有一个问题，sort默认就是O(NlongN)的，已经超过O(N)的级别了。

```c++
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        nums.erase(unique(nums.begin(), nums.end()), nums.end());
        int res = 0, len = 0;
        for (int i = 0 ; i < nums.size(); i ++ ) {
            if(i == 0) {
                len = 1;
                continue;
            }
            if(nums[i] - 1 == nums[i - 1]) len ++;
            else {
                res = max(res, len);
                len = 1;
            }
        }
        res = max(res, len);
        return res;
    }
};
```

思考过程：

使用set来处理重复的元素，但是set底层使用的是红黑树，插入和查找都是O(longN)级别的，for循环插入进去，就已经是O(NlogN)级别的算法了。所以只能使用unordered_set来处理，unordered_set底层是一个哈希表，查找和插入平均是O(N)。



进阶思路:

不能依赖元素有序，但是只知道元素存在就可以了。

使用unordered_set来处理重复的元素，便利全部的元素，如果是开头的元素就向后遍历查找这个序列的最大长度。如果不是序列开头就不必向后。

所以虽然for里面嵌套着while看着像是O(N*N)级别的算法，但是由于只有序列的开头才会进入while，整体每个元素只被遍历了一遍，所以是O(N)级别的算法

```c++
class Solution {
public:
    map<int, int> h;

    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());

        int res = 0;
        for (auto x : s) {
            if(!s.count(x - 1)) {
                int currentNum = x + 1;
                int len = 1;
                while(s.count(currentNum)) {
                    len ++;
                    currentNum ++;
                }
                res = max(res, len);
            }
        }

        return res;
    }
};
```



## 双指针

### 移动零

```c++
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int k = 0;
        for (int i = 0; i < nums.size(); i ++ ) {
            if(nums[i] != 0) {
                nums[k] = nums[i];
                k ++;
            }
        }
        for (int i = k; i < nums.size(); i ++ ) nums[i] = 0;
    }
};
```



### 盛最多水的容器

解题思路：对撞指针

```c++
class Solution {
public:
    int maxArea(vector<int>& height) {
        int i = 0, j = height.size() - 1;

        int res = 0;
        while(i < j) {
            res = max(res, (j - i) * min(height[i], height[j]));
            if(height[i] >= height[j]) {
                int idx = j;
                while(i < idx && height[idx] <= height[j]) idx --;
                j = idx;
            } else {
                int idx = i;
                while(idx < j && height[idx] <= height[i]) idx ++;
                i = idx;
            }
        }
        return res;
    }
};
```



### [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

朴素实现：

```c++
class Solution {
public:
    int st[20010],su[20010];
    unordered_set<int> s;
    int trap(vector<int>& height) {
        int n = height.size(), maxV = height[0];
        for (int i = 1; i < n; i ++ ) {
            if(maxV > height[i]) st[i] ++;
            maxV = max(maxV, height[i]);
        }
        maxV = height[n - 1];
        for (int i = n - 2; i >= 0; i -- ) {
            if(maxV > height[i]) {
                st[i] ++;
                if(st[i] == 2) s.insert(i);
            }
            maxV = max(maxV, height[i]);
        }
        if(s.size() == 0) return 0;
        int res = 0;
        for (auto item : s) {
            if(su[item]) continue;
            int right = item, left = item;
            while(s.count(right) && right < n) su[right ++] ++;
            while(s.count(left) && left >= 0) su[left --] ++;
            int minHeight = min(height[left], height[right]);
            int sum = 0;
            for (int i = left + 1; i < right; i ++ ) sum += (minHeight - height[i]);
            res += sum; 
        }
        return res;
    }
};
```

双指针实现：

```c++
class Solution {
public:
int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int l_max = 0, r_max = 0;
    int res = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            // 左边较低，水能接多少取决于左边的墙
            height[left] >= l_max ? l_max = height[left] : res += (l_max - height[left]);
            left++;
        } else {
            // 右边较低，水能接多少取决于右边的墙
            height[right] >= r_max ? r_max = height[right] : res += (r_max - height[right]);
            right--;
        }
    }
    return res;
}
};
```



## 滑动窗口

### [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

```c++
class Solution {
public:
    int st[50010];

    int lengthOfLongestSubstring(string s) {
        int res = 0;
        for (int i = 0, j = 0; i < s.size(); i ++ ) {
            st[s[i] - ' '] ++;
            while(j < i && st[s[i] - ' '] != 1) {
                st[s[j] - ' '] --;
                j ++;
            }
            cout << j << " " << i << endl;
            res = max(res, i - j + 1);
        }
        return res;
    }
};
```

### [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

```c++
class Solution {
public:
    int st[30010];
    unordered_map<int, int> h;
    vector<int> findAnagrams(string s, string p) {
        vector<int> res;
        int n = s.size(), m = p.size();
        for (int i = 0; i < m; i ++ ) h[p[i] - 'a'] ++;

        for (int i = 0, j = 0; i < n; i ++ ) {
            st[s[i] - 'a'] ++;
            if(i - j + 1 > m)
                while(i - j + 1 > m || st[s[i] - 'a'] > h[s[i] - 'a']) 
                    st[s[j ++] - 'a'] --;

            if(i - j + 1 == m) {
                bool flag = true;
                for (int k = 0; k < m; k ++ ) 
                    if(st[p[k] - 'a'] != h[p[k] - 'a']) 
                        flag = false;
                if(flag) res.push_back(i - m + 1);
            }
        }

        return res;
    }   
};
```



## 子串

### [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

```c++
class Solution {
public:
    int a[100010]; // 存储的是下标
    int start = 0, end = -1;
    vector<int> copy, res;
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        copy = nums;
        for (int i = 0; i < n; i ++ ) {
            push(i); // 给的是下标
            if(i < k - 1) continue;

            // 获取这个单调队列的头，看看是不是超出界限了
            while(end >= start && a[start] < i - k + 1) pop(); // 弹出队头
            
            // cout << start << " " << end << endl;
            res.push_back(nums[a[start]]);
        }
        return res;
    }

    // 单调队列的插入
    void push(int idx) {
        while(end >= start && copy[a[end]] <= copy[idx]) end --;
        a[++ end] = idx;
    }

    // 单调队列的头弹出
    void pop() {
        start ++;
    }
};
```

