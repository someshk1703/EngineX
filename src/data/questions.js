// ─── Static Interview Questions ───────────────────────────────────────────────
// DSA: coding problems with solutions
// Java: conceptual interview Q&A

// ─── DSA Coding Problems ──────────────────────────────────────────────────────
export const DSA_QUESTIONS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hash Maps',
    tags: ['array', 'hash-map'],
    description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. You may assume exactly one solution exists and you cannot use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    hints: [
      'A brute-force O(N²) nested loop works but is too slow for large inputs.',
      'Can you reduce it to one pass using a hash map?',
      'For each element, check if its complement (target − current) is already stored in the map.',
    ],
    solution: {
      approach: 'Use a hash map to store value→index as you iterate. For each element check if its complement exists. Return immediately when found.',
      code: `function twoSum(nums, target) {
  const map = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },
  {
    id: 'best-time-stocks',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Arrays & Greedy',
    tags: ['array', 'greedy', 'sliding-window'],
    description: 'You are given an array `prices` where `prices[i]` is the stock price on day `i`. Maximize your profit by choosing a single day to buy and a different later day to sell. Return the maximum profit; return 0 if none.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1), sell on day 5 (price=6). Profit = 6−1 = 5.' },
      { input: 'prices = [7,6,4,3,1]',   output: '0', explanation: 'Prices only decrease; no profitable trade exists.' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    hints: [
      'You need the minimum price seen so far and the maximum profit so far.',
      'One pass: track minPrice and update maxProfit = max(maxProfit, price − minPrice).',
    ],
    solution: {
      approach: 'Single pass. Keep a running minimum price and update the max profit whenever the current price minus the minimum exceeds the current best.',
      code: `function maxProfit(prices) {
  let minPrice = Infinity, maxProfit = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['array', 'dp', 'kadane'],
    description: 'Given an integer array `nums`, find the contiguous subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,−1,2,1] has the largest sum = 6.' },
      { input: 'nums = [5,4,-1,7,8]',             output: '23', explanation: 'The entire array sums to 23.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    hints: [
      'At each position, decide: extend the existing subarray or start a new one from here.',
      'currentSum = max(nums[i], currentSum + nums[i])',
    ],
    solution: {
      approach: "Kadane's Algorithm: maintain a running sum that resets to the current element whenever continuing would make it worse.",
      code: `function maxSubArray(nums) {
  let current = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'Strings & Two Pointers',
    tags: ['string', 'two-pointers'],
    description: 'A phrase is a palindrome if, after converting all uppercase to lowercase and removing non-alphanumeric characters, it reads the same forwards and backwards. Given string `s`, return `true` if it is a palindrome.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"',                    output: 'false', explanation: '"raceacar" is not a palindrome.' },
    ],
    constraints: ['1 ≤ s.length ≤ 2×10⁵'],
    hints: [
      'Use two pointers from both ends. Skip non-alphanumeric characters.',
      'Compare characters after lowercasing.',
    ],
    solution: {
      approach: 'Two pointers from each end, skipping non-alphanumeric characters and comparing case-insensitively.',
      code: `function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  const alnum = c => /[a-z0-9]/.test(c);
  while (l < r) {
    while (l < r && !alnum(s[l].toLowerCase())) l++;
    while (l < r && !alnum(s[r].toLowerCase())) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'longest-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    tags: ['string', 'sliding-window', 'hash-map'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest substring without repeating characters.' },
      { input: 's = "bbbbb"',    output: '1', explanation: '"b" is the answer.' },
    ],
    constraints: ['0 ≤ s.length ≤ 5×10⁴'],
    hints: [
      'Use a sliding window with a set to track characters in the current window.',
      'When a duplicate is found, shrink the window from the left until the duplicate is removed.',
    ],
    solution: {
      approach: 'Sliding window: expand right, contract left when a duplicate enters. Track characters with a Set.',
      code: `function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let l = 0, max = 0;
  for (let r = 0; r < s.length; r++) {
    while (seen.has(s[r])) { seen.delete(s[l]); l++; }
    seen.add(s[r]);
    max = Math.max(max, r - l + 1);
  }
  return max;
}`,
      complexity: { time: 'O(N)', space: 'O(min(N,M)) where M is charset size' },
    },
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    topic: 'Graphs — BFS/DFS',
    tags: ['graph', 'bfs', 'dfs', 'matrix'],
    description: 'Given an `m × n` grid of `"1"` (land) and `"0"` (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent land cells (horizontal/vertical).',
    examples: [
      {
        input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]',
        output: '2',
        explanation: 'Two separate groups of connected land cells.',
      },
    ],
    constraints: ['m, n ≥ 1', 'grid[i][j] is "0" or "1"'],
    hints: [
      'Each time you find an unvisited "1", start a BFS/DFS and mark all reachable land cells as visited.',
      'Count how many times you initiate a BFS/DFS — that is the island count.',
    ],
    solution: {
      approach: 'Iterate the grid. When an unvisited "1" is found, increment the count and flood-fill (DFS) to mark all connected land as visited.',
      code: `function numIslands(grid) {
  let count = 0;
  const dfs = (r, c) => {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  };
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === '1') { count++; dfs(r, c); }
  return count;
}`,
      complexity: { time: 'O(M×N)', space: 'O(M×N) recursion stack' },
    },
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topic: 'Intervals & Sorting',
    tags: ['array', 'sorting', 'intervals'],
    description: 'Given an array of intervals `[start, end]`, merge all overlapping intervals and return the result.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap → merge to [1,6].' },
    ],
    constraints: ['1 ≤ intervals.length ≤ 10⁴', 'intervals[i].length == 2'],
    hints: [
      'Sort intervals by start time first.',
      'Keep a result list. If the current interval overlaps with the last in result, extend it; otherwise push it.',
    ],
    solution: {
      approach: 'Sort by start. Iterate and merge with the last interval in the result whenever they overlap (cur.start ≤ last.end).',
      code: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1])
      last[1] = Math.max(last[1], intervals[i][1]);
    else
      res.push(intervals[i]);
  }
  return res;
}`,
      complexity: { time: 'O(N log N)', space: 'O(N)' },
    },
  },
  {
    id: 'binary-tree-bfs',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    topic: 'Trees — BFS',
    tags: ['tree', 'bfs', 'queue'],
    description: 'Given the root of a binary tree, return its level-order traversal as an array of arrays (values level by level, left to right).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level 0: [3], Level 1: [9,20], Level 2: [15,7].' },
    ],
    constraints: ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ Node.val ≤ 1000'],
    hints: [
      'Use a queue. Process nodes level by level using the queue size as the level boundary.',
    ],
    solution: {
      approach: 'BFS with a queue. At each level, record the queue size, process exactly that many nodes, and collect their values.',
      code: `function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['dp', 'bfs', 'memoization'],
    description: 'Given an array of coin denominations and an integer `amount`, return the fewest coins needed to make up that amount. Return -1 if it is impossible.',
    examples: [
      { input: 'coins = [1,5,11], amount = 15', output: '3', explanation: '5 + 5 + 5 = 15 (three 5s).' },
      { input: 'coins = [2], amount = 3',       output: '-1', explanation: 'Cannot make 3 with only 2s.' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ amount ≤ 10⁴'],
    hints: [
      'dp[i] = minimum coins to make amount i. Initialize dp[0] = 0, rest = Infinity.',
      'For each amount from 1 to target: try all coins and take the minimum.',
    ],
    solution: {
      approach: 'Bottom-up DP. Build up the minimum coin count for every sub-amount from 1 to the target.',
      code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const coin of coins)
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      complexity: { time: 'O(amount × coins)', space: 'O(amount)' },
    },
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule (Cycle Detection)',
    difficulty: 'Medium',
    topic: 'Graphs — Topological Sort',
    tags: ['graph', 'topological-sort', 'cycle-detection', 'dfs'],
    description: 'There are `n` courses numbered 0 to n−1. `prerequisites[i] = [a, b]` means you must take course b before a. Return true if you can finish all courses.',
    examples: [
      { input: 'n=2, prerequisites=[[1,0]]',        output: 'true',  explanation: 'Take 0 then 1.' },
      { input: 'n=2, prerequisites=[[1,0],[0,1]]',   output: 'false', explanation: 'Cycle: 0 needs 1, 1 needs 0.' },
    ],
    constraints: ['1 ≤ n ≤ 2000', '0 ≤ prerequisites.length ≤ 5000'],
    hints: [
      'Model as a directed graph. The answer is true iff the graph has no cycle.',
      'Use DFS with a "visiting" state (0=unvisited, 1=visiting, 2=done).',
    ],
    solution: {
      approach: 'DFS cycle detection. Track three states per node: unvisited, currently in stack (cycle if revisited), and fully processed.',
      code: `function canFinish(n, prerequisites) {
  const graph = Array.from({length: n}, () => []);
  for (const [a, b] of prerequisites) graph[b].push(a);
  const state = new Array(n).fill(0); // 0=unvisited,1=visiting,2=done
  const dfs = (node) => {
    if (state[node] === 1) return false; // cycle
    if (state[node] === 2) return true;  // already safe
    state[node] = 1;
    for (const nei of graph[node]) if (!dfs(nei)) return false;
    state[node] = 2;
    return true;
  };
  for (let i = 0; i < n; i++) if (!dfs(i)) return false;
  return true;
}`,
      complexity: { time: 'O(V+E)', space: 'O(V+E)' },
    },
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    tags: ['array', 'two-pointers', 'stack'],
    description: 'Given `n` non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of water are trapped.' },
    ],
    constraints: ['n ≥ 1', '0 ≤ height[i] ≤ 10⁵'],
    hints: [
      'Water trapped at position i = min(maxLeft[i], maxRight[i]) − height[i].',
      'Two-pointer approach avoids precomputing prefix/suffix arrays.',
    ],
    solution: {
      approach: 'Two pointers. Maintain left and right max. The pointer with the smaller max determines the water height — move it inward.',
      code: `function trap(height) {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l]);
      water += leftMax - height[l];
      l++;
    } else {
      rightMax = Math.max(rightMax, height[r]);
      water += rightMax - height[r];
      r--;
    }
  }
  return water;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'minimum-window',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    tags: ['string', 'sliding-window', 'hash-map'],
    description: 'Given strings `s` and `t`, return the minimum window substring of `s` that contains every character in `t` (including duplicates). Return empty string if impossible.',
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: '"BANC" is the shortest window containing A, B, C.' },
    ],
    constraints: ['1 ≤ s.length, t.length ≤ 10⁵'],
    hints: [
      'Use a frequency map for t. Expand the right pointer; when all chars are satisfied, shrink from the left.',
      'Track "formed" — the count of chars in t that are fully satisfied.',
    ],
    solution: {
      approach: 'Sliding window with two frequency maps. Expand right until all t chars are covered, then contract left to minimize the window.',
      code: `function minWindow(s, t) {
  const need = new Map(), have = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let formed = 0, required = need.size;
  let l = 0, best = [Infinity, 0, 0];
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    have.set(c, (have.get(c) || 0) + 1);
    if (need.has(c) && have.get(c) === need.get(c)) formed++;
    while (formed === required) {
      if (r - l + 1 < best[0]) best = [r - l + 1, l, r];
      const lc = s[l]; have.set(lc, have.get(lc) - 1);
      if (need.has(lc) && have.get(lc) < need.get(lc)) formed--;
      l++;
    }
  }
  return best[0] === Infinity ? '' : s.slice(best[1], best[2] + 1);
}`,
      complexity: { time: 'O(|s|+|t|)', space: 'O(|s|+|t|)' },
    },
  },

  // ── Two Pointers ──────────────────────────────────────────────────────────
  {
    id: 'move-zeroes',
    title: 'Move Zeroes',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    description: 'Given an integer array `nums`, move all `0`s to the end in-place while maintaining the relative order of the non-zero elements.',
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
      { input: 'nums = [0]', output: '[0]' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴'],
    hints: [
      'Use a slow pointer for the next write position of non-zero elements.',
      'After writing all non-zeroes, fill remaining positions with 0.',
    ],
    solution: {
      approach: 'Slow/fast two-pointer: fast scans, slow writes non-zeros. Then fill tail with 0s.',
      code: `function moveZeroes(nums) {
  let slow = 0;
  for (let fast = 0; fast < nums.length; fast++)
    if (nums[fast] !== 0) nums[slow++] = nums[fast];
  while (slow < nums.length) nums[slow++] = 0;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: '3sum',
    title: '3Sum',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    tags: ['array', 'two-pointers', 'sorting'],
    description: 'Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that i, j, k are distinct and `nums[i] + nums[j] + nums[k] == 0`.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Two unique triplets sum to zero.' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['3 ≤ nums.length ≤ 3000', '-10⁵ ≤ nums[i] ≤ 10⁵'],
    hints: [
      'Sort first, then fix one pointer i and use converging two-pointers on the rest.',
      'Skip duplicates for i, left, and right after finding a triplet.',
    ],
    solution: {
      approach: 'Sort, fix i, run two-pointer on i+1..n-1. Skip duplicates to avoid repeated triplets.',
      code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l+1]) l++;
        while (l < r && nums[r] === nums[r-1]) r--;
        l++; r--;
      } else if (sum < 0) l++;
      else r--;
    }
  }
  return res;
}`,
      complexity: { time: 'O(N²)', space: 'O(1) ignoring output' },
    },
  },

  // ── Binary Search ─────────────────────────────────────────────────────────
  {
    id: 'first-bad-version',
    title: 'First Bad Version',
    difficulty: 'Easy',
    topic: 'Binary Search',
    tags: ['binary-search'],
    description: 'You have `n` versions. Once a version goes bad all subsequent versions are bad. Given an API `isBadVersion(version)`, find the first bad version. Minimize API calls.',
    examples: [
      { input: 'n=5, bad=4', output: '4', explanation: 'Versions: [good,good,good,bad,bad]. First bad is 4.' },
    ],
    constraints: ['1 ≤ bad ≤ n ≤ 2³¹−1'],
    hints: [
      'Binary search on the range [1, n]. If mid is bad, the answer is ≤ mid. Otherwise > mid.',
    ],
    solution: {
      approach: 'Binary search: find leftmost true in [false…false, true…true].',
      code: `var solution = function(isBadVersion) {
  return function(n) {
    let lo = 1, hi = n;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (isBadVersion(mid)) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };
};`,
      complexity: { time: 'O(log N)', space: 'O(1)' },
    },
  },
  {
    id: 'search-rotated',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    topic: 'Binary Search',
    tags: ['array', 'binary-search'],
    description: 'An integer array sorted in ascending order was rotated at some pivot. Given the rotated array and a `target`, return its index or -1 if not found.',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 5000', 'All values are unique'],
    hints: [
      'At every mid, one half must be sorted. Check which half is sorted to decide where to search.',
      'If nums[left] ≤ nums[mid], the left half is sorted; otherwise the right half is.',
    ],
    solution: {
      approach: 'Binary search. Determine which half is sorted at each step and prune accordingly.',
      code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) { // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                     // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      complexity: { time: 'O(log N)', space: 'O(1)' },
    },
  },
  {
    id: 'koko-bananas',
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    topic: 'Binary Search on Answer',
    tags: ['array', 'binary-search'],
    description: 'Koko has `piles` of bananas and `h` hours. She eats at speed `k` bananas/hour (one pile per hour, leftover discarded). Find the minimum `k` to finish all piles within `h` hours.',
    examples: [
      { input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'Speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 hours.' },
    ],
    constraints: ['1 ≤ piles.length ≤ h ≤ 10⁹', '1 ≤ piles[i] ≤ 10⁹'],
    hints: [
      'Binary search on the answer: lo=1, hi=max(piles).',
      'Feasibility check: can Koko finish at speed k? Sum ceil(pile/k) for all piles ≤ h.',
    ],
    solution: {
      approach: 'Binary search on speed. Feasibility: sum of ceil(pile/k) ≤ h.',
      code: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);
    if (hours <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      complexity: { time: 'O(N log M) where M=max pile', space: 'O(1)' },
    },
  },

  // ── Prefix Sum ───────────────────────────────────────────────────────────
  {
    id: 'range-sum-query',
    title: 'Range Sum Query — Immutable',
    difficulty: 'Easy',
    topic: 'Prefix Sum',
    tags: ['array', 'prefix-sum'],
    description: 'Given an integer array `nums`, handle multiple `sumRange(left, right)` queries that return the sum of elements between indices left and right (inclusive).',
    examples: [
      { input: 'nums = [-2,0,3,-5,2,-1]; sumRange(0,2)', output: '1', explanation: '-2+0+3=1' },
      { input: 'sumRange(2,5)', output: '-1', explanation: '3+(-5)+2+(-1)=-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'Up to 10⁴ queries'],
    hints: [
      'Precompute prefix[i] = sum of nums[0..i-1]. Then sumRange(l,r) = prefix[r+1] - prefix[l].',
    ],
    solution: {
      approach: 'Build prefix sum array once (O(N)). Each query answered in O(1).',
      code: `class NumArray {
  constructor(nums) {
    this.prefix = [0];
    for (const n of nums) this.prefix.push(this.prefix.at(-1) + n);
  }
  sumRange(l, r) { return this.prefix[r+1] - this.prefix[l]; }
}`,
      complexity: { time: 'O(N) build, O(1) query', space: 'O(N)' },
    },
  },
  {
    id: 'subarray-sum-k',
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    topic: 'Prefix Sum',
    tags: ['array', 'prefix-sum', 'hash-map'],
    description: 'Given an integer array `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2', explanation: '[1,1] appears at indices 0-1 and 1-2.' },
      { input: 'nums = [1,2,3], k = 3', output: '2', explanation: '[3] and [1,2].' },
    ],
    constraints: ['1 ≤ nums.length ≤ 2×10⁴', '-1000 ≤ nums[i] ≤ 1000'],
    hints: [
      'If prefix[j] - prefix[i] = k, subarray [i+1..j] sums to k.',
      'Count how many times prefix[j]-k appears in a hash map of prefix sums seen so far.',
    ],
    solution: {
      approach: 'Running prefix sum + hash map. For each prefix sum, check if prefix-k was seen before.',
      code: `function subarraySum(nums, k) {
  const map = new Map([[0, 1]]);
  let prefix = 0, count = 0;
  for (const n of nums) {
    prefix += n;
    count += (map.get(prefix - k) || 0);
    map.set(prefix, (map.get(prefix) || 0) + 1);
  }
  return count;
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },

  // ── Sliding Window (additional) ───────────────────────────────────────────
  {
    id: 'min-size-subarray-sum',
    title: 'Minimum Size Subarray Sum',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    tags: ['array', 'sliding-window'],
    description: 'Given an array of positive integers and a positive integer `target`, return the minimal length of a contiguous subarray with sum ≥ target. Return 0 if no such subarray exists.',
    examples: [
      { input: 'target=7, nums=[2,3,1,2,4,3]', output: '2', explanation: '[4,3] has sum 7 and length 2.' },
      { input: 'target=4, nums=[1,4,4]', output: '1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '1 ≤ nums[i], target ≤ 10⁹'],
    hints: [
      'Variable-size sliding window: expand right until sum ≥ target, then shrink from left while still valid.',
    ],
    solution: {
      approach: 'Expand right pointer, then shrink left while sum ≥ target to minimize window length.',
      code: `function minSubArrayLen(target, nums) {
  let l = 0, sum = 0, min = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    while (sum >= target) {
      min = Math.min(min, r - l + 1);
      sum -= nums[l++];
    }
  }
  return min === Infinity ? 0 : min;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'permutation-in-string',
    title: 'Permutation in String',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    tags: ['string', 'sliding-window', 'hash-map'],
    description: 'Given strings `s1` and `s2`, return true if `s2` contains a permutation of `s1` (i.e., one of s1\'s permutations is a substring of s2).',
    examples: [
      { input: 's1="ab", s2="eidbaooo"', output: 'true', explanation: '"ba" is a permutation of "ab" and is in s2.' },
      { input: 's1="ab", s2="eidboaoo"', output: 'false' },
    ],
    constraints: ['1 ≤ s1.length, s2.length ≤ 10⁴'],
    hints: [
      'Fixed window of size s1.length. Slide over s2 comparing frequency counts.',
      'Use an int[26] and a "matches" counter to avoid comparing arrays each step.',
    ],
    solution: {
      approach: 'Fixed sliding window of size len(s1). Track character frequency differences.',
      code: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const cnt = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);
  for (let i = 0; i < s1.length; i++) {
    cnt[s1.charCodeAt(i) - a]++;
    cnt[s2.charCodeAt(i) - a]--;
  }
  let diff = cnt.filter(x => x !== 0).length;
  if (diff === 0) return true;
  for (let i = s1.length; i < s2.length; i++) {
    const ri = s2.charCodeAt(i) - a, li = s2.charCodeAt(i - s1.length) - a;
    if (cnt[ri] === 0) diff++;  cnt[ri]--;  if (cnt[ri] === 0) diff--;
    if (cnt[li] === 0) diff++;  cnt[li]++;  if (cnt[li] === 0) diff--;
    if (diff === 0) return true;
  }
  return false;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },

  // ── Monotonic Stack ───────────────────────────────────────────────────────
  {
    id: 'daily-temperatures',
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    topic: 'Monotonic Stack',
    tags: ['array', 'stack', 'monotonic-stack'],
    description: 'Given an array `temperatures`, return an array `answer` where `answer[i]` is the number of days you have to wait after day `i` to get a warmer temperature. If there is no future warmer day, put 0.',
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
    ],
    constraints: ['1 ≤ temperatures.length ≤ 10⁵'],
    hints: [
      'Use a stack of indices. When a warmer day is found, pop the stack and compute the wait.',
    ],
    solution: {
      approach: 'Monotonic decreasing stack of indices. Pop and calculate gap when a warmer temperature arrives.',
      code: `function dailyTemperatures(temperatures) {
  const res = new Array(temperatures.length).fill(0);
  const stack = []; // indices of unresolved days
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack.at(-1)]) {
      const idx = stack.pop();
      res[idx] = i - idx;
    }
    stack.push(i);
  }
  return res;
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },
  {
    id: 'largest-rect-histogram',
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    topic: 'Monotonic Stack',
    tags: ['array', 'stack', 'monotonic-stack'],
    description: 'Given an array of integers `heights` representing bar heights in a histogram, return the area of the largest rectangle.',
    examples: [
      { input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'The largest rectangle spans bars 5 and 6 (area = 2×5 = 10).' },
    ],
    constraints: ['1 ≤ heights.length ≤ 10⁵', '0 ≤ heights[i] ≤ 10⁴'],
    hints: [
      'For each bar, find the first shorter bar to its left and right. Area = height × (right - left - 1).',
      'Use a monotonic increasing stack. When a bar shorter than the top is found, pop and calculate.',
    ],
    solution: {
      approach: 'Monotonic increasing stack. Pop when a shorter bar arrives; width = distance between new top and current index.',
      code: `function largestRectangleArea(heights) {
  const stack = [-1];
  let max = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.at(-1) !== -1 && heights[stack.at(-1)] >= h) {
      const height = heights[stack.pop()];
      const width  = i - stack.at(-1) - 1;
      max = Math.max(max, height * width);
    }
    stack.push(i);
  }
  return max;
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },

  // ── Intervals ────────────────────────────────────────────────────────────
  {
    id: 'meeting-rooms-ii',
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    topic: 'Intervals',
    tags: ['array', 'sorting', 'intervals', 'two-pointers'],
    description: 'Given an array of meeting time intervals `[start, end]`, return the minimum number of conference rooms required.',
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: '2', explanation: 'Meeting [0,30] overlaps with both others; need 2 rooms.' },
    ],
    constraints: ['1 ≤ intervals.length ≤ 10⁴'],
    hints: [
      'Sort starts and ends independently. Use two pointers to simulate room allocation.',
      'If the next start is before the earliest end, we need a new room; otherwise reuse.',
    ],
    solution: {
      approach: 'Sort starts and ends. Two-pointer sweep: if start[i] < end[j], need new room; else free one.',
      code: `function minMeetingRooms(intervals) {
  const starts = intervals.map(i => i[0]).sort((a,b) => a-b);
  const ends   = intervals.map(i => i[1]).sort((a,b) => a-b);
  let rooms = 0, j = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[j]) rooms++;
    else j++;
  }
  return rooms;
}`,
      complexity: { time: 'O(N log N)', space: 'O(N)' },
    },
  },

  // ── Cyclic Sort ───────────────────────────────────────────────────────────
  {
    id: 'missing-number',
    title: 'Missing Number',
    difficulty: 'Easy',
    topic: 'Math / Bit Manipulation',
    tags: ['array', 'math', 'bit-manipulation'],
    description: 'Given an array `nums` containing `n` distinct numbers in range [0, n], return the only number missing from the range.',
    examples: [
      { input: 'nums = [3,0,1]', output: '2' },
      { input: 'nums = [9,6,4,2,3,5,7,0,1]', output: '8' },
    ],
    constraints: ['n == nums.length', '0 ≤ nums[i] ≤ n', 'All values distinct'],
    hints: [
      'Math: expected sum = n*(n+1)/2. Subtract actual sum.',
      'XOR: XOR all numbers 0..n with all nums. Missing number survives.',
    ],
    solution: {
      approach: 'XOR: 0^1^…^n ^ nums[0]^…^nums[n-1]. Every paired number cancels; the missing one remains.',
      code: `function missingNumber(nums) {
  let xor = nums.length;
  for (let i = 0; i < nums.length; i++) xor ^= i ^ nums[i];
  return xor;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'find-duplicate',
    title: 'Find the Duplicate Number',
    difficulty: 'Medium',
    topic: 'Two Pointers (Floyd\'s Cycle)',
    tags: ['array', 'two-pointers', 'cycle-detection'],
    description: 'Given array `nums` with `n+1` integers in range [1, n], exactly one value is repeated. Find it without modifying the array and using only O(1) extra space.',
    examples: [
      { input: 'nums = [1,3,4,2,2]', output: '2' },
      { input: 'nums = [3,1,3,4,2]', output: '3' },
    ],
    constraints: ['Values in [1,n], exactly one duplicate (may appear more than twice)'],
    hints: [
      'Treat array as a linked list: node i points to nums[i]. A duplicate creates a cycle.',
      'Floyd\'s algorithm: detect cycle, then find cycle entry.',
    ],
    solution: {
      approach: 'Floyd\'s cycle detection. Phase 1: find intersection. Phase 2: reset slow to head, advance both by 1 to find cycle start (the duplicate).',
      code: `function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'find-all-duplicates',
    title: 'Find All Duplicates in an Array',
    difficulty: 'Medium',
    topic: 'Cyclic Sort',
    tags: ['array', 'cyclic-sort'],
    description: 'Given integer array `nums` with values in [1, n] where each integer appears once or twice, return all duplicates in O(n) time and O(1) extra space.',
    examples: [
      { input: 'nums = [4,3,2,7,8,2,3,1]', output: '[2,3]' },
    ],
    constraints: ['n == nums.length', '1 ≤ nums[i] ≤ n'],
    hints: [
      'Use the index-as-visited trick: negate nums[abs(nums[i])-1]. If already negative, that index+1 is a duplicate.',
    ],
    solution: {
      approach: 'Treat index as key: for each nums[i], negate nums[abs-1]. A second visit finds a negative — add to result.',
      code: `function findDuplicates(nums) {
  const res = [];
  for (const n of nums) {
    const idx = Math.abs(n) - 1;
    if (nums[idx] < 0) res.push(idx + 1);
    else nums[idx] = -nums[idx];
  }
  return res;
}`,
      complexity: { time: 'O(N)', space: 'O(1) ignoring output' },
    },
  },

  // ── Backtracking ──────────────────────────────────────────────────────────
  {
    id: 'subsets',
    title: 'Subsets',
    difficulty: 'Medium',
    topic: 'Backtracking',
    tags: ['backtracking', 'recursion', 'bit-manipulation'],
    description: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10', 'All values unique'],
    hints: [
      'Backtrack: at each step, choose to include or exclude the current element.',
      'Use a start index to avoid re-using earlier elements (no duplicates).',
    ],
    solution: {
      approach: 'Backtracking with a start index. At each call, add the current path to results then recurse for each remaining element.',
      code: `function subsets(nums) {
  const res = [];
  const bt = (start, path) => {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      bt(i + 1, path);
      path.pop();
    }
  };
  bt(0, []);
  return res;
}`,
      complexity: { time: 'O(N × 2ᴺ)', space: 'O(N)' },
    },
  },
  {
    id: 'permutations',
    title: 'Permutations',
    difficulty: 'Medium',
    topic: 'Backtracking',
    tags: ['backtracking', 'recursion'],
    description: 'Given an array `nums` of distinct integers, return all possible permutations.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
    ],
    constraints: ['1 ≤ nums.length ≤ 6', 'All values unique'],
    hints: [
      'Use a visited array or swap-in-place approach.',
      'When path.length === nums.length, record the permutation.',
    ],
    solution: {
      approach: 'Backtracking with a boolean visited array.',
      code: `function permute(nums) {
  const res = [], used = new Array(nums.length).fill(false);
  const bt = (path) => {
    if (path.length === nums.length) { res.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;  path.push(nums[i]);
      bt(path);
      used[i] = false; path.pop();
    }
  };
  bt([]);
  return res;
}`,
      complexity: { time: 'O(N × N!)', space: 'O(N)' },
    },
  },
  {
    id: 'combination-sum',
    title: 'Combination Sum',
    difficulty: 'Medium',
    topic: 'Backtracking',
    tags: ['backtracking', 'recursion'],
    description: 'Given an array of distinct integers `candidates` and a `target`, return all unique combinations where chosen numbers sum to target. The same number may be used unlimited times.',
    examples: [
      { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' },
    ],
    constraints: ['1 ≤ candidates.length ≤ 30', '1 ≤ candidates[i] ≤ 200'],
    hints: [
      'Backtrack with a start index (reuse allowed: pass same i to next call).',
      'Prune when remaining < 0.',
    ],
    solution: {
      approach: 'Backtracking. Recurse passing the same start index to allow reuse of the same element.',
      code: `function combinationSum(candidates, target) {
  const res = [];
  const bt = (start, remain, path) => {
    if (remain === 0) { res.push([...path]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remain) continue;
      path.push(candidates[i]);
      bt(i, remain - candidates[i], path); // i (not i+1) allows reuse
      path.pop();
    }
  };
  bt(0, target, []);
  return res;
}`,
      complexity: { time: 'O(N^(T/M)) where T=target, M=min candidate', space: 'O(T/M)' },
    },
  },
  {
    id: 'letter-combinations',
    title: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    topic: 'Backtracking',
    tags: ['backtracking', 'recursion', 'string'],
    description: 'Given a string of digits 2-9, return all possible letter combinations the number could represent (like a phone keypad). Return an empty list if input is empty.',
    examples: [
      { input: '"23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
    ],
    constraints: ['0 ≤ digits.length ≤ 4', 'Each digit is in "23456789"'],
    hints: [
      'Map each digit to its letters. Backtrack digit by digit.',
    ],
    solution: {
      approach: 'Backtracking: for each digit, iterate its letters and recurse to the next digit.',
      code: `function letterCombinations(digits) {
  if (!digits.length) return [];
  const map = { '2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz' };
  const res = [];
  const bt = (i, path) => {
    if (i === digits.length) { res.push(path); return; }
    for (const c of map[digits[i]]) bt(i + 1, path + c);
  };
  bt(0, '');
  return res;
}`,
      complexity: { time: 'O(4ᴺ × N)', space: 'O(N)' },
    },
  },
  {
    id: 'n-queens',
    title: 'N-Queens',
    difficulty: 'Hard',
    topic: 'Backtracking',
    tags: ['backtracking', 'recursion'],
    description: 'Place n queens on an n×n chessboard so that no two queens attack each other. Return all distinct solutions.',
    examples: [
      { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', explanation: 'Two solutions exist for n=4.' },
    ],
    constraints: ['1 ≤ n ≤ 9'],
    hints: [
      'Place one queen per row. Track occupied columns, diagonals (row-col), and anti-diagonals (row+col).',
    ],
    solution: {
      approach: 'Row-by-row backtracking. Use three sets to track attacked columns and both diagonals.',
      code: `function solveNQueens(n) {
  const res = [], cols = new Set(), diag1 = new Set(), diag2 = new Set();
  const board = Array.from({length:n}, () => Array(n).fill('.'));
  const bt = (row) => {
    if (row === n) { res.push(board.map(r => r.join(''))); return; }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row-col) || diag2.has(row+col)) continue;
      cols.add(col); diag1.add(row-col); diag2.add(row+col);
      board[row][col] = 'Q';
      bt(row + 1);
      board[row][col] = '.';
      cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);
    }
  };
  bt(0);
  return res;
}`,
      complexity: { time: 'O(N!)', space: 'O(N²)' },
    },
  },

  // ── Dynamic Programming ───────────────────────────────────────────────────
  {
    id: 'house-robber',
    title: 'House Robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['dp', 'array'],
    description: 'Given an array of non-negative integers representing the amount of money in each house, determine the maximum amount you can rob without robbing two adjacent houses.',
    examples: [
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob houses 0, 2, 4: 2+9+1=12.' },
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob houses 0 and 2: 1+3=4.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 400'],
    hints: [
      'At each house: rob it (prev2 + current) or skip it (prev1). Take the max.',
    ],
    solution: {
      approach: 'DP with two variables (prev1, prev2). At each step, new = max(prev1, prev2 + nums[i]).',
      code: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['dp', 'binary-search', 'array'],
    description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '[2,3,7,101] is the LIS.' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
    ],
    constraints: ['1 ≤ nums.length ≤ 2500'],
    hints: [
      'O(N²) DP: dp[i] = max(dp[j]+1) for all j<i where nums[j]<nums[i].',
      'O(N log N): maintain a patience-sort tails array. Binary search to replace.',
    ],
    solution: {
      approach: 'O(N log N) patience sorting. tails[i] = smallest tail of all IS of length i+1. Binary search to update.',
      code: `function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo+hi)>>1; if (tails[mid] < n) lo=mid+1; else hi=mid; }
    tails[lo] = n;
  }
  return tails.length;
}`,
      complexity: { time: 'O(N log N)', space: 'O(N)' },
    },
  },
  {
    id: 'longest-common-subsequence',
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['dp', 'string'],
    description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. Return 0 if none exists.',
    examples: [
      { input: 'text1="abcde", text2="ace"', output: '3', explanation: '"ace" is the LCS.' },
      { input: 'text1="abc", text2="abc"', output: '3' },
    ],
    constraints: ['1 ≤ text1.length, text2.length ≤ 1000'],
    hints: [
      'dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].',
      'If text1[i-1]==text2[j-1]: dp[i][j] = dp[i-1][j-1]+1. Else: max(dp[i-1][j], dp[i][j-1]).',
    ],
    solution: {
      approach: '2D DP table. Match characters diagonally, otherwise take best from above or left.',
      code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({length:m+1}, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = text1[i-1] === text2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
      complexity: { time: 'O(M×N)', space: 'O(M×N)' },
    },
  },
  {
    id: 'partition-equal-subset',
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    topic: 'Dynamic Programming — 0/1 Knapsack',
    tags: ['dp', 'knapsack', 'array'],
    description: 'Given a non-empty integer array `nums`, return true if the array can be partitioned into two subsets with equal sum.',
    examples: [
      { input: 'nums = [1,5,11,5]', output: 'true', explanation: '[1,5,5] and [11] both sum to 11.' },
      { input: 'nums = [1,2,3,5]', output: 'false' },
    ],
    constraints: ['1 ≤ nums.length ≤ 200', '1 ≤ nums[i] ≤ 100'],
    hints: [
      'If total sum is odd, return false immediately.',
      'Find a subset with sum = total/2. Classic 0/1 knapsack.',
    ],
    solution: {
      approach: '1D DP knapsack. dp[j] = can we form sum j? Iterate nums in outer, sums in reverse inner.',
      code: `function canPartition(nums) {
  const total = nums.reduce((a,b) => a+b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums)
    for (let j = target; j >= n; j--)
      dp[j] = dp[j] || dp[j - n];
  return dp[target];
}`,
      complexity: { time: 'O(N × target)', space: 'O(target)' },
    },
  },
  {
    id: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['dp', 'string', 'two-pointers'],
    description: 'Given a string `s`, return the longest palindromic substring.',
    examples: [
      { input: 's = "babad"', output: '"bab" or "aba"' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: ['1 ≤ s.length ≤ 1000'],
    hints: [
      'Expand-around-center: for each center (char or between two chars), expand while characters match.',
    ],
    solution: {
      approach: 'Expand around center for each of 2n-1 centers. O(N²) time, O(1) space.',
      code: `function longestPalindrome(s) {
  let start = 0, maxLen = 1;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
  };
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i+1); }
  return s.slice(start, start + maxLen);
}`,
      complexity: { time: 'O(N²)', space: 'O(1)' },
    },
  },

  // ── Greedy ────────────────────────────────────────────────────────────────
  {
    id: 'jump-game',
    title: 'Jump Game',
    difficulty: 'Medium',
    topic: 'Greedy',
    tags: ['array', 'greedy'],
    description: 'Given integer array `nums` where `nums[i]` is your maximum jump length at position i, return true if you can reach the last index.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Position 3 is always reached with 0 jump ability.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '0 ≤ nums[i] ≤ 10⁵'],
    hints: [
      'Track maxReach = farthest index reachable so far. If i ever exceeds maxReach, return false.',
    ],
    solution: {
      approach: 'Greedy: track the farthest reachable index. If current index exceeds it, we\'re stuck.',
      code: `function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'jump-game-ii',
    title: 'Jump Game II',
    difficulty: 'Medium',
    topic: 'Greedy',
    tags: ['array', 'greedy', 'bfs'],
    description: 'Given integer array `nums`, return the minimum number of jumps to reach the last index. You can always reach the last index.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'Jump 1: index 0→1. Jump 2: index 1→4.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴'],
    hints: [
      'Think BFS levels. Each level is the farthest you can reach with k jumps.',
      'Use currentEnd (end of current level) and farthest (max reach from this level).',
    ],
    solution: {
      approach: 'Greedy BFS levels: increment jumps when i hits currentEnd; update currentEnd to farthest.',
      code: `function jump(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) { jumps++; currentEnd = farthest; }
  }
  return jumps;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'non-overlapping-intervals',
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    topic: 'Greedy',
    tags: ['array', 'greedy', 'intervals', 'sorting'],
    description: 'Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.',
    examples: [
      { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: 'Remove [1,3] → rest are non-overlapping.' },
      { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2' },
    ],
    constraints: ['1 ≤ intervals.length ≤ 10⁵'],
    hints: [
      'Sort by end time. Greedily keep intervals with the earliest end (activity selection problem).',
      'If intervals[i][0] < end of last kept interval, remove it (increment count).',
    ],
    solution: {
      approach: 'Sort by end. Keep earliest-ending intervals greedily. Count removals.',
      code: `function eraseOverlapIntervals(intervals) {
  intervals.sort((a,b) => a[1] - b[1]);
  let count = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s < end) count++;     // overlaps — remove this one
    else end = e;             // keep it, update end
  }
  return count;
}`,
      complexity: { time: 'O(N log N)', space: 'O(1)' },
    },
  },
  {
    id: 'gas-station',
    title: 'Gas Station',
    difficulty: 'Medium',
    topic: 'Greedy',
    tags: ['array', 'greedy'],
    description: 'There are `n` gas stations in a circle. `gas[i]` is the fuel at station i, `cost[i]` is fuel needed to travel to station i+1. Find the starting station index to complete the full circuit, or return -1.',
    examples: [
      { input: 'gas=[1,2,3,4,5], cost=[3,4,5,1,2]', output: '3', explanation: 'Start at index 3 and complete the circuit.' },
    ],
    constraints: ['n == gas.length == cost.length'],
    hints: [
      'If total gas ≥ total cost, a solution always exists.',
      'Track running surplus. When it goes negative, reset start to i+1.',
    ],
    solution: {
      approach: 'Greedy: if running sum goes negative, restart from next station. Total ≥ 0 guarantees a solution exists.',
      code: `function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank  += diff;
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total < 0 ? -1 : start;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'partition-labels',
    title: 'Partition Labels',
    difficulty: 'Medium',
    topic: 'Greedy',
    tags: ['string', 'greedy', 'two-pointers'],
    description: 'Given a string `s`, partition it into as many parts as possible so that each letter appears in at most one part. Return the sizes of each part.',
    examples: [
      { input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', explanation: '"ababcbaca","defegde","hijhklij" are the three parts.' },
    ],
    constraints: ['1 ≤ s.length ≤ 500'],
    hints: [
      'First pass: record last occurrence of each character.',
      'Second pass: extend current partition end to max(end, lastOccurrence[s[i]]). Cut when i === end.',
    ],
    solution: {
      approach: 'Precompute last occurrence. Greedy scan: keep extending partition end until i reaches it.',
      code: `function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const res = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) { res.push(end - start + 1); start = i + 1; }
  }
  return res;
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },

  // ── Bit Manipulation ──────────────────────────────────────────────────────
  {
    id: 'single-number',
    title: 'Single Number',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    tags: ['array', 'bit-manipulation', 'xor'],
    description: 'Given a non-empty integer array where every element appears twice except for one, find that single one. O(N) time, O(1) space.',
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
    ],
    constraints: ['1 ≤ nums.length ≤ 3×10⁴', 'All pairs except one'],
    hints: ['XOR of a number with itself is 0. XOR all elements — paired ones cancel out.'],
    solution: {
      approach: 'XOR all numbers. Duplicate pairs cancel (a^a=0), leaving the single number.',
      code: `function singleNumber(nums) {
  return nums.reduce((xor, n) => xor ^ n, 0);
}`,
      complexity: { time: 'O(N)', space: 'O(1)' },
    },
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits (Hamming Weight)',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    tags: ['bit-manipulation'],
    description: 'Write a function that returns the number of set bits (1s) in the binary representation of a 32-bit unsigned integer.',
    examples: [
      { input: 'n = 11 (binary: 00000000000000000000000000001011)', output: '3' },
      { input: 'n = 128 (binary: 10000000)', output: '1' },
    ],
    constraints: ['0 ≤ n ≤ 2³²−1'],
    hints: ['n & (n-1) clears the lowest set bit. Count how many times you can do this before n=0.'],
    solution: {
      approach: 'Brian Kernighan trick: n & (n-1) removes the lowest set bit. Count iterations.',
      code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) { n = n & (n - 1); count++; }
  return count;
}`,
      complexity: { time: 'O(k) where k = number of set bits', space: 'O(1)' },
    },
  },
  {
    id: 'sum-two-integers',
    title: 'Sum of Two Integers (No + or -)',
    difficulty: 'Medium',
    topic: 'Bit Manipulation',
    tags: ['bit-manipulation', 'math'],
    description: 'Given two integers `a` and `b`, return their sum without using `+` or `-` operators.',
    examples: [
      { input: 'a=1, b=2', output: '3' },
      { input: 'a=2, b=3', output: '5' },
    ],
    constraints: ['-1000 ≤ a, b ≤ 1000'],
    hints: [
      'XOR gives sum without carry. AND << 1 gives the carry.',
      'Repeat until there is no carry.',
    ],
    solution: {
      approach: 'Add = XOR (no carry). Carry = AND shifted left. Repeat until carry=0. Mask to 32 bits for negative numbers.',
      code: `function getSum(a, b) {
  const MASK = 0xFFFFFFFF, MAX = 0x7FFFFFFF;
  while (b !== 0) {
    const carry = (a & b) << 1;
    a = (a ^ b) & MASK;
    b = carry & MASK;
  }
  return a > MAX ? ~(a ^ MASK) : a; // handle negative
}`,
      complexity: { time: 'O(1) — at most 32 iterations', space: 'O(1)' },
    },
  },

  // ── Trees ─────────────────────────────────────────────────────────────────
  {
    id: 'max-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    topic: 'Trees — DFS',
    tags: ['tree', 'dfs', 'recursion'],
    description: 'Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to a leaf).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: ['0 ≤ nodes ≤ 10⁴'],
    hints: ['DFS: depth = 1 + max(depth(left), depth(right)). Base case: null → 0.'],
    solution: {
      approach: 'Recursive DFS. Return 0 for null, else 1 + max of children depths.',
      code: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      complexity: { time: 'O(N)', space: 'O(H) where H=height' },
    },
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    topic: 'Trees — DFS',
    tags: ['tree', 'dfs', 'recursion'],
    description: 'Given the root of a binary tree, invert the tree and return its root.',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    ],
    constraints: ['0 ≤ nodes ≤ 100'],
    hints: ['Recursively swap left and right children at every node.'],
    solution: {
      approach: 'DFS: swap left/right, then recurse into both children.',
      code: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}`,
      complexity: { time: 'O(N)', space: 'O(H)' },
    },
  },
  {
    id: 'lowest-common-ancestor',
    title: 'Lowest Common Ancestor of Binary Tree',
    difficulty: 'Medium',
    topic: 'Trees — DFS',
    tags: ['tree', 'dfs', 'recursion'],
    description: 'Given a binary tree and two nodes p and q, return their lowest common ancestor (the deepest node that has both p and q as descendants, where a node can be a descendant of itself).',
    examples: [
      { input: 'root=[3,5,1,6,2,0,8], p=5, q=1', output: '3', explanation: 'LCA of 5 and 1 is 3.' },
      { input: 'root=[3,5,1,6,2,0,8], p=5, q=4', output: '5', explanation: '5 is an ancestor of 4.' },
    ],
    constraints: ['2 ≤ nodes ≤ 10⁵', 'All node values unique'],
    hints: [
      'If root is p or q, return root.',
      'Recurse left and right. If both return non-null, root is the LCA.',
    ],
    solution: {
      approach: 'Bottom-up DFS. Return non-null when p or q found. LCA = node where both sides return non-null.',
      code: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left  = lowestCommonAncestor(root.left,  p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}`,
      complexity: { time: 'O(N)', space: 'O(H)' },
    },
  },
  {
    id: 'right-side-view',
    title: 'Binary Tree Right Side View',
    difficulty: 'Medium',
    topic: 'Trees — BFS',
    tags: ['tree', 'bfs', 'queue'],
    description: 'Given the root of a binary tree, return the values of nodes visible when the tree is viewed from the right side (one value per level, the rightmost at each level).',
    examples: [
      { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' },
    ],
    constraints: ['0 ≤ nodes ≤ 100'],
    hints: ['BFS level-order. At each level, add the last node\'s value to the result.'],
    solution: {
      approach: 'BFS: process each level, record the last node value seen.',
      code: `function rightSideView(root) {
  if (!root) return [];
  const res = [], queue = [root];
  while (queue.length) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (i === size - 1) res.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return res;
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },
  {
    id: 'serialize-deserialize-bt',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    topic: 'Trees — DFS',
    tags: ['tree', 'dfs', 'design'],
    description: 'Design an algorithm to serialize a binary tree to a string and deserialize the string back to the tree. There is no restriction on the format.',
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: 'Serialized then deserialized tree is identical.' },
    ],
    constraints: ['0 ≤ nodes ≤ 10⁴'],
    hints: [
      'Preorder DFS with null markers encodes the tree structure uniquely.',
      'Deserialize by consuming tokens from a queue.',
    ],
    solution: {
      approach: 'Preorder serialization with "#" for null. Deserialize by recursively consuming a queue.',
      code: `function serialize(root) {
  const res = [];
  const dfs = node => {
    if (!node) { res.push('#'); return; }
    res.push(node.val);
    dfs(node.left); dfs(node.right);
  };
  dfs(root);
  return res.join(',');
}
function deserialize(data) {
  const q = data.split(',');
  let i = 0;
  const dfs = () => {
    if (q[i] === '#') { i++; return null; }
    const node = new TreeNode(+q[i++]);
    node.left  = dfs();
    node.right = dfs();
    return node;
  };
  return dfs();
}`,
      complexity: { time: 'O(N)', space: 'O(N)' },
    },
  },

  // ── Graphs (Advanced) ─────────────────────────────────────────────────────
  {
    id: 'rotting-oranges',
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    topic: 'Graphs — Multi-source BFS',
    tags: ['graph', 'bfs', 'matrix'],
    description: 'A grid contains 0 (empty), 1 (fresh orange), or 2 (rotten orange). Each minute, fresh oranges adjacent (4-directionally) to a rotten one become rotten. Return the minimum minutes to rot all fresh oranges, or -1 if impossible.',
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
      { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explanation: 'Bottom-left is unreachable.' },
    ],
    constraints: ['1 ≤ m,n ≤ 10'],
    hints: [
      'Multi-source BFS: start with all rotten oranges in the queue simultaneously.',
      'Count fresh oranges; BFS minute by minute until queue empty, then check if fresh = 0.',
    ],
    solution: {
      approach: 'Multi-source BFS from all initial rotten cells. Track fresh count; return minutes or -1.',
      code: `function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  const queue = [];
  let fresh = 0;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      if (grid[r][c] === 1) fresh++;
    }
  let minutes = 0;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (queue.length && fresh > 0) {
    minutes++;
    for (let size = queue.length; size > 0; size--) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr<0||nr>=m||nc<0||nc>=n||grid[nr][nc]!==1) continue;
        grid[nr][nc] = 2; fresh--; queue.push([nr, nc]);
      }
    }
  }
  return fresh === 0 ? minutes : -1;
}`,
      complexity: { time: 'O(M×N)', space: 'O(M×N)' },
    },
  },
  {
    id: 'course-schedule-ii',
    title: 'Course Schedule II',
    difficulty: 'Medium',
    topic: 'Graphs — Topological Sort',
    tags: ['graph', 'topological-sort', 'bfs'],
    description: 'Given `n` courses and prerequisite pairs, return a valid order to take all courses. If impossible (cycle exists), return an empty array.',
    examples: [
      { input: 'n=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]', output: '[0,2,1,3] or [0,1,2,3]' },
    ],
    constraints: ['1 ≤ n ≤ 2000', '0 ≤ prerequisites.length ≤ 5000'],
    hints: [
      'Kahn\'s algorithm (BFS Topological Sort): track in-degrees. Start with 0-in-degree nodes.',
    ],
    solution: {
      approach: 'Kahn\'s BFS. Enqueue nodes with in-degree 0. When processing, decrement neighbors\' in-degrees. If all nodes processed → valid order.',
      code: `function findOrder(n, prerequisites) {
  const graph = Array.from({length:n}, () => []);
  const inDeg = new Array(n).fill(0);
  for (const [a, b] of prerequisites) { graph[b].push(a); inDeg[a]++; }
  const queue = [];
  for (let i = 0; i < n; i++) if (inDeg[i] === 0) queue.push(i);
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const nei of graph[node]) if (--inDeg[nei] === 0) queue.push(nei);
  }
  return order.length === n ? order : [];
}`,
      complexity: { time: 'O(V+E)', space: 'O(V+E)' },
    },
  },
  {
    id: 'network-delay-time',
    title: 'Network Delay Time',
    difficulty: 'Medium',
    topic: 'Graphs — Dijkstra',
    tags: ['graph', 'dijkstra', 'shortest-path'],
    description: 'Given a network of `n` nodes and directed edges `[u, v, w]` (travel time), and a source `k`, return the minimum time for all nodes to receive a signal. Return -1 if some node is unreachable.',
    examples: [
      { input: 'times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2', output: '2' },
    ],
    constraints: ['1 ≤ k ≤ n ≤ 100', '1 ≤ times.length ≤ 6000'],
    hints: [
      'Single-source shortest paths from k. Use Dijkstra with a min-heap.',
      'Answer = max of all shortest distances. Return -1 if any node unreachable.',
    ],
    solution: {
      approach: 'Dijkstra from k. Min-heap of [dist, node]. Relax edges. Return max dist if all visited.',
      code: `function networkDelayTime(times, n, k) {
  const graph = Array.from({length:n+1}, () => []);
  for (const [u,v,w] of times) graph[u].push([v,w]);
  const dist = new Array(n+1).fill(Infinity);
  dist[k] = 0;
  const heap = [[0, k]]; // min-heap simulation
  while (heap.length) {
    heap.sort((a,b) => a[0]-b[0]);
    const [d, u] = heap.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u])
      if (dist[u]+w < dist[v]) { dist[v]=dist[u]+w; heap.push([dist[v],v]); }
  }
  const max = Math.max(...dist.slice(1));
  return max === Infinity ? -1 : max;
}`,
      complexity: { time: 'O((V+E) log V)', space: 'O(V+E)' },
    },
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    id: 'implement-trie',
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    topic: 'Design — Trie',
    tags: ['trie', 'design', 'string'],
    description: 'Implement a Trie with `insert(word)`, `search(word)`, and `startsWith(prefix)` methods.',
    examples: [
      { input: 'insert("apple"); search("apple")', output: 'true' },
      { input: 'search("app")', output: 'false' },
      { input: 'startsWith("app")', output: 'true' },
    ],
    constraints: ['1 ≤ word.length ≤ 2000', 'All lowercase letters'],
    hints: [
      'Each node has children[26] and an isEnd flag.',
      'insert: traverse/create nodes char by char and mark isEnd at last char.',
    ],
    solution: {
      approach: 'Trie node with children map and isEnd flag. Traverse character by character.',
      code: `class Trie {
  constructor() { this.root = {}; }
  insert(word) {
    let node = this.root;
    for (const c of word) node = (node[c] ??= {});
    node.$ = true;
  }
  search(word) {
    let node = this.root;
    for (const c of word) { if (!node[c]) return false; node = node[c]; }
    return !!node.$;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const c of prefix) { if (!node[c]) return false; node = node[c]; }
    return true;
  }
}`,
      complexity: { time: 'O(L) per operation where L=word length', space: 'O(N×L) total' },
    },
  },
  {
    id: 'find-median-stream',
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    topic: 'Design — Heaps',
    tags: ['heap', 'design', 'two-heaps'],
    description: 'Design a data structure that supports `addNum(num)` and `findMedian()`. The median is the middle value (or average of two middle values for even count).',
    examples: [
      { input: 'addNum(1); addNum(2); findMedian()', output: '1.5' },
      { input: 'addNum(3); findMedian()', output: '2.0' },
    ],
    constraints: ['-10⁵ ≤ num ≤ 10⁵', 'At least one element when findMedian() called'],
    hints: [
      'Maintain two heaps: a max-heap for the lower half, a min-heap for the upper half.',
      'Keep sizes balanced (differ by at most 1).',
    ],
    solution: {
      approach: 'Max-heap (lower half) + min-heap (upper half). Re-balance after each insertion.',
      code: `// JavaScript: simulate with sorted array for clarity
class MedianFinder {
  constructor() { this.data = []; }
  addNum(num) {
    // Binary insertion to keep sorted
    let lo = 0, hi = this.data.length;
    while (lo < hi) { const mid=(lo+hi)>>1; if(this.data[mid]<num) lo=mid+1; else hi=mid; }
    this.data.splice(lo, 0, num);
  }
  findMedian() {
    const n = this.data.length;
    return n%2===1 ? this.data[n>>1] : (this.data[n/2-1]+this.data[n/2])/2;
  }
}
// Note: O(log N) add via two-heap in production (use a heap library)`,
      complexity: { time: 'O(log N) add, O(1) median (two-heap)', space: 'O(N)' },
    },
  },
]

// ─── System Design Interview Problems ─────────────────────────────────────────
export const SD_QUESTIONS = [
  {
    id: 'sd-url-shortener',
    title: 'URL Shortener',
    difficulty: 'Medium',
    category: 'Storage & Encoding',
    tags: ['hashing', 'caching', 'sql'],
    description: 'Design a URL shortening service like bit.ly. Users paste a long URL and get a short alias (e.g. bit.ly/xK9z2). Redirects must be fast globally.',
    requirements: {
      functional: [
        'POST /shorten → returns short URL',
        'GET /{code} → redirects to original URL',
        'Optional: custom aliases, expiration, analytics',
      ],
      nonFunctional: [
        '100M URLs created/day, 10B redirects/day (100:1 read:write ratio)',
        'Redirect latency < 10ms (p99)',
        '99.99% availability',
      ],
    },
    keyComponents: [
      'Base62 encoding of a Snowflake/counter ID (7 chars = 62⁷ ≈ 3.5T URLs)',
      'Write path: API → ID generator → DB (SQL with shortcode index)',
      'Read path: API → Redis cache → DB (cache-aside pattern)',
      '301 (permanent) vs 302 (temporary) redirect — use 302 for analytics',
      'CDN at edge caches popular redirects',
    ],
    hints: [
      'ID generation: auto-increment DB (single point) vs Snowflake ID vs hash + collision retry.',
      'Cache stampede on viral URLs — use Redis SET NX with a short lock TTL.',
      'Sharding: shard by shortcode hash mod N to distribute DB writes.',
    ],
    interviewFramework: 'Clarify → Estimate (QPS, storage) → API → High-level diagram → Deep dives: encoding, caching, expiry',
  },
  {
    id: 'sd-twitter-feed',
    title: 'Twitter / X Feed',
    difficulty: 'Hard',
    category: 'Social Media & Feeds',
    tags: ['fan-out', 'news-feed', 'caching', 'kafka'],
    description: 'Design the Twitter home timeline. Users follow others; when they open the app they see a ranked feed of recent tweets from people they follow.',
    requirements: {
      functional: [
        'Post a tweet (text, images, video)',
        'View home timeline (latest N tweets from followees)',
        'Follow / unfollow users',
        'Like, retweet, reply',
      ],
      nonFunctional: [
        '300M DAU, 500M tweets/day',
        'Read-heavy: timeline reads >> tweet writes',
        'Eventual consistency acceptable for feed',
      ],
    },
    keyComponents: [
      'Fan-out on write: on tweet, push to all followers\' feed caches (fast reads, slow writes)',
      'Fan-out on read: compute timeline on demand (slow reads, no write overhead)',
      'Hybrid: fan-out on write for normal users, fan-out on read for celebrities (>1M followers)',
      'Tweet store: Cassandra or DynamoDB (tweet_id → content, media_url)',
      'Timeline cache: Redis sorted set per user (score = timestamp)',
      'Kafka for async fan-out workers',
    ],
    hints: [
      'Celebrity problem: Lady Gaga has 100M followers — writing 100M fan-out entries per tweet is too slow.',
      'Inactive users: skip fan-out for users who haven\'t logged in for 30 days.',
      'Ranking: inject ML-ranked tweets at read time on top of the chronological cache.',
    ],
    interviewFramework: 'Clarify scope → Estimate → Data model (User, Tweet, Follow) → Feed generation strategy → Celebrity handling → Ranking',
  },
  {
    id: 'sd-whatsapp',
    title: 'WhatsApp / Chat System',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['websocket', 'message-queue', 'encryption', 'presence'],
    description: 'Design a real-time messaging system for 1-on-1 and group chats, with message persistence, delivery receipts, and online presence.',
    requirements: {
      functional: [
        'Send/receive 1-on-1 and group messages',
        'Message delivery receipts (sent, delivered, read)',
        'Online/offline presence indicator',
        'Media sharing (images, videos)',
      ],
      nonFunctional: [
        '50B messages/day, 2B users',
        'Low latency delivery (<100ms)',
        'Messages durable even if recipient is offline',
      ],
    },
    keyComponents: [
      'WebSocket persistent connections per user (via Chat Server)',
      'Message store: Cassandra (message_id as TimeUUID, partition by conversation_id)',
      'Offline delivery: messages queued in DB; push on reconnect',
      'Presence service: Redis with heartbeat TTL (expired = offline)',
      'E2E encryption: keys stored on device, server sees ciphertext only',
      'Media: chunked upload to S3, URL embedded in message payload',
    ],
    hints: [
      'Group messages: fan-out to each member\'s mailbox OR store once and each client pulls.',
      'Message ID ordering: use client-generated timestamp + server sequence to handle clock skew.',
      'Zookeeper / service registry to route user\'s WebSocket connection to correct Chat Server.',
    ],
    interviewFramework: 'Clarify (1:1 vs group, E2E, media) → Estimate → WebSocket architecture → Storage schema → Delivery guarantees → Presence',
  },
  {
    id: 'sd-youtube',
    title: 'YouTube / Video Streaming',
    difficulty: 'Hard',
    category: 'Media & Streaming',
    tags: ['cdn', 'transcoding', 'streaming', 'storage'],
    description: 'Design a video streaming platform where users can upload and watch videos. Support adaptive bitrate streaming and global content delivery.',
    requirements: {
      functional: [
        'Upload video (up to 10GB)',
        'Watch video with adaptive quality',
        'Search videos, view metadata',
        'Comments, likes, subscriptions',
      ],
      nonFunctional: [
        '500 hours of video uploaded per minute',
        '1B+ daily views',
        'Global users, <2s start time',
      ],
    },
    keyComponents: [
      'Upload: chunked multipart upload directly to S3 (bypass API servers)',
      'Transcoding pipeline: S3 event → Kafka → transcoding workers (FFmpeg) → multiple resolutions (360p/720p/1080p/4K)',
      'Adaptive Bitrate (ABR): HLS or DASH — player switches quality based on bandwidth',
      'CDN: video served from edge nodes closest to viewer; origin is S3',
      'Metadata DB: PostgreSQL for video info; Elasticsearch for search',
      'Recommendation: collaborative filtering + watch history',
    ],
    hints: [
      'Transcoding is CPU-intensive: use a job queue and auto-scaling workers.',
      'Pre-warm CDN for viral content by pushing to edge nodes before traffic spike.',
      'Comments at scale: cassandra partitioned by video_id with cursor pagination.',
    ],
    interviewFramework: 'Clarify → Upload pipeline → Transcoding → CDN serving → Metadata & Search → Recommendations',
  },
  {
    id: 'sd-uber',
    title: 'Uber / Ride Matching',
    difficulty: 'Hard',
    category: 'Location & Real-time',
    tags: ['geospatial', 'real-time', 'matching', 'websocket'],
    description: 'Design a ride-sharing platform where riders request rides and are matched with nearby drivers in real time.',
    requirements: {
      functional: [
        'Driver app: broadcast GPS location every 4s',
        'Rider app: request ride, view nearby drivers',
        'Match rider with nearest available driver',
        'Track ride in real-time, show ETA',
      ],
      nonFunctional: [
        '20M drivers, 20M trips/day',
        'Location update latency < 1s',
        'Match within 3-5 seconds',
      ],
    },
    keyComponents: [
      'Location store: Redis Geo (Geohash under the hood) for O(log N) radius queries',
      'Driver location: drivers POST /location every 4s → Redis GEOADD',
      'Matching: on ride request, GEORADIUS → rank by distance + ETA → send offer via WebSocket',
      'Trip state machine: REQUESTED → MATCHED → IN_PROGRESS → COMPLETED',
      'Surge pricing: supply/demand ratio per geohash cell triggers price multiplier',
      'ETA: pre-computed routes from mapping provider, updated with live traffic',
    ],
    hints: [
      'Geohash boundary problem: a driver just outside a cell won\'t appear in a cell-based query → also query 8 neighbors.',
      'Stale location: if driver hasn\'t sent update in >10s, mark as unavailable.',
      'Use separate read/write paths for location — high write throughput from all drivers.',
    ],
    interviewFramework: 'Clarify → Location ingestion → Geospatial indexing → Matching algorithm → Real-time tracking → Surge pricing',
  },
  {
    id: 'sd-google-search',
    title: 'Google Search',
    difficulty: 'Hard',
    category: 'Search & Indexing',
    tags: ['crawler', 'inverted-index', 'pagerank', 'ranking'],
    description: 'Design a web search engine that crawls the web, indexes pages, and returns relevant results for a query in <200ms at 100K QPS.',
    requirements: {
      functional: [
        'Web crawler to discover and fetch pages',
        'Index pages for full-text search',
        'Rank results by relevance',
        'Return top-10 results for a query',
      ],
      nonFunctional: [
        '100K QPS, <200ms p99',
        'Crawl billions of pages, refresh frequently',
      ],
    },
    keyComponents: [
      'Crawler: URL frontier (priority queue) → fetcher → parser → link extractor → politeness (robots.txt, rate limit)',
      'Indexer: document store → tokenizer → inverted index (term → [docId, positions, TF])',
      'PageRank: iterative vote passing — more/quality inbound links = higher rank',
      'Ranking: TF-IDF × PageRank × freshness × user signals (CTR)',
      'Serving: query parsing → index lookup → top-K merge → re-rank → return',
      'Sharding: index partitioned by document ID (range) across machines',
    ],
    hints: [
      'Inverted index lookup is fast (O(1) per term) — bottleneck is merging thousands of hit lists.',
      'Cache top 1% of queries (covers 99% of traffic) in Redis.',
      'Freshness: prioritize recrawl of high-PageRank pages and detected content changes.',
    ],
    interviewFramework: 'Clarify scope → Crawler architecture → Index pipeline → Ranking signals → Serving layer → Scale & freshness',
  },
  {
    id: 'sd-netflix',
    title: 'Netflix',
    difficulty: 'Hard',
    category: 'Media & Streaming',
    tags: ['cdn', 'recommendation', 'microservices', 'ab-testing'],
    description: 'Design a video streaming platform with a personalized recommendation system, adaptive streaming, and global CDN delivery.',
    requirements: {
      functional: [
        'Browse catalog, search titles',
        'Stream video in adaptive quality',
        'Personalized home page recommendations',
        'Continue watching, ratings, reviews',
      ],
      nonFunctional: [
        '220M subscribers, 200M+ hours/day streamed',
        'Global, low latency playback',
      ],
    },
    keyComponents: [
      'Netflix Open Connect CDN: ISP-embedded appliances cache popular titles at the edge',
      'Recommendation: two-stage pipeline — (1) candidate generation (collaborative filter + watch history), (2) ranking (DNN on 100s of signals)',
      'Streaming: pre-encoded in 20+ bitrate/resolution variants per title, served via DASH/HLS',
      'Personalised thumbnails: ML picks artwork variant most likely to drive a click per user',
      'A/B testing infrastructure: every feature flag is an experiment',
      'Microservices: 1000+ services, API gateway routes to correct service',
    ],
    hints: [
      'Pre-positioning: predictive push of likely-to-watch content to nearby CDN nodes during off-peak.',
      'Chaos engineering (Chaos Monkey): randomly kill services to prove resilience.',
      'Billing: idempotent payment retry with exponential backoff.',
    ],
    interviewFramework: 'Clarify → CDN architecture → Encoding pipeline → Recommendation system → Personalization → A/B testing',
  },
  {
    id: 'sd-payment-system',
    title: 'Payment System',
    difficulty: 'Hard',
    category: 'Fintech',
    tags: ['idempotency', 'exactly-once', 'ledger', 'transactions'],
    description: 'Design a payment processing system that handles money transfers reliably — exactly once, with no double-charges and full audit trail.',
    requirements: {
      functional: [
        'Initiate payment (amount, currency, from, to)',
        'Check payment status',
        'Refund / reversal',
        'Audit log of all transactions',
      ],
      nonFunctional: [
        'Exactly-once: no double charges',
        '99.999% availability',
        'Full audit trail (regulatory requirement)',
        'Consistent — no partial states',
      ],
    },
    keyComponents: [
      'Idempotency key: client generates UUID per payment; server deduplicates on this key',
      'Two-phase commit or Saga pattern for distributed transactions',
      'Ledger DB: append-only, double-entry bookkeeping (debit + credit always balance)',
      'Payment gateway integration: async webhook for confirmation',
      'Exactly-once delivery: dedup table + idempotent upserts',
      'Reconciliation job: nightly compare internal ledger vs gateway statements',
    ],
    hints: [
      'Gateway timeout edge case: payment may have succeeded at gateway but response lost — must query gateway status before retrying.',
      'Double-spend prevention: DB-level unique constraint on idempotency key.',
      'Use Kafka with transactional producer for at-least-once → dedup to exactly-once.',
    ],
    interviewFramework: 'Clarify (scale, international) → Idempotency → Saga vs 2PC → Ledger design → Failure modes → Reconciliation',
  },
  {
    id: 'sd-notification-system',
    title: 'Notification System',
    difficulty: 'Medium',
    category: 'Messaging',
    tags: ['push', 'fan-out', 'kafka', 'priority-queue'],
    description: 'Design a multi-channel notification service (push, SMS, email) that can send 10M+ notifications per day with delivery guarantees.',
    requirements: {
      functional: [
        'Send push notification, SMS, email',
        'Support bulk sends (marketing) and real-time triggers (alerts)',
        'User preferences and opt-out',
        'Delivery receipts',
      ],
      nonFunctional: [
        '10M notifications/day',
        'Critical alerts < 1s, marketing emails < 5min',
        'At-least-once delivery',
      ],
    },
    keyComponents: [
      'API layer: accept notification events from services',
      'Fan-out service: enqueue per-channel jobs (push → APNs/FCM, SMS → Twilio, email → SendGrid)',
      'Kafka topics by priority: critical / standard / bulk — consumed at different rates',
      'User preference store: Redis cache of per-user channel opt-ins',
      'Third-party provider abstraction: retry with exponential backoff on provider errors',
      'Deduplication: Redis set with 24h TTL to prevent sending same notification twice',
    ],
    hints: [
      'Rate limit per user: don\'t spam — max N push notifications per hour per user.',
      'Separate Kafka topics by priority so bulk email doesn\'t delay critical alerts.',
      'Delivery tracking: callback webhooks from providers update a status table.',
    ],
    interviewFramework: 'Clarify channels & scale → Fan-out design → Priority queues → Provider integration → Dedup & rate limiting → Delivery tracking',
  },
  {
    id: 'sd-rate-limiter',
    title: 'Rate Limiter',
    difficulty: 'Medium',
    category: 'Infrastructure',
    tags: ['redis', 'token-bucket', 'sliding-window', 'distributed'],
    description: 'Design a distributed rate limiter that limits each user to N requests per second/minute, working correctly across multiple API server instances.',
    requirements: {
      functional: [
        'Limit requests per user/IP/API key',
        'Configurable rules (10 req/s per user, 1000 req/min per IP)',
        'Return 429 with Retry-After header when exceeded',
      ],
      nonFunctional: [
        'Works across distributed API servers (not per-node)',
        'Microsecond overhead per request',
        'Highly available — limiter failure should not block traffic',
      ],
    },
    keyComponents: [
      'Token Bucket (Redis): INCR key with TTL — allows burst; Token Bucket with DECR for smoother control',
      'Sliding Window Log: store timestamps of last N requests per key in Redis sorted set',
      'Sliding Window Counter: approximate sliding window using two fixed-window counters (current + previous × overlap fraction)',
      'Centralised Redis: all API servers share same counters — correct but single point of failure',
      'Redis Cluster + local cache: check local cache first (may allow slight overage), sync to Redis',
      'Middleware: rate limit check runs as API gateway layer before routing',
    ],
    hints: [
      'Local-only rate limiter is wrong: user routed to different servers evades the limit.',
      'Redis MULTI/EXEC (transaction) or Lua script ensures atomic check-and-increment.',
      'Fail open vs fail closed: if Redis is down, allow requests (fail open) to avoid blocking all traffic.',
    ],
    interviewFramework: 'Clarify granularity → Algorithm choice (token bucket vs sliding window) → Redis implementation → Distributed consistency → Failure modes',
  },
  {
    id: 'sd-distributed-kv-store',
    title: 'Distributed Key-Value Store',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['consistent-hashing', 'replication', 'quorum', 'cap-theorem'],
    description: 'Design a distributed key-value store (like DynamoDB or Cassandra) that can handle millions of operations per second with high availability and horizontal scalability.',
    requirements: {
      functional: [
        'get(key) → value',
        'put(key, value)',
        'delete(key)',
        'Configurable consistency level',
      ],
      nonFunctional: [
        'High availability (AP system — tolerate network partitions)',
        'Horizontal scaling by adding nodes',
        'Low latency reads/writes',
      ],
    },
    keyComponents: [
      'Consistent hashing: keys distributed across nodes via virtual nodes (vnodes); adding/removing a node reshuffles only 1/N keys',
      'Replication: each key replicated to N successor nodes on the hash ring',
      'Quorum reads/writes: R + W > N guarantees overlap; tune for consistency vs availability',
      'Gossip protocol: nodes share membership and state without central coordinator',
      'Vector clocks: detect conflicting writes (concurrent updates to same key)',
      'Hinted handoff: if a node is down, temporary node holds writes and forwards on recovery',
      'Anti-entropy with Merkle trees: periodic sync to repair replicas',
    ],
    hints: [
      'CAP theorem: pick AP (high availability + partition tolerance) → eventual consistency.',
      'Sloppy quorum: write to any N available nodes, not necessarily the "correct" N — faster but weaker consistency.',
      'Conflict resolution: last-write-wins (LWW) by timestamp, or client-side merge for vectors.',
    ],
    interviewFramework: 'Clarify consistency needs → Consistent hashing → Replication → Quorum → Failure handling → Anti-entropy → CAP trade-offs',
  },
  {
    id: 'sd-typeahead',
    title: 'Typeahead / Autocomplete',
    difficulty: 'Medium',
    category: 'Search & Indexing',
    tags: ['trie', 'caching', 'top-k', 'distributed'],
    description: 'Design the autocomplete feature for a search box (like Google\'s suggestion dropdown) that returns the top 5 completions for a prefix in <50ms.',
    requirements: {
      functional: [
        'Return top-5 suggestions for any prefix',
        'Suggestions ranked by query frequency',
        'Update suggestions as trending queries change (within ~1 day)',
      ],
      nonFunctional: [
        '100K QPS on suggestions',
        '<50ms p99 latency',
        'Support 5 billion distinct search queries',
      ],
    },
    keyComponents: [
      'Trie (prefix tree): each node stores top-K suggestions for that prefix; O(L) lookup where L = prefix length',
      'Top-K at each node: precomputed during offline Trie build; stored as sorted list',
      'Data pipeline: log search queries → Hadoop/Spark aggregation → compute frequencies → rebuild Trie',
      'Distributed Trie: prefix space split across shards (e.g., a-m on shard 1, n-z on shard 2)',
      'Caching: top 10K most-queried prefixes cached in Redis at CDN edge',
      'Trending: separate real-time path for viral queries using sliding window counters',
    ],
    hints: [
      'Trie won\'t fit in one machine for 5B queries — shard by first 1-2 characters of prefix.',
      'Prefix ranges for shards must be balanced by query frequency, not alphabetically.',
      'Browser caches previous suggestions — use HTTP cache headers (stale-while-revalidate).',
    ],
    interviewFramework: 'Clarify (how many suggestions, how fresh) → Trie design → Top-K storage → Data pipeline → Sharding → Caching',
  },
]

// ─── Java Interview Questions (Conceptual Q&A) ────────────────────────────────
export const JAVA_QUESTIONS = [
  {
    id: 'java-jvm-memory',
    title: 'Explain the JVM Memory Model',
    difficulty: 'Medium',
    topic: 'JVM Internals',
    tags: ['jvm','heap','stack','gc'],
    question: 'Describe the Java memory areas: heap, stack, metaspace, and the PC register. What is garbage collected?',
    answer: `The JVM divides memory into several regions:

**Heap** — Shared among all threads. All object instances and arrays live here. Divided into Young Generation (Eden + Survivor spaces) and Old Generation (Tenured). This is what the GC primarily manages.

**Stack** — Per-thread. Holds stack frames (local variables, operand stack, return address). Created/destroyed with each method call. Primitive variables and object references (not the objects themselves) are stored here.

**Metaspace** (Java 8+, replaced PermGen) — Stores class metadata (method bytecode, constant pool). Grows dynamically in native memory.

**Program Counter (PC) Register** — Per-thread. Holds the address of the currently executing instruction.

**Native Method Stack** — Supports native (JNI) method execution.

Garbage collection happens in the Heap (and Metaspace for unloaded classes). The GC uses generational collection: most short-lived objects die in the Young Gen (minor GC), while surviving objects are promoted to Old Gen (major/full GC).`,
    keyPoints: [
      'Objects are on the heap; references/primitives are on the stack',
      'Young Gen → Old Gen promotion via survivor spaces',
      'Metaspace uses native memory and is not bounded by -Xmx',
      'GC roots: local vars, static fields, JNI references',
    ],
    codeExample: `// Object on heap, reference on stack
String s = new String("hello"); // 's' is a stack reference
                                 // "hello" object is on heap

// -Xms, -Xmx control heap size
// -XX:MetaspaceSize controls initial metaspace`,
  },
  {
    id: 'java-final',
    title: 'final vs finally vs finalize',
    difficulty: 'Easy',
    topic: 'Core Java',
    tags: ['keyword','gc','exception'],
    question: 'What is the difference between the final keyword, the finally block, and the finalize() method?',
    answer: `Three unrelated concepts that share a name prefix:

**final** — A keyword with three uses:
- *final variable*: value cannot be reassigned (must be initialized once)
- *final method*: cannot be overridden by subclasses
- *final class*: cannot be subclassed (e.g., String, Integer)

**finally** — A block in try/catch/finally. Code inside **always executes** after the try block completes, whether or not an exception was thrown. Used for resource cleanup (before try-with-resources existed).

**finalize()** — Deprecated method defined in Object. The GC called it before collecting an object, giving it a chance to clean up. It was unreliable (no guaranteed timing, could be skipped), so it was deprecated in Java 9 and removed in Java 18. Use AutoCloseable/try-with-resources instead.`,
    keyPoints: [
      'final ≠ immutable for objects — the reference is fixed but the object state can change',
      'finally runs even if try has a return statement',
      'finalize() is deprecated; never use it for resource cleanup',
    ],
    codeExample: `final int x = 10;
// x = 20; // compile error

try {
  riskyOperation();
} catch (IOException e) {
  handle(e);
} finally {
  cleanup(); // always runs
}`,
  },
  {
    id: 'java-hashmap',
    title: 'How does HashMap work internally?',
    difficulty: 'Hard',
    topic: 'Collections',
    tags: ['collections','hash-map','hashing','java8'],
    question: 'Describe the internal structure of HashMap. How does it handle collisions? What changed in Java 8?',
    answer: `**Structure**: A HashMap is backed by an array of buckets (Node[]). The bucket index is computed as:
\`index = (n-1) & hash(key)\`
where n is the array capacity (default 16).

**Collision handling**: Multiple keys mapping to the same bucket form a linked list (chaining). Before Java 8, it was always a linked list.

**Java 8 improvement**: When a bucket's linked list exceeds **TREEIFY_THRESHOLD = 8** entries (and the table has ≥ 64 buckets), it converts to a Red-Black Tree, making worst-case lookup O(log N) instead of O(N).

**Resize/rehash**: When size > capacity × loadFactor (default 0.75), the table doubles in capacity and all entries are rehashed.

**Key contract**: If two objects are equal (equals() returns true), they MUST have the same hashCode(). Violation breaks HashMap completely.`,
    keyPoints: [
      'Default capacity: 16, load factor: 0.75',
      'Hash function: XOR high/low 16 bits of hashCode for better distribution',
      'Java 8: linked list → Red-Black Tree at 8 collisions',
      'TreeMap guarantees sorted keys; HashMap has no ordering',
    ],
    codeExample: `// Always override both if you override either
@Override
public boolean equals(Object o) { ... }
@Override
public int hashCode() { ... }

// LinkedHashMap preserves insertion order
// TreeMap sorts by key (natural or Comparator)
Map<String,Integer> map = new LinkedHashMap<>();`,
  },
  {
    id: 'java-arraylist-linkedlist',
    title: 'ArrayList vs LinkedList',
    difficulty: 'Easy',
    topic: 'Collections',
    tags: ['collections','list','array-list','linked-list'],
    question: 'When would you choose LinkedList over ArrayList? What are the performance characteristics of each?',
    answer: `**ArrayList** — Backed by a resizable array.
- Random access: O(1) (direct index)
- Add to end: amortized O(1); resize copies the array
- Insert/delete in middle: O(N) — shifts elements
- Better cache locality (contiguous memory)

**LinkedList** — Doubly-linked list; also implements Deque.
- Random access: O(N) — traversal required
- Add/remove at head or tail: O(1)
- Insert/delete in middle: O(N) to find, O(1) to link
- More memory per element (stores two pointers + data)

**In practice**: ArrayList is almost always preferred because modern CPUs excel at cache-friendly sequential access. LinkedList shines only when you have frequent insertions/deletions at the ends (use it as a Deque) and never access by index.`,
    keyPoints: [
      'ArrayList: O(1) get/set, O(N) insert/delete in middle',
      'LinkedList: O(N) get, O(1) add/remove at ends',
      'Prefer ArrayList for most use cases; LinkedList for queue/deque behavior',
      'ArrayDeque is faster than LinkedList for queue operations',
    ],
    codeExample: `List<String> al = new ArrayList<>();  // general purpose
Deque<String> dq = new ArrayDeque<>(); // prefer over LinkedList as queue`,
  },
  {
    id: 'java-comparable-comparator',
    title: 'Comparable vs Comparator',
    difficulty: 'Easy',
    topic: 'Core Java',
    tags: ['sorting','comparable','comparator','generics'],
    question: 'What is the difference between Comparable and Comparator? When would you use each?',
    answer: `**Comparable<T>** — The class itself implements the interface and defines its **natural ordering** via \`compareTo(T o)\`. Single fixed ordering. Used by \`Collections.sort()\` and \`TreeMap/TreeSet\` by default.

**Comparator<T>** — An external strategy object defining a custom ordering via \`compare(T o1, T o2)\`. Multiple orderings possible; no modification of the original class needed.

Use **Comparable** when there is one obvious natural order (e.g., Integer, String, LocalDate).
Use **Comparator** when: you need multiple orderings, you don't own the class, or you want lambda-based ad hoc sorting.

Both return negative/zero/positive (like strcmp in C).`,
    keyPoints: [
      'compareTo: negative if this < other, 0 if equal, positive if this > other',
      'Java 8+: Comparator.comparing(), thenComparing(), reversed()',
      'Comparator can be composed: sort by age, then name',
    ],
    codeExample: `// Comparable — in the class
class Employee implements Comparable<Employee> {
  public int compareTo(Employee o) { return this.name.compareTo(o.name); }
}

// Comparator — external, Java 8 style
list.sort(Comparator.comparing(Employee::getSalary)
                    .thenComparing(Employee::getName));`,
  },
  {
    id: 'java-synchronized-volatile',
    title: 'synchronized vs volatile',
    difficulty: 'Medium',
    topic: 'Concurrency',
    tags: ['concurrency','threads','volatile','synchronized'],
    question: 'When would you use volatile instead of synchronized? What guarantees does each provide?',
    answer: `**volatile** — Guarantees **visibility** only. A volatile variable write is immediately visible to all threads; no CPU caching. Does NOT guarantee atomicity. Suitable for a single flag or state variable that is written by one thread and read by many.

**synchronized** — Guarantees both **visibility** AND **atomicity** (mutual exclusion). Only one thread can hold the monitor at a time. Suitable for compound operations (check-then-act, read-modify-write).

Key distinction: \`i++\` (read, increment, write = 3 ops) on a volatile int is NOT safe. Use AtomicInteger or synchronized.

**Modern preference**: Use java.util.concurrent classes (AtomicInteger, ReentrantLock, ConcurrentHashMap) which are higher-level and often more performant.`,
    keyPoints: [
      'volatile: visibility guarantee only (no atomicity)',
      'synchronized: visibility + atomicity + happens-before relationship',
      'volatile for flags/state; synchronized for compound operations',
      'Prefer AtomicXxx and java.util.concurrent over low-level sync',
    ],
    codeExample: `// Safe — one writer, many readers, no compound op
volatile boolean running = true;

// UNSAFE with volatile — read-modify-write is not atomic
volatile int count = 0;
count++; // not atomic!

// Safe — use AtomicInteger
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();`,
  },
  {
    id: 'java-abstract-interface',
    title: 'Abstract Class vs Interface',
    difficulty: 'Easy',
    topic: 'OOP',
    tags: ['oop','abstract','interface','java8'],
    question: 'What are the key differences between an abstract class and an interface in Java 8+?',
    answer: `**Abstract Class**:
- Can have state (instance fields) and constructors
- Can have concrete, abstract, and final methods
- Single inheritance (a class can extend only one abstract class)
- Use when classes share code + state and have an "is-a" relationship

**Interface** (Java 8+):
- No instance state (only constants — public static final)
- All methods public by default; can have default and static methods (Java 8), private methods (Java 9)
- Multiple implementation — a class can implement many interfaces
- Use to define a contract / capability (Comparable, Runnable, Serializable)

**Rule of thumb**: Prefer interfaces for defining contracts. Use abstract classes when you need to share code/state among closely related classes.

In Java 8+, with default methods, interfaces are almost as powerful as abstract classes, but cannot hold state.`,
    keyPoints: [
      'Interface: no state, multiple implementation, pure contract',
      'Abstract class: state + partial implementation, single inheritance',
      'Java 8 default methods blur the line but interfaces still cannot have constructors or instance fields',
    ],
    codeExample: `interface Flyable { void fly(); default void glide() { System.out.println("gliding"); } }
abstract class Animal { String name; abstract void speak(); }
class Duck extends Animal implements Flyable { ... }`,
  },
  {
    id: 'java-streams',
    title: 'Java 8 Streams — How They Work',
    difficulty: 'Medium',
    topic: 'Functional Java',
    tags: ['streams','java8','functional','lambda'],
    question: 'Explain the Java Stream API. What is lazy evaluation? How does it differ from a collection?',
    answer: `A Stream is a sequence of elements supporting sequential and parallel aggregate operations. Key properties:

**Not a data structure** — A stream carries data from a source (collection, array, I/O) but doesn't store it.

**Lazy evaluation** — Intermediate operations (filter, map, sorted) are not executed until a terminal operation (collect, forEach, reduce) is invoked. This allows fusing and short-circuiting optimizations.

**Pipeline**: Source → [Intermediate ops]* → Terminal op
- Intermediate: filter, map, flatMap, distinct, sorted, limit, peek
- Terminal: collect, forEach, reduce, count, findFirst, anyMatch

**Single use** — A stream can only be consumed once. Reuse the source to create a new stream.

**Parallel streams** — stream.parallel() uses ForkJoinPool. Beneficial for CPU-bound, independent operations on large datasets. Avoid for I/O or stateful ops.`,
    keyPoints: [
      'Lazy: operations only run on terminal call',
      'filter + map + findFirst can short-circuit — not all elements processed',
      'Collectors.groupingBy, toMap, joining are commonly tested',
      'Avoid side effects in stream lambdas',
    ],
    codeExample: `List<String> names = employees.stream()
  .filter(e -> e.getSalary() > 50_000)   // intermediate
  .map(Employee::getName)                 // intermediate
  .sorted()                               // intermediate
  .collect(Collectors.toList());          // terminal — execution starts HERE

// GroupBy example
Map<String, List<Employee>> byDept = employees.stream()
  .collect(Collectors.groupingBy(Employee::getDepartment));`,
  },
  {
    id: 'java-exceptions',
    title: 'Checked vs Unchecked Exceptions',
    difficulty: 'Easy',
    topic: 'Exception Handling',
    tags: ['exceptions','checked','unchecked','error'],
    question: 'What is the difference between checked and unchecked exceptions? When should you use each?',
    answer: `**Checked exceptions** (extends Exception, not RuntimeException):
- Compiler forces callers to handle or declare them (throws)
- Represent recoverable conditions the caller should reasonably handle
- Examples: IOException, SQLException, ClassNotFoundException

**Unchecked exceptions** (extends RuntimeException or Error):
- No compile-time requirement to catch/declare
- Represent programming errors (bugs) or unrecoverable conditions
- Examples: NullPointerException, ArrayIndexOutOfBoundsException, IllegalArgumentException

**Error** — JVM-level failures; do not catch (StackOverflowError, OutOfMemoryError)

**Modern best practice**: Prefer unchecked exceptions. Checked exceptions pollute APIs, encourage empty catch blocks, and are controversial. Many frameworks (Spring, Hibernate) wrap checked exceptions in unchecked ones. Use checked only when the caller can realistically recover.`,
    keyPoints: [
      'Checked: compiler enforced, recoverable, client must handle',
      'Unchecked: programming errors, no enforcement',
      'Never swallow exceptions with empty catch blocks',
      'Always log or rethrow; never silently ignore',
    ],
    codeExample: `// Checked — must handle or declare
try { Files.readAllBytes(path); } catch (IOException e) { ... }

// Unchecked — caller's contract violation
public void setAge(int age) {
  if (age < 0) throw new IllegalArgumentException("age < 0: " + age);
}`,
  },
  {
    id: 'java-equals-hashcode',
    title: 'equals() and hashCode() Contract',
    difficulty: 'Medium',
    topic: 'Core Java',
    tags: ['equals','hashcode','contract','collections'],
    question: 'Explain the equals/hashCode contract and what happens if you break it.',
    answer: `The contract (from the Java spec):
1. If \`a.equals(b)\` is true → \`a.hashCode() == b.hashCode()\` MUST be true
2. If \`a.hashCode() == b.hashCode()\` → a.equals(b) may or may not be true (collision is OK)
3. equals() must be: reflexive, symmetric, transitive, consistent, and null-safe

**Consequence of breaking it**: If you override equals() without hashCode(), equal objects may land in different HashMap buckets, so HashMap.get() and HashSet.contains() fail to find them even though equals() returns true. Leads to memory leaks and duplicates in collections.

**Best practice**: Always override both or neither. Use Objects.equals() and Objects.hash() to avoid null-pointer bugs. IDEs and Lombok (@EqualsAndHashCode) can generate them.`,
    keyPoints: [
      'equals() → same hashCode() (mandatory)',
      'same hashCode() → equals() not guaranteed (collisions OK)',
      'Overriding only equals() breaks HashMap/HashSet lookups',
      'Use Objects.hash(field1, field2, ...) for multi-field hashCode',
    ],
    codeExample: `@Override
public boolean equals(Object o) {
  if (this == o) return true;
  if (!(o instanceof Point p)) return false;
  return x == p.x && y == p.y;
}
@Override
public int hashCode() { return Objects.hash(x, y); }`,
  },
  {
    id: 'java-string-pool',
    title: 'String Pool and Immutability',
    difficulty: 'Easy',
    topic: 'Core Java',
    tags: ['string','immutability','intern','heap'],
    question: 'Why is String immutable in Java? Explain the String Pool.',
    answer: `**Immutability reasons**:
1. **Security** — String is used for class names, file paths, network URLs. Mutability would allow modification after security checks.
2. **Thread safety** — Immutable objects are inherently thread-safe; no synchronization needed.
3. **Caching/String Pool** — Because strings can't change, they can be safely shared (interned).
4. **HashMap keys** — Hash code is computed once and cached, enabling safe use as map keys.

**String Pool** (part of Heap in Java 8+):
- String literals (e.g., "hello") are automatically interned — only one object per unique value is stored.
- \`new String("hello")\` explicitly creates a new heap object outside the pool.
- \`String.intern()\` moves a string into the pool (or returns the existing one).

\`"a" == "a"\` → true (same pool reference)
\`new String("a") == new String("a")\` → false (different heap objects)`,
    keyPoints: [
      'String is final (cannot be subclassed)',
      'char[] value is private and never exposed',
      'Literal strings are auto-interned in the pool',
      'Use equals() for String comparison, never ==',
    ],
    codeExample: `String a = "hello";           // pool
String b = "hello";           // same pool object
String c = new String("hello"); // new heap object

System.out.println(a == b);       // true
System.out.println(a == c);       // false
System.out.println(a.equals(c));  // true`,
  },
  {
    id: 'java-singleton',
    title: 'Thread-Safe Singleton Patterns',
    difficulty: 'Medium',
    topic: 'Design Patterns',
    tags: ['singleton','thread-safe','lazy-init','enum'],
    question: 'How do you implement a thread-safe Singleton in Java? What are the tradeoffs of each approach?',
    answer: `Several approaches, best to worst:

**1. Enum Singleton (Best)** — JVM guarantees single instance, serialization-safe, reflection-safe.

**2. Initialization-on-Demand Holder (Lazy + Thread-safe)** — Uses class loading guarantees; no synchronization overhead; lazy initialization.

**3. Double-Checked Locking** — Requires volatile on the field (Java 5+). Two synchronization checks to reduce overhead after initialization.

**4. Synchronized method** — Simple but synchronizes every call — high overhead.

**5. Eager initialization** — Thread-safe by JVM class loading, but instantiated even if never used.`,
    keyPoints: [
      'Enum singleton is the recommended approach (Effective Java, Item 3)',
      'Holder pattern: best for lazy init without explicit synchronization',
      'DCL requires volatile or the JVM may publish a partially-constructed object',
      'Singletons are hard to test (prefer dependency injection)',
    ],
    codeExample: `// Best: Enum
public enum Singleton { INSTANCE; public void doWork() {} }

// Lazy + thread-safe: Holder pattern
public class Singleton {
  private Singleton() {}
  private static class Holder { static final Singleton INSTANCE = new Singleton(); }
  public static Singleton getInstance() { return Holder.INSTANCE; }
}

// Double-checked locking (requires volatile)
public class Singleton {
  private static volatile Singleton instance;
  public static Singleton getInstance() {
    if (instance == null)
      synchronized (Singleton.class) {
        if (instance == null) instance = new Singleton();
      }
    return instance;
  }
}`,
  },
]

// Questions grouped per category id (used by CategoryView / LibraryView)
export const QUESTIONS_MAP = { DSA: DSA_QUESTIONS, Java: JAVA_QUESTIONS }

