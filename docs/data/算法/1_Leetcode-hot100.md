# LeetCode 热题 100

## 哈希

### [1. 两数之和](https://leetcode.cn/problems/two-sum/)

解题思路：把已经用过的数据（数值与下标）使用map存储起来，这样既能在O(1)级别的时间查询出来。

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



### [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

解题思路：string本质上可以看作是一个vector\<char>，可以使用sort()函数对其进行排序，将所有单词内部排序后，互为异位词的重排序单词是相同的。

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



### [128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

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

### [283. 移动零](https://leetcode.cn/problems/move-zeroes/)

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



### [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

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

### [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)

```c++
class Solution {
public:
    unordered_map<int, int> h;
    int subarraySum(vector<int>& nums, int k) {
        h[0] = 1;
        int pre = 0, res = 0;
        for (int i = 0; i < nums.size(); i ++ ) {
            pre += nums[i];
            if(h.find(pre - k) != h.end()) res += h[pre - k];
            h[pre] ++;
        }
        return res;
    }
};
```



### [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

常规解法

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

priority_queue方法

```c++
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> res; 
        priority_queue<pair<int, int>> q;
        for (int i = 0; i < n; i ++ ) {
            q.push({nums[i], i});
            if(i < k - 1) continue;

            while(q.top().second < i - k + 1) q.pop();
            res.push_back(q.top().first);
        }
        return res;
    }
};
```

## 普通数组

### [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

```c++
class Solution {
public:
    int dp[100010];
    int maxSubArray(vector<int>& nums) {
        dp[0] = nums[0];
        int res = dp[0];

        for (int i = 1; i < nums.size(); i ++ ) {
            dp[i] = max(nums[i], nums[i] + dp[i - 1]);

            res = max(res, dp[i]);
        }
        return res;
    }
};
```



### [56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

```c++
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        vector<pair<int, int>> a;
        for (int i = 0; i < intervals.size(); i ++ ) a.push_back({intervals[i][0], intervals[i][1]});
        sort(a.begin(), a.end());

        vector<vector<int>> res;
        int l, r;
        for (int i = 0; i < a.size(); i ++ ) {
            int x = a[i].first, y = a[i].second;
            if(i == 0) {
                l = x, r = y;
            } else {
                if(x >= l && y <= r) {
                    continue;
                }else
                if((x >= l && x <= r) && (y > r)) {
                    r = y;
                } else if (x > r) {
                    vector<int> tmp;
                    tmp.push_back(l);
                    tmp.push_back(r);
                    res.push_back(tmp);
                    l = x, r = y;
                }
            }
        }
        vector<int> tmp;
        tmp.push_back(l);
        tmp.push_back(r);
        res.push_back(tmp);
        return res;
    }
};
```

### [189. 轮转数组](https://leetcode.cn/problems/rotate-array/)

```c++
class Solution {
public:
    vector<int> a;

    void rotate(vector<int>& nums, int k) {
        k = k % nums.size();
        a = nums;
        reverse(nums.size() - k, nums.size() - 1);
        reverse(0, nums.size() - k - 1);
        reverse(0, nums.size() - 1);
        nums = a;
    }

    void reverse(int l, int r) {
        while(l < r) {
            swap(a[l], a[r]);
            l ++;
            r --;
        }
    }

    
};
```

### [238. 除了自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

```c++
class Solution {
public:
    vector<int> l, r;
    vector<int> productExceptSelf(vector<int>& nums) {
        int tmp = 1;
        for (int i = 0; i < nums.size(); i ++ ) {
            l.push_back(tmp);
            tmp *= nums[i];
        }

        tmp = 1;
        for (int i = nums.size() - 1; i >= 0; i -- ) {
            r.push_back(tmp);
            tmp *= nums[i];
        }
        reverse(r.begin(), r.end());

        vector<int> res;
        for (int i = 0; i < nums.size(); i ++ ) {
            res.push_back(l[i] * r[i]);
        }
        return res;
    }
};
```

### [41. 缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/)

```c++
class Solution {
public:
    unordered_set<int> h;
    int firstMissingPositive(vector<int>& nums) {
        for (int i = 0; i < nums.size(); i ++ ) h.insert(nums[i]);
        int idx = 1;
        while(h.count(idx)) {
            idx ++;
        }
        return idx;
    }
};
```



