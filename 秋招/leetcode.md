### 1.合并链表

记得for循环走完了之后，检查是否还有链表没走完

```Go
if list1 !=nil {
    tail.Next = list1
}
if list2 !=nil {
    tail.Next = list2
}
```

### 2.二叉树展开为链表

注意pre指针在函数中变，cur只通过传入参数改变

```Go
func flatten(root *TreeNode)  {
    pre := &TreeNode{

    }
    dfs(pre, root)
}

func dfs(pre, cur *TreeNode) {
    if cur  == nil{
        return 
    }
    pre.Right = cur
    pre.Left = nil
    pre = cur
    l, r := cur.Left, cur.Right
    dfs(pre, l)
    dfs(pre, r)
}
```

### 3.路径总和

没有什么好的思路

其实本质是两个，一个是所有的节点都需要遍历得到总和，另外一个是找到以当前节点为起始，分别往左边或者右边走的话有没有总和等于target（如果是减法，target==当前节点值也可以）

```Go
func pathSum(root *TreeNode, targetSum int) int {
    if root ==nil{
        return 0
    }
    return getPathCount(root, targetSum) + pathSum(root.Left, targetSum) + pathSum(root.Right, targetSum)
}

func getPathCount(root *TreeNode, targetSum int) int {
    if root == nil{
        return 0
    }
    sum := 0
    if targetSum == root.Val {
        sum++
    }
    sum = sum + getPathCount(root.Left, targetSum - root.Val) + getPathCount(root.Right, targetSum - root.Val)
    return sum
}
```

### 4.前缀树

检索的时候，我们只需要看看最后一个节点是不是isEnd == true，不需要在word遍历的时候看看节点是不是isEnd == false，这也是前缀树的意义所在之一，如果每个节点都是End说明每一个节点都有一个单词

```Go
func (this *Trie) Search(word string) bool {
    for i := 0; i < len(word); i++ {
        if this.Node[word[i] - 'a'] == nil{
            return false
        }
        this = this.Node[word[i] - 'a']
    }

    return this.isEnd == true
}


func (this *Trie) StartsWith(prefix string) bool {
    for i := 0; i < len(prefix); i++ {
        if this.Node[prefix[i] - 'a'] == nil{
            return false
        }
        this = this.Node[prefix[i] - 'a']
    }

    return true
}
```

### 5.滑动窗口最大值和最小栈和每日温度

他们主要都是依赖一个单调递减的数组。只不过滑动窗口最大值需要一个严格单调递减，并且需要历史元素退栈然后当前元素入栈；最小栈则是一个非严格的单调递减，并且当前元素不满足就不入栈就可以。
最小栈注意复制切片的时候需要操作原有切片。

每日温度也是维护一个非严格的单调递减数组，然后当前元素不满足要求，就退栈和保存对应答案

```Go
// 最小栈
func (this *MinStack) Push(value int)  {
    // arr := this.list
    minArr := this.minList

    if len(minArr) == 0 || minArr[len(minArr) - 1] >= value {
        this.minList = append(this.minList, value)
    }
    this.list = append(this.list, value)
}


func (this *MinStack) Pop()  {
    arr := this.list
    minArr := this.minList
    if len(minArr) > 0 && minArr[len(minArr) - 1] == arr[len(arr)- 1] {
        this.minList = this.minList[:len(this.minList) - 1]
    }
    this.list = this.list[:len(this.list) - 1]
}


// 滑动窗口最大值
func maxSlidingWindow(nums []int, k int) []int {
    ret := []int{}
    queue := []int{}
    for i := 0; i <len(nums); i++ {
        for len(queue) > 0 && nums[queue[len(queue) - 1]] < nums[i] {
            queue = queue[:len(queue) - 1]
        }
        queue = append(queue, i)

        for i >= k && queue[0] <= i - k {
            queue = queue[1:]
        }

        if i >= k - 1 {
            ret = append(ret, nums[queue[0]])
        }
    }

    return ret
}

// 每日温度
func dailyTemperatures(temperatures []int) []int {
    stack := []int{}
    ret := make([]int, len(temperatures))
    for i, v := range temperatures {
        if len(stack) == 0 || temperatures[stack[len(stack) - 1]] >= v {
            stack = append(stack, i)
        } else {
            for len(stack) > 0 && temperatures[stack[len(stack) - 1]] < v {
                ret[stack[len(stack) - 1]] = i - stack[len(stack) - 1] 
                stack = stack[:len(stack) - 1]
            }
            stack = append(stack, i)
        }
    }

    return ret
}
```

