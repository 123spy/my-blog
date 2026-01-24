# LeetCode 热题 100

## 两数之和

解题思路：

朴素思想，我们会想到使用for的两层循环来解决问题，但是这样的时间复杂度为O(n*n)。

改进思想，如何能优化掉一层for循环使一层O(n)的查询，变为O(1)？把过去已经用过的数据（数值与下标）使用map存储起来，这样既能在O(1)级别的时间查询出来。

```
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



## 字母异位词分组

解题思路：

string本质上可以看作是一个vector<char>，可以使用sort()函数对其进行排序，将所有单词内部排序后，互为异位词的重排序单词是相同的。

例如：abc, acb, bac排序后都是abc。我们就知道是一组的。

```
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



## 最长连续序列

解题思路：

朴素思想，可以使用vector的sort + unique + erase处理后，使用一次for循环来判断，但是这个方法有一个问题，sort默认就是O(NlongN)的，已经超过O(N)的级别了。

```
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

```
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