## 矩阵

### [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

```c++
class Solution {
public:
    unordered_set<int> x, y;
    void setZeroes(vector<vector<int>>& matrix) {
        int n = matrix.size(), m = matrix[0].size();

        for (int i = 0; i < n; i ++ ) {
            for (int j = 0; j < m; j ++ ) {
                if(matrix[i][j] == 0) {
                    x.insert(i);
                    y.insert(j);
                }
            }
        }

        for (auto item : x) {
            for (int j = 0; j < m; j ++ ) {
                matrix[item][j] = 0;
            }
        }

        for (auto item : y) {
            for (int j = 0; j < n; j ++ ) {
                matrix[j][item] = 0;
            }
        }

    }
};
```



## 链表

## 二叉树

### [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<int> res;

    vector<int> inorderTraversal(TreeNode* root) {
        dfs(root);
        return res;
    }

    void dfs(TreeNode* root) {
        if(root == nullptr) return ;
        dfs(root->left);
        res.push_back(root->val);
        dfs(root->right);
    }
};
```

### [104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxDepth(TreeNode* root) {
        return dfs(root);
    }

    int dfs(TreeNode* root) {
        if(root == nullptr) return 0;
        return max(dfs(root -> left), dfs(root -> right)) + 1;
    }
};
```

### [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        dfs(root);
        return root;
    }

    void dfs(TreeNode* root) {
        if(root == nullptr) return ;
        TreeNode* tmp = root->right;
        root->right = root->left;
        root->left = tmp;
        dfs(root->right); dfs(root->left);
    }
};
```



## 图论

## 回溯

### [78. 子集](https://leetcode.cn/problems/subsets/)

```c++
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res;
        for (int i = 0; i < (2 << (nums.size() - 1)); i ++ ) {
            int tmp = i, idx = 0;
            vector<int> a;
            while(tmp) {
                if(tmp & 1) a.push_back(nums[idx]);
                tmp = tmp >> 1;
                idx ++;
            }
            res.push_back(a);
        }
        return res;
    }
};
```



## 栈

### [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)

```c++
class Solution {
public:
    bool isValid(string s) {
        stack<char> sta;

        for (int i = 0; i < s.size(); i++) {
            if(s[i] == '[' || s[i] == '{' || s[i] == '(') {
                sta.push(s[i]);
            }
            else {
                // 如果遇到右括号但栈为空，直接返回false
                if(sta.empty()) {
                    return false;
                }
                
                // 检查栈顶是否与当前右括号匹配
                char topChar = sta.top();
                if((s[i] == ']' && topChar == '[') ||
                   (s[i] == '}' && topChar == '{') ||
                   (s[i] == ')' && topChar == '(')) {
                    sta.pop();  // 匹配成功，弹出
                } else {
                    return false;  // 不匹配
                }
            }
        }

        return sta.empty();  // 栈应该为空
    }
};
```

### [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

```c++
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        stack<int> s;
        vector<int> res(temperatures.size());
        s.push(0);
        for (int i = 1; i < temperatures.size(); i ++ ) {
            while(s.size() && temperatures[s.top()] < temperatures[i]) {
                int idx = s.top();
                s.pop();
                res[idx] = (i - idx);
            }
            s.push(i);
        }
        return res;
    }
};
```





## 堆

### [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

```c++
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end());
        return nums[nums.size() - k];
    }
};
```

## 贪心算法

## 动态规划

### [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

```c++
class Solution {
public:
    int dp[50];
    int climbStairs(int n) {
        dp[1] = 1;
        dp[2] = 2;

        for (int i = 3; i <= n; i ++ ) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }

        return dp[n];
    }
};
```

### [118. 杨辉三角](https://leetcode.cn/problems/pascals-triangle/)

```c++
class Solution {
public:
    int dp[40][40];
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> res;
        dp[1][1] = 1;
        vector<int> first;
        first.push_back(1);
        res.push_back(first);
        
        for (int i = 2; i <= numRows; i ++ ) {
            vector<int> tmp;
            for (int j = 1; j <= i; j ++ ) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
                tmp.push_back(dp[i][j]);
            }
            res.push_back(tmp);
        }
        return res;
    }
};
```

### [198. 打家劫舍](https://leetcode.cn/problems/house-robber/)

```c++
class Solution {
public:
    int dp[120];