### 5.字符串解码

拿栈的元素的时候记得出栈

```Go
func decodeString(s string) string {
    str := ""
    num := 0
    strStack := []string{}
    numStack := []int{}

    for i := 0; i < len(s); i++ {
        if isNum(s[i]) {
            num = num * 10 + int(s[i] - '0')
        } else if isLetter(s[i]) {
            str = str + string(s[i])
        } else if s[i] == '[' {
            strStack = append(strStack, str)
            numStack = append(numStack, num)
            num = 0
            str = ""
        } else {
            lastStr := strStack[len(strStack) - 1]
            lastNum := numStack[len(numStack) - 1]
            numStack = numStack[:len(numStack) - 1]
            strStack = strStack[:len(strStack) - 1]
            tempStr := ""
            for i := 0; i < lastNum; i++ {
                tempStr += str
            }
            str = lastStr + tempStr
        }
    }

    return str
}
```

### 6.柱状图中最大的矩形

维护一个非严格的单调递增数组，遇到不符合的元素就退栈，然后用遍历元素位置减一 减去 退栈之后栈顶元素作为距离，用退栈的元素对应的高度作为高度，相乘就是答案

```Go
func largestRectangleArea(heights []int) int {
    ret := 0

    heights = append([]int{0}, heights...)
    heights = append(heights, 0)
    stack := []int{}

    for i, v := range heights {
        if len(stack) == 0 || v >= heights[stack[len(stack) - 1]] {
            stack = append(stack, i)
        } else {
            for len(stack) > 0 && v < heights[stack[len(stack) - 1]] {
                idx := stack[len(stack) - 1]
                stack = stack[:len(stack) - 1]
                j := stack[len(stack) - 1]
                ret = max(ret, (i - 1 - j) * heights[idx])
            }

            stack = append(stack, i)
        }
    }

    return ret
}
```

### 6.划分字母区间

有点不熟练了，主要是双指针，左指针记录开始的位置，右指针记录右边的位置，每次for循环，右指针找到当前最远的位置，如果i == last，那就收纳，同时改变左指针

```Go
func partitionLabels(s string) []int {
	arr := make([]int, 26)
	for i := 0; i < len(s); i++ {
		arr[s[i]-'a'] = i
	}

	ret := []int{}
	first := 0
	last := arr[s[0]-'a']
	for i := 0; i < len(s); i++ {
		last = max(last, arr[s[i]-'a'])
		if i == last {
			ret = append(ret, last-first+1)
			first = i + 1
		}
	}

	return ret
}
```

### 7.跳跃游戏II

主要是两个：

- 每次都是i在from和to之间扫描，找到from到to之间到下一个最远的to
- 只需要for循环到len(nums) - 2

```Go
func jump(nums []int) int {
    from := 0
    to := 0
    count := 0
    for i := 0; i < len(nums) - 1; i++ {
        to = max(to, nums[i] + i)
        if from == i {
            count++
            from = to
        }
        if from >= len(nums) - 1 {
            return count
        }
    }

    return count
}
```

### 8.寻找旋转排序数组中的最小值

一个比较巧妙的思路是，旋转排序数组的左半部分或者右半部分至少有一个是有序的，可以用一个基准值，每次二分都是拿到有序部分最小的一个值来比较。

```Go
func findMin(nums []int) int {
    l, r := 0, len(nums) - 1
    ret := 5001
    for l <= r { 
        mid := (l +r) >>1
        if nums[mid] < nums[r] {
            ret = min(ret, nums[mid])
            r = mid - 1
        } else {
            ret = min(ret, nums[l])
            l = mid + 1
        }
    }

    return ret
}
```

### 9.颜色分类

记得是`for i := 0; i <= r;`，等于号不能缺少

```Go
func sortColors(nums []int)  {
    l, r := 0, len(nums) - 1
    for i := 0; i <= r; {
        if nums[i] == 0 {
            nums[l], nums[i] = nums[i], nums[l]
            l++
        }
        if nums[i] == 2 {
            nums[r], nums[i] = nums[i], nums[r]
            r--
        } else {
            i++
        }
    }
}
```

### 10.完全平方数

动态规划，第一个元素标记为0，其他是i

```Go
func numSquares(n int) int {
    dp := make([]int, n + 1)
    dp[0] = 0
    for i := 1; i <= n; i++ {
        dp[i] = i
        for j := 1; j * j <= i; j++ {
            dp[i] = min(dp[i], dp[i - j * j] + 1)
        }
    }

    return dp[n]
}
```

11.寻找重复数

