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