    int rob(vector<int>& nums) {
        dp[0] = nums[0];

        for (int i = 1; i < nums.size(); i ++ ) {
            if(i == 1) {
                dp[i] = max(nums[0], nums[1]);
            } else 
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);
        }

        return dp[nums.size() - 1];
    }
};
```

### [279. 完全平方数](https://leetcode.cn/problems/perfect-squares/)

```c++
class Solution {
public:
    vector<int> nums;
    int dp[10010];

    int numSquares(int n) {
        for (int i = 1; i * i <= n; i ++ ) nums.push_back(i * i);
        
        dp[0] = 0; dp[1] = 1;

        for (int i = 2; i <= n; i ++ ) {
            int minV = INT_MAX;
            for(int j = 0; j < nums.size(); j ++ )
                if(i - nums[j] >= 0) minV = min(minV, dp[i - nums[j]]);     
            dp[i] = minV + 1;
        }

        return dp[n];
    }
};
```

### [322. 零钱兑换](https://leetcode.cn/problems/coin-change/)

```c++
class Solution {
public:

    int dp[10010];

    int coinChange(vector<int>& coins, int amount) {
        if(amount == 0) return 0;
        
        int num = 0;
        for (int i = 0; i < coins.size(); i ++ ) {
            if(coins[i] <= amount) {
                dp[coins[i]] = 1;
                num ++;
            }
        }
        if(num <= 0) return -1;
        for (int i = 1; i <= amount; i ++ ) {
            int minV = INT_MAX - 1;
            for (int j = 0; j < coins.size(); j ++ )
                if(i - coins[j] >= 0) minV = min(minV, dp[i - coins[j]]);
            dp[i] = minV + 1;
        }

        if(dp[amount] == INT_MAX) return -1;
        return dp[amount];
    }
};
```

### [300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

```c++
class Solution {
public:
    int dp[2510];
    int lengthOfLIS(vector<int>& nums) {
        dp[0] = 1;
        int res = 1;
        for (int i = 1; i < nums.size(); i ++ ) {
            int maxV = 0;
            for (int j = i - 1; j >= 0; j -- ) {
                if(nums[j] < nums[i]) {
                    maxV = max(maxV, dp[j]);
                }
            }
            dp[i] = maxV + 1;
            res = max(res, dp[i]);
        }

        for (int i = 0; i < nums.size(); i ++ ) cout << dp[i] << " ";
        return res;
    }
};
```

### [152. 乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/)

```c++
class Solution {
public:
    int dp[20010];
    int maxProduct(vector<int>& nums) {
        dp[0] = nums[0];
        int res = dp[0];
        for (int i = 1; i < nums.size(); i ++ ) {
            int tmp = nums[i], maxV = nums[i];
            for (int j = i - 1; j >= 0; j -- ) {
                tmp *= nums[j];
                maxV = max(maxV, tmp);
            }
            dp[i] = maxV;
            res = max(res, dp[i]);
        }
        return res;
    }
};
```

## 多维动态规划

## 技巧

### [136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

解题思路：两个相同的数字进行**异或**操作时会变为0.

```c++
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int res = 0;
        for (int i = 0; i < nums.size(); i ++ ) res ^= nums[i];
        return res;
    }
};
```

### [169. 多数元素](https://leetcode.cn/problems/majority-element/)

解题思路：记录下出现的元素的数量即可。

```c++
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int n = nums.size();
        unordered_map<int, int> h;
        for (int i = 0; i < n; i ++ ) {
            h[nums[i]] ++;
            if(h[nums[i]] > (n / 2)) return nums[i];
        }
        return 0;
    }
};
```

### [75. 颜色分类](https://leetcode.cn/problems/sort-colors/)

```c++
class Solution {
public:
    
    void sortColors(vector<int>& nums) {
        
        for (int i = 0; i < nums.size(); i ++ ) {
            int idx = i;
            for (int j = i; j < nums.size(); j ++ ) {
                if(nums[j] < nums[idx]) idx = j;
            }
            swap(nums[i], nums[idx]);
        }
    }
};
```

### [287. 寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/)

```c++
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        
        for (int i = 0, j = 1; j < nums.size(); i ++, j ++ ) {
            if(nums[i] == nums[j]) return nums[i];
        }
        return 0;
    }
};
```