看是否会破坏数组

- 使用快慢指针找循环
- 使用绝对负数标记位

```Go
// 1.快慢指针
func findDuplicate(nums []int) int {
    slow, fast := 0,0
    for {
        slow = nums[slow]
        fast = nums[fast]
        fast = nums[fast]
        if fast == slow {
            break
        }
    }
    slow = 0
    for {
        slow = nums[slow]
        fast = nums[fast]
        if fast == slow {
            return fast
        }
    }
    return -1
}

// 负数标记
func findDuplicate(nums []int) int {
    for i := 0; i < len(nums); i++ {
        a := abs(nums[i])
        if nums[a] < 0 {
            return a
        } else {
            nums[a] = -nums[a]
        }
    }

    return -1
}

func abs(a int) int{ 
    if a < 0 {
        return -a
    }
    return a
}
```

### 11.乘积最大子数组

如果已经是0，那就用当前的数字

```Go
func maxProduct(nums []int) int {
    ret := nums[0]

    num := 1

    for i := 0; i < len(nums); i++ {
        if num == 0 {
            num = nums[i]
        } else {
            num = num * nums[i]
        }

        ret = max(ret, num)
    }

    num = 0
    for i := len(nums) - 1; i >= 0; i-- {
        if num == 0 {
            num = nums[i]
        } else {
            num = num * nums[i]
        }

        ret = max(ret, num)
    }


    return ret
}
```

### 12.最长有效括号

使用哨兵，并且哨兵可以计算位置。只有n > 1并且当前元素是')'栈顶元素是'('时候才退栈和计算，其他情况是入栈

```Go
func longestValidParentheses(s string) int {
    stack := []int{-1}

    ret := 0
    for i := 0; i < len(s); i++ {
        n := len(stack)
        if n == 1 || s[i] == '(' || s[stack[n - 1]] == ')' {
            stack = append(stack, i)
        } else {
            stack = stack[:n - 1]
            n--
            ret = max(ret, i - stack[n - 1])
        }
    }

    return ret
}
```

13.零钱兑换 & 分割等和子集

- 这两个都是可以使得，可选元素的循环放在上层，dp的循环放在里面
- 分割等和子集，dp循环要求逆序，防止重复拿元素
- 零钱兑换每次改的时候用`dp[j] = min(dp[j], dp[j-coins[i]]+1)`，+1不要忘了

```Go
func coinChange(coins []int, amount int) int {
	dp := make([]int, amount+1)
	for i := 1; i <= amount; i++ {
		dp[i] = amount + 1
	}
	for i := 0; i < len(coins); i++ {
		for j := 1; j < len(dp); j++ {
			if j >= coins[i] {
				dp[j] = min(dp[j], dp[j-coins[i]]+1)
			}
		}
	}

	if dp[amount] == amount+1 {
		return -1
	} else {
		return dp[amount]
	}
}

func canPartition(nums []int) bool {
    sum := 0
    for _, v := range nums{ 
        sum += v
    }

    if sum % 2 == 1 {
        return false
    }

    target := sum / 2

    dp := make([]bool, target + 1)
    dp[0] = true
    for i := 0; i < len(nums); i++ {
        for j := target; j >= nums[i];j-- {
            dp[j] = dp[j] || dp[j - nums[i]]
        }
    }

    return dp[target]
}
```

### 13.子数组之和

注意`m[sum]++`而不是`m[sum] = 1`

```Go
func subarraySum(nums []int, k int) int {
    m := map[int]int{}
    sum := 0
    ret := 0
    m[0] = 1
    for i := 0; i < len(nums); i++ {
        sum += nums[i]
        if v, ok := m[sum - k]; ok{
            ret += v
        }
        m[sum]++
    }

    return ret
}
```

### 14.[最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

注意应该是如果去见比ret小的时候更新，而不是大的时候更新

```Go
func minWindow(s string, t string) string {
    if len(t) > len(s) {
        return ""
    }
    sMap, tMap := map[byte]int{}, map[byte]int{}
    for i := 0; i < len(t); i++ {
        tMap[t[i]]++
    }
    l := 0
    ret := ""
    count := 0
    for r := 0; r < len(s); r++ {
        sMap[s[r]]++
        if sMap[s[r]] <= tMap[s[r]] {
            count++
        }
        for l <= r && sMap[s[l]] > tMap[s[l]] {
            sMap[s[l]]--
            l++
        }
        if count == len(t) {
            if ret == "" || r - l + 1 < len(ret) {
                ret = s[l : r + 1]
            }
        }
    }

    return ret
}
```
