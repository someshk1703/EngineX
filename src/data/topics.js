export const CATEGORIES = [
  { id: "DSA", name: "Data Structures & Algorithms", icon: "󱃔" },
  { id: "System Design", name: "System Design & Architecture", icon: "󱗿" },
  { id: "Full Stack", name: "Full Stack Development", icon: "󰜎" },
  { id: "Cloud & DevOps", name: "Cloud & DevOps", icon: "󰅟" },
  { id: "Databases", name: "Databases & Storage Systems", icon: "󰆼" },
  { id: "Security", name: "Security & Cryptography", icon: "󰦃" },
  { id: "CS Fundamentals", name: "CS Fundamentals", icon: "󰓙" },
  { id: "Soft Skills", name: "Soft Skills & Leadership", icon: "󰭹" }
];

export const CHAPTERS = [
  // 1. DSA
  {
    id: "dsa-arrays",
    title: "Arrays, Sliding Window & Two Pointers",
    category: "DSA",
    complexity: "Medium", // 8 questions
    tags: ["arrays", "sliding-window", "two-pointers", "prefix-sum"],
    description: "Master sub-array optimization, pointer manipulation, and linear time algorithms for array questions.",
    fallbackContent: `# Arrays, Sliding Window & Two Pointers

## Introduction
Arrays are contiguous memory structures that offer $O(1)$ random access. In technical interviews, simple array iterations often lead to inefficient $O(N^2)$ or $O(N^3)$ solutions. To optimize space and time complexity, we employ advanced patterns: **Two Pointers**, **Sliding Window**, and **Prefix Sums**.

## Core Concepts

### 1. Two Pointers
The Two Pointers technique uses two indices that traverse the array in a coordinated fashion, typically from opposite ends (converging) or at different speeds (slow/fast).
- **Use Case**: Searching for pairs in a sorted array, partitioning arrays, reversing arrays in-place.
- **Complexity**: Redeems nested loops ($O(N^2)$) to a single pass ($O(N)$).

### 2. Sliding Window
Sliding Window maintains a subset of contiguous elements. As the "window" slides across the array, elements enter from the right (expansion) and leave from the left (contraction).
- **Use Case**: Finding the longest/shortest subarray satisfying a specific constraint (e.g., longest substring without repeating characters).
- **Complexity**: $O(N)$ time as each element is visited at most twice.

### 3. Prefix Sum
Prefix Sum precomputes cumulative sums of arrays to allow $O(1)$ range sum queries.
- **Formula**: \`P[i] = P[i-1] + A[i]\`
- **Use Case**: Efficient subarray sum evaluations.

---

## How It Works: Sliding Window Algorithm
A template for finding the **longest subarray** with a condition:
1. Initialize \`left = 0\`, \`maxLength = 0\`, and a state tracker (hash map, set, or counter).
2. Iterate \`right\` from \`0\` to \`n - 1\`:
   - Add \`A[right]\` to your state tracker.
   - While the state violates the condition:
     - Shrink the window: remove \`A[left]\` from state, increment \`left\`.
   - Update \`maxLength = max(maxLength, right - left + 1)\`.
3. Return \`maxLength\`.

---

## Code Example: Longest Substring Without Repeating Characters (JS)
\`\`\`javascript
function lengthOfLongestSubstring(s) {
  let charSet = new Set();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    // If character already exists, shrink window from left
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }
    charSet.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}
// Time Complexity: O(N)
// Space Complexity: O(min(M, N)) where M is character set size
\`\`\`

---

## Common Interview Questions
1. **Two Sum II (Input array is sorted)**: Solve in $O(N)$ time and $O(1)$ space using converging pointers.
2. **Container With Most Water**: Find two lines that together with the x-axis forms a container, such that the container contains the most water.
3. **Minimum Size Subarray Sum**: Use dynamic sliding window to find the smallest contiguous subarray with sum $\\ge k$.

## Key Takeaways
- If you see a brute-force $O(N^2)$ solution on arrays, check if sorting allows a **Two Pointers** approach.
- For contiguous subarray problems, think **Sliding Window**.
- Use **Prefix Sum** to convert range queries from $O(N)$ to $O(1)$.`,
    fallbackQuiz: [
      {
        question: "When is the sliding window technique preferred over a simple nested-loop approach?",
        options: [
          "When we need to find non-contiguous elements in a tree structure.",
          "When we need to optimize search for continuous subarrays or substrings from O(N²) to O(N).",
          "When the input array is unsorted and we need to sort it in-place.",
          "When we require O(1) space and time complexity for binary search."
        ],
        correct_index: 1,
        explanation: "Sliding window is specifically used for contiguous subarrays or substrings to process elements in linear O(N) time, avoiding nested loops."
      },
      {
        question: "For a sorted array of integers, how do you find two numbers that sum up to a target value in O(N) time and O(1) space?",
        options: [
          "Using two nested loops, checking all pairs.",
          "Using a hash map to store visited elements.",
          "Using two pointers converging from start and end.",
          "Using binary search on every element in the array."
        ],
        correct_index: 2,
        explanation: "With a sorted array, converging two pointers from start and end allows finding the pair in O(N) time and O(1) space. A hash map requires O(N) space."
      },
      {
        question: "What is the space complexity of the Prefix Sum array technique for an input array of size N?",
        options: [
          "O(1)",
          "O(log N)",
          "O(N)",
          "O(N²)"
        ],
        correct_index: 2,
        explanation: "Creating a prefix sum array requires O(N) additional space to store cumulative sums, although it can sometimes be done in-place if modifying the input is allowed."
      },
      {
        question: "In the sliding window template, what triggers the contraction of the window (incrementing 'left')?",
        options: [
          "When the right pointer reaches the end of the array.",
          "When the current window state violates the problem's constraints.",
          "When the size of the window matches the target value exactly.",
          "When a duplicate character is found, regardless of the condition."
        ],
        correct_index: 1,
        explanation: "The left pointer is incremented to shrink the window as long as the current window violates the given constraints (e.g., sum is too large, too many duplicates)."
      },
      {
        question: "Which of the following is NOT an advantage of Two Pointers?",
        options: [
          "Reduces time complexity from quadratic to linear.",
          "Operates in-place (O(1) auxiliary space) in most arrays.",
          "Can be used to detect cycles in linked lists (fast/slow pointers).",
          "It guarantees O(log N) operations on unsorted data."
        ],
        correct_index: 3,
        explanation: "Two pointers cannot perform binary-search style O(log N) searches on unsorted data. Unsorted data requires sorting or linear traversal."
      },
      {
        question: "What is the typical time complexity of the slow/fast pointer (Tortoise and Hare) cycle detection algorithm?",
        options: [
          "O(1)",
          "O(N)",
          "O(N log N)",
          "O(N²)"
        ],
        correct_index: 1,
        explanation: "The slow and fast pointers traverse the list, meeting in O(N) time if a cycle is present, where N is the number of nodes in the linked list."
      },
      {
        question: "What is the sum of elements from index i to j (inclusive) using a prefix sum array P, where P[k] represents sum from A[0] to A[k]?",
        options: [
          "P[j] - P[i]",
          "P[j] - P[i-1] (for i > 0)",
          "P[j] + P[i]",
          "P[j] / P[i-1]"
        ],
        correct_index: 1,
        explanation: "To get the sum of subarray A[i..j], you subtract the sum before index i from the sum up to index j: P[j] - P[i-1] (if i > 0, else just P[j])."
      },
      {
        question: "Which data structure is most commonly combined with sliding window to solve 'longest substring with at most K distinct characters'?",
        options: [
          "Stack",
          "Hash Map (or frequency map)",
          "Binary Search Tree",
          "Queue"
        ],
        correct_index: 1,
        explanation: "A Hash Map is used to track the counts of unique characters inside the current window, letting us know when the unique character count exceeds K."
      }
    ]
  },
  {
    id: "dsa-trees",
    title: "Trees & Binary Search Trees",
    category: "DSA",
    complexity: "Medium",
    tags: ["trees", "binary-search-tree", "dfs", "bfs", "recursion"],
    description: "Understand tree traversals (pre/in/post-order, level-order), tree properties, and balancing techniques.",
    fallbackContent: `# Trees & Binary Search Trees

## Introduction
Trees are hierarchical, non-linear data structures consisting of nodes connected by edges. The most common tree variant in interviews is the **Binary Tree** (where each node has at most 2 children) and the **Binary Search Tree (BST)**, which enforces a sorting property.

---

## Core Concepts

### 1. Binary Tree Traversals
- **Pre-Order (Root -> Left -> Right)**: Used to clone trees or evaluate prefix expressions.
- **In-Order (Left -> Root -> Right)**: Traverses a BST in **sorted ascending order**.
- **Post-Order (Left -> Right -> Root)**: Used for bottom-up calculations (e.g., finding the height/diameter of a tree).
- **Level-Order (BFS)**: Explores nodes level by level using a queue.

### 2. Binary Search Tree (BST) Property
For any node:
- All values in the left subtree are **less than** the node's value.
- All values in the right subtree are **greater than** the node's value.
- **Time Complexity**: $O(\\log N)$ average for search, insert, and delete. $O(N)$ worst-case (skewed trees).

---

## Code Example: BST Insert and Search (JS)
\`\`\`javascript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Search value in BST
function searchBST(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val);
}

// Insert value in BST
function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) {
    root.left = insertIntoBST(root.left, val);
  } else {
    root.right = insertIntoBST(root.right, val);
  }
  return root;
}
\`\`\`

---

## DFS vs BFS
- **DFS (Depth-First Search)**: Explores deep paths using call stack recursion. Lower memory footprint in wide trees.
- **BFS (Breadth-First Search)**: Explores immediate neighbors first using a queue. Guarantees finding the shortest path in unweighted structures.

---

## Common Interview Questions
1. **Validate Binary Search Tree**: Check if a tree is a valid BST (requires passing a min/max boundary constraint downward).
2. **Lowest Common Ancestor (LCA)**: Find the lowest common ancestor node of two given nodes.
3. **Binary Tree Maximum Path Sum**: Find the maximum path sum between any two nodes.`,
    fallbackQuiz: [
      {
        question: "Which traversal of a Binary Search Tree (BST) visits nodes in sorted ascending order?",
        options: [
          "Pre-order Traversal",
          "In-order Traversal",
          "Post-order Traversal",
          "Level-order Traversal"
        ],
        correct_index: 1,
        explanation: "In-order traversal visits Left, Root, then Right. Because of the BST property (Left < Root < Right), this traversal prints node values in sorted ascending order."
      },
      {
        question: "What is the worst-case time complexity of looking up an element in a Binary Search Tree of size N?",
        options: [
          "O(1)",
          "O(log N)",
          "O(N)",
          "O(N log N)"
        ],
        correct_index: 2,
        explanation: "In the worst case (a skewed tree, resembling a linked list), the search operation takes O(N) time. In a balanced BST, it takes O(log N)."
      },
      {
        question: "Which data structure is typically used to implement Level-Order traversal (BFS) of a tree?",
        options: [
          "Stack",
          "Queue",
          "Min-Heap",
          "Graph"
        ],
        correct_index: 1,
        explanation: "A Queue (First-In, First-Out) is used for BFS/Level-order traversal to process nodes level by level."
      },
      {
        question: "What does the post-order traversal (Left, Right, Root) excel at in tree algorithms?",
        options: [
          "Printing nodes in lexicographical order.",
          "Evaluating binary search constraints from top-down.",
          "Bottom-up calculations where child node values are required to compute parent node properties.",
          "Finding the shortest path in a weighted grid."
        ],
        correct_index: 2,
        explanation: "Post-order traverses child subtrees before visiting the parent, making it ideal for bottom-up calculations like tree height, diameter, and subtree value check."
      },
      {
        question: "How do you validate a BST correctly in code?",
        options: [
          "Ensure each node's left child is smaller and right child is larger than the node.",
          "Pass min and max boundaries down during DFS, checking if each node value falls strictly within (min, max).",
          "Check if the height of the left subtree equals the height of the right subtree.",
          "Run a BFS traversal and ensure the queue values increase."
        ],
        correct_index: 1,
        explanation: "Checking only child nodes is insufficient because a left child's right child could violate parent boundaries. You must pass boundary limits downward: left paths limit the max value, right paths limit the min value."
      },
      {
        question: "What is the primary difference between a Binary Tree and a Binary Search Tree?",
        options: [
          "Binary Trees can have three children, BSTs can only have two.",
          "BSTs enforce a strict ordering property on elements (Left < Root < Right), whereas Binary Trees have no ordering rules.",
          "Binary Trees are stored in contiguous memory, BSTs are dynamic.",
          "BSTs require AVL balancing, Binary Trees are self-balancing."
        ],
        correct_index: 1,
        explanation: "A Binary Search Tree is a binary tree that has the specific ordering property where all nodes in a node's left subtree are smaller than it, and all nodes in its right subtree are larger."
      },
      {
        question: "If a BST is balanced, what is its height for N elements?",
        options: [
          "O(1)",
          "O(log N)",
          "O(N)",
          "O(N²)"
        ],
        correct_index: 1,
        explanation: "A balanced binary tree distributes nodes evenly, meaning the maximum path length from root to leaf (height) is bounded by O(log N)."
      },
      {
        question: "In a BST, where is the minimum value always located?",
        options: [
          "The root node.",
          "The rightmost leaf node.",
          "The leftmost leaf or node with no left child.",
          "The leaf node that has the shortest height."
        ],
        correct_index: 2,
        explanation: "Because left subtrees always contain smaller values, the minimum value is reached by continuously traversing left until there are no more left branches."
      }
    ]
  },
  {
    id: "dsa-dp",
    title: "Dynamic Programming & Knapsack",
    category: "DSA",
    complexity: "Hard", // 12 questions
    tags: ["memoization", "tabulation", "knapsack", "dynamic-programming"],
    description: "Solve complex recursion problems by breaking them into overlapping subproblems using memoization and tabulation.",
    fallbackContent: `# Dynamic Programming & Knapsack

## Introduction
Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into simpler, overlapping subproblems. It saves computation time by solving each subproblem only once and storing its answer.

For a problem to be solvable via DP, it must possess two properties:
1. **Overlapping Subproblems**: Subproblems are solved repeatedly (unlike divide-and-conquer, e.g. Merge Sort, where subproblems are independent).
2. **Optimal Substructure**: The optimal solution to the problem can be constructed from optimal solutions to its subproblems.

---

## Memoization (Top-Down) vs Tabulation (Bottom-Up)

### Top-Down (Memoization)
Start with the target problem and recursively break it down. Cache results in a table (hash map or array) to avoid recalculating.
- **Approach**: Recursive.
- **Pros**: Easy to write; only computes states that are actually needed.

### Bottom-Up (Tabulation)
Start from the base cases and build the solutions in an array/matrix.
- **Approach**: Iterative (loops).
- **Pros**: Avoids call-stack overflow; has better performance due to cache locality and no recursive overhead.

---

## Classic DP Problem: The 0/1 Knapsack
Given weights and values of $N$ items, put these items in a knapsack of capacity $W$ to get the maximum total value.

### DP State definition:
Let \`dp[i][w]\` be the maximum value obtained with items from \`0\` to \`i-1\` and a knapsack capacity of \`w\`.

### Transition Formula:
\`dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])\` (if weight fits).

---

## Code Example: 0/1 Knapsack Tabulation (JS)
\`\`\`javascript
function knapsack(W, wt, val, n) {
  // Initialize table
  let dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (wt[i - 1] <= w) {
        // Max of excluding vs including the item
        dp[i][w] = Math.max(
          dp[i - 1][w],
          val[i - 1] + dp[i - 1][w - wt[i - 1]]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][W];
}
// Time Complexity: O(N * W)
// Space Complexity: O(N * W) -> Can be optimized to O(W)
\`\`\`

---

## DP Optimization: Space Compression
Many DP grids only reference the previous row (\`dp[i-1][...]\`). Thus, we can optimize space from $O(N \\times W)$ to $O(W)$ by updating a single 1D array backwards.

---

## Key Takeaways
- Identify DP: Look for words like "minimize", "maximize", "longest", "shortest", or "number of ways".
- Define the **DP State** and **Transition Relation** before writing any code.
- Optimize space complexity if your state transition only relies on the previous row/step.`,
    fallbackQuiz: [
      {
        question: "What are the two mandatory properties a problem must have to be solved using Dynamic Programming?",
        options: [
          "Sorted input data and linear relationships.",
          "Overlapping subproblems and optimal substructure.",
          "Divide-and-conquer strategy and recursive base cases.",
          "Dynamic memory allocation and heap structures."
        ],
        correct_index: 1,
        explanation: "A problem needs both overlapping subproblems (recomputing the same things) and optimal substructure (constructing the big solution from sub-solutions) for DP to be viable."
      },
      {
        question: "What is the primary difference between Memoization and Tabulation?",
        options: [
          "Memoization is bottom-up (iterative), while Tabulation is top-down (recursive).",
          "Memoization is top-down (recursive) using a lookup cache, while Tabulation is bottom-up (iterative) filling a table.",
          "Memoization has higher time complexity than Tabulation.",
          "Tabulation uses stack frames, while Memoization uses queues."
        ],
        correct_index: 1,
        explanation: "Memoization starts from the goal and recurses downwards, saving answers. Tabulation starts from base cases and fills an array iteratively using loops."
      },
      {
        question: "Why does Memoization sometimes hit a 'stack overflow' error in languages like JavaScript, while Tabulation does not?",
        options: [
          "Memoization requires more heap memory for storing values.",
          "Memoization is recursive and can exceed the maximum call stack limit for deep inputs.",
          "Tabulation uses double pointers which bypass stack limitations.",
          "Tabulation runs in multi-threaded environments."
        ],
        correct_index: 1,
        explanation: "Recursive calls push frames onto the stack. If the recursion depth is too high, it overflows. Tabulation uses loops, which run in O(1) stack space."
      },
      {
        question: "In the 0/1 Knapsack problem, why does the optimized 1D array space compression require iterating the capacity 'w' backwards?",
        options: [
          "To avoid using values from the current row (reusing the same item multiple times).",
          "To speed up execution cache locality.",
          "To sort weights in descending order automatically.",
          "To prevent compiler optimization warnings."
        ],
        correct_index: 0,
        explanation: "Iterating backwards ensures we evaluate the current item using values from the previous item's state. Iterating forwards would overwrite values and act like the Unbounded Knapsack (allowing multiple uses of the same item)."
      },
      {
        question: "For a DP problem, what is 'Space Compression'?",
        options: [
          "Using zip archives to compress arrays.",
          "Converting double variables to float or short representation.",
          "Reducing the array dimension (e.g. 2D to 1D) because only the previous row/state is needed.",
          "Hashing the DP table keys to fit in smaller RAM."
        ],
        correct_index: 2,
        explanation: "Space compression reduces auxiliary storage (e.g., from O(N*M) to O(M)) when transitions only depend on the immediate previous state (or row)."
      },
      {
        question: "What is the time complexity of finding the Nth Fibonacci number using a tabulated DP approach?",
        options: [
          "O(2^N)",
          "O(N²)",
          "O(N)",
          "O(log N)"
        ],
        correct_index: 2,
        explanation: "The tabulated approach computes values sequentially from 1 to N, taking O(N) steps. (A matrix exponentiation approach can do it in O(log N))."
      },
      {
        question: "If a DP subproblem is NOT overlapping, which technique is better suited than Dynamic Programming?",
        options: [
          "Divide and Conquer",
          "Binary Search",
          "Greedy",
          "Backtracking"
        ],
        correct_index: 0,
        explanation: "If subproblems do not overlap (they are independent), Divide and Conquer (like Merge Sort) is the correct paradigm because there is no benefit in saving results."
      },
      {
        question: "What is the transition state equation for the 'Climbing Stairs' problem (finding the number of ways to reach step N if you can take 1 or 2 steps)?",
        options: [
          "dp[i] = dp[i-1] * dp[i-2]",
          "dp[i] = dp[i-1] + dp[i-2]",
          "dp[i] = max(dp[i-1], dp[i-2])",
          "dp[i] = dp[i-1] - 1"
        ],
        correct_index: 1,
        explanation: "To reach step i, you can only come from step i-1 (by taking 1 step) or step i-2 (by taking 2 steps). Thus, the ways add up: dp[i] = dp[i-1] + dp[i-2] (equivalent to Fibonacci)."
      },
      {
        question: "What is the time complexity of the classic 0/1 Knapsack solution with N items and a capacity of W?",
        options: [
          "O(2^N)",
          "O(N * W)",
          "O(N + W)",
          "O(N²)"
        ],
        correct_index: 1,
        explanation: "The algorithm fills a grid of size (N+1) x (W+1), computing each state in O(1) time, resulting in O(N * W) time complexity."
      },
      {
        question: "What does the '0/1' in 0/1 Knapsack imply?",
        options: [
          "The weights are either 0 or 1.",
          "Items are binary code assets.",
          "Items cannot be divided; we either take an item (1) or leave it (0).",
          "The maximum value of the knapsack must be between 0 and 1."
        ],
        correct_index: 2,
        explanation: "It indicates that items cannot be broken into fractions (which would be a fractional knapsack solved greedily). You must either take the whole item or leave it."
      },
      {
        question: "Which of these is a typical Hard DP problem often asked in FAANG interviews?",
        options: [
          "Valid Parentheses",
          "Reverse Linked List",
          "Edit Distance (Levenshtein Distance)",
          "Binary Search"
        ],
        correct_index: 2,
        explanation: "Edit Distance is a classic 2D DP problem that determines the minimum operations to convert one string into another, frequently asked in senior loops."
      },
      {
        question: "If a problem has optimal substructure but does NOT show overlapping subproblems, what is the best approach?",
        options: [
          "Greedy",
          "Divide and Conquer",
          "DFS",
          "Dynamic Programming"
        ],
        correct_index: 1,
        explanation: "Divide and conquer splits a problem into independent subproblems, solves them, and merges them. It has optimal substructure but no overlap."
      }
    ]
  },

  // 2. System Design
  {
    id: "sys-scaling",
    title: "Scaling Databases: Sharding & Replication",
    category: "System Design",
    complexity: "Hard",
    tags: ["system-design", "database", "sharding", "replication", "scalability"],
    description: "Learn how to scale databases horizontally using master-slave replication, multi-leader, sharding, and consistent hashing.",
    fallbackContent: `# Scaling Databases: Sharding & Replication

## Introduction
A single database server has limits on storage, memory, and CPU. To scale databases beyond a single machine, we must partition data or copy it across multiple nodes. The two primary techniques are **Replication** (copying data) and **Sharding** (partitioning data).

---

## Replication Models
Replication copies the same data onto multiple machines to guarantee high availability, fault tolerance, and low latency read operations.

### 1. Leader-Follower (Master-Slave)
- **Mechanism**: All writes go to the Leader. The Leader writes to its local storage and propagates changes to Followers (Replica nodes). Reads can go to any node.
- **Pros**: Easy to implement; scales read traffic.
- **Cons**: Write bottlenecks (all writes hit one server); stale reads if asynchronous.

### 2. Multi-Leader
- **Mechanism**: Multiple nodes act as write leaders.
- **Pros**: Handles high write throughput; survives data center outages.
- **Cons**: Requires complex conflict resolution.

### 3. Leaderless (Dynamo-style)
- **Mechanism**: Clients write to multiple nodes concurrently. Uses Quorums ($W + R > N$) to ensure consistency.

---

## Sharding (Horizontal Partitioning)
Sharding breaks a large database into smaller, faster, more manageable databases called data shards.

### Partitioning Strategies
- **Range-Based**: Assign ranges of keys to specific shards (e.g., A-E to Shard 1). Can lead to hot spots.
- **Hash-Based**: Apply a hash function to the key to determine shard index: \`shard = hash(key) % number_of_shards\`.
  - **Problem**: Changing the number of shards requires rehashing almost all keys.
- **Consistent Hashing**: A topology mapping keys to nodes on a logical ring.
  - **Benefit**: Adding/removing a node only requires moving $K/N$ keys, minimizing data re-distribution.

---

## Consistent Hashing Topology
\`\`\`
       Node A (0)
      /          \\
  Key 2          Node B (120)
    \\              /
  Node C (240) - Key 1
\`\`\`
Keys are hashed and placed on the ring. They are assigned to the first node encountered walking clockwise.

---

## CAP Theorem
In a distributed data store, you can only guarantee two out of these three properties:
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every non-failing node returns a response (not an error/timeout), without guarantee it contains the latest write.
- **Partition Tolerance**: The system continues to operate despite network partition/node drops.
*Note: Real systems must handle network issues, so they choose AP (Availability/Partition) or CP (Consistency/Partition).*

---

## Common Interview Scenarios
1. **Design a Global Chat Service**: Store messages in a partitioned NoSQL DB (e.g. Cassandra) sharded by \`chat_id\`.
2. **Handle Flash Sales**: Implement write-heavy database queues and sharding keys to avoid database lock contention.
3. **Design TinyURL**: Shard the URL mapping database using consistent hashing on the short code.`,
    fallbackQuiz: [
      {
        question: "What is the primary benefit of Consistent Hashing over modulo-based hashing (hash(key) % N) when scaling distributed databases?",
        options: [
          "It guarantees that all nodes store an identical amount of data.",
          "It encrypts the database keys using modern AES standards.",
          "It minimizes the amount of data that needs to be moved when nodes are added or removed.",
          "It forces all writes to bypass the cache and write directly to disk."
        ],
        correct_index: 2,
        explanation: "In modulo hashing, changing N requires rehashing almost all keys. Consistent hashing maps keys and nodes to a circular ring, meaning adding or removing a node only impacts a fraction (1/N) of keys."
      },
      {
        question: "Under the CAP Theorem, if a network partition (P) occurs, what choice must a system designer make?",
        options: [
          "Choose between latency and durability.",
          "Choose between consistency (C) and availability (A).",
          "Choose between SQL and NoSQL databases.",
          "Choose between vertical and horizontal scaling."
        ],
        correct_index: 1,
        explanation: "Network partitions are inevitable in distributed systems. Therefore, a designer must choose between consistency (returning errors if nodes can't sync) or availability (nodes respond with stale data)."
      },
      {
        question: "What is 'split-brain' in a leader-follower replication setup?",
        options: [
          "When a database server has two CPU sockets running different queries.",
          "When a network partition causes two nodes to believe they are the active Leader simultaneously, leading to conflicting writes.",
          "When a database shard is split into two smaller shards due to size.",
          "When a backup server executes SQL commands backwards."
        ],
        correct_index: 1,
        explanation: "If a network link breaks, the follower might think the leader is dead and elect itself. If the old leader is still alive, both accept writes, causing split-brain and database corruption."
      },
      {
        question: "How does a Dynamo-style leaderless database ensure write-read consistency?",
        options: [
          "By locking the entire database during writes.",
          "By routing all queries to a single coordinator node.",
          "By employing quorum configurations where write quorum (W) plus read quorum (R) is greater than replica nodes (N) (W + R > N).",
          "By storing data in memory without disk persistence."
        ],
        correct_index: 2,
        explanation: "If W + R > N, the write and read sets must overlap on at least one node, ensuring a read operation will always query at least one node containing the latest write."
      },
      {
        question: "What is a 'Hot Spot' in database sharding?",
        options: [
          "A cooling fan failure on a database server rack.",
          "A shard that receives an unevenly high volume of reads/writes due to poor partition key selection, choking performance.",
          "A SQL database that has full-text search enabled.",
          "An administrative dashboard showing real-time metrics."
        ],
        correct_index: 1,
        explanation: "A hot spot occurs when a specific key (like a popular user ID or date) attracts almost all database traffic, overloading that specific shard while others sit idle."
      },
      {
        question: "Which replication lag issue describes a user posting a comment, reloading, and not seeing their own comment because the read hit a lagging follower?",
        options: [
          "Monotonic Reads violation",
          "Read-after-write inconsistency (Read-your-own-writes)",
          "Consistent Prefix Reads violation",
          "Dirty Read"
        ],
        correct_index: 1,
        explanation: "Read-after-write consistency guarantees that once a user submits a write, they will see it. If reads hit an asynchronous follower before it catches up, the user won't see their own post."
      },
      {
        question: "What does 'vertical scaling' (scaling up) mean?",
        options: [
          "Adding more machines to a cluster.",
          "Increasing the hardware specs (CPU, RAM, SSD) of a single server.",
          "Partitioning data into vertical columns.",
          "Moving database infrastructure to a higher-altitude data center."
        ],
        correct_index: 1,
        explanation: "Scaling up means adding more power (hardware resources) to a single existing database node, which has a hard physical ceiling."
      },
      {
        question: "In Consistent Hashing, what are 'Virtual Nodes' used for?",
        options: [
          "To simulate virtual databases for testing purposes.",
          "To balance the distribution of keys more evenly across physical nodes and prevent hotspots.",
          "To allow backups to run without physical storage.",
          "To encrypt connections between clients and server nodes."
        ],
        correct_index: 1,
        explanation: "Virtual nodes represent physical nodes multiple times on the ring, smoothing out data distribution to ensure keys are divided evenly even with few physical servers."
      },
      {
        question: "Which index constraint prevents Sharded databases from easily enforcing unique constraints across the entire dataset?",
        options: [
          "Global indices are too slow to check across multiple network shards.",
          "SQL keys are capped at 32-bit values.",
          "B-Trees cannot cross cluster boundaries.",
          "Transactions are not allowed on shards."
        ],
        correct_index: 0,
        explanation: "Validating uniqueness globally requires querying all shards on every insert, which degrades performance. Uniqueness is usually enforced at the application layer or by sharding by that unique key."
      },
      {
        question: "What is a major challenge of multi-leader replication setups?",
        options: [
          "Slow read performance.",
          "Resolving write conflicts when two leaders update the same row concurrently.",
          "High costs of network switches.",
          "Lack of support for index keys."
        ],
        correct_index: 1,
        explanation: "Since multiple leaders accept writes, they can receive conflicting updates. Resolving this requires strategies like Last-Write-Wins (LWW), operational transformation, or conflict-free replicated data types (CRDTs)."
      },
      {
        question: "What is database federation?",
        options: [
          "A government database regulatory body.",
          "Splitting a database by functional domains (e.g., Users, Products, Orders) into separate databases.",
          "Merging multiple SQL queries into one.",
          "Synchronizing database schemas globally."
        ],
        correct_index: 1,
        explanation: "Federation splits databases by function/domain so that order queries go to an orders database, user queries to a user database, reducing individual load."
      },
      {
        question: "What happens when a database shard grows too large?",
        options: [
          "It crashes automatically.",
          "It must be split into two new shards, requiring data re-balancing.",
          "It converts itself to NoSQL.",
          "It locks writes indefinitely."
        ],
        correct_index: 1,
        explanation: "When a shard gets too large or gets too hot, it must be split (resharded), which involves moving data to a new server node."
      }
    ]
  },

  // 3. Full Stack
  {
    id: "fs-react",
    title: "React Internals & Virtual DOM",
    category: "Full Stack",
    complexity: "Medium",
    tags: ["react", "virtual-dom", "reconciliation", "fiber", "performance"],
    description: "Deep dive into React internals: rendering cycles, fiber architecture, reconciliation algorithm, and performance optimization.",
    fallbackContent: `# React Internals & Virtual DOM

## Introduction
React is a declarative library. Instead of manipulating the browser DOM directly (which is slow due to layout and style recalculations), React maintains a lightweight representation in memory called the **Virtual DOM**.

---

## The Rendering Pipeline
1. **Render Phase**: React crawls the component tree and generates a new Virtual DOM tree. This phase is pure, side-effect-free, and can be paused/yielded (since React 16 Fiber).
2. **Reconciliation Phase**: React compares the new Virtual DOM with the old one (diffing).
3. **Commit Phase**: React applies the changes to the real browser DOM via DOM manipulation methods (e.g., \`appendChild\`, \`removeChild\`). This phase is synchronous.

---

## React Fiber Architecture
Before React 16, reconciliation was recursive and synchronous (blocking the main thread, causing frame drops during heavy renders).
**Fiber** re-implemented the reconciliation engine as a linked-list tree. Each component is a "Fiber node" containing:
- State, props, and child links.
- A pointer to the next sibling, parent, and child.
Fiber turns the recursive stack into a heap-based loop, allowing React to pause rendering, handle priority tasks (like user typing), and resume.

---

## Diffing Algorithm ($O(N)$ heuristics)
Comparing two trees takes $O(N^3)$ time in the worst case. React uses two heuristics to reduce this to $O(N)$:
1. **Same Type**: If two elements have different HTML tags or component types, React tears down the old tree and builds the new one from scratch.
2. **Keys**: Elements with the same parent can be tracked across renders using a unique \`key\` prop. Keys help React identify which items changed, were added, or were removed.

---

## Code Example: Custom React Hooks & Avoid Re-renders
\`\`\`jsx
import React, { useState, useMemo, useCallback } from 'react';

// Parent Component
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Memoize calculations to prevent calculation on text input change
  const heavyCompute = useMemo(() => {
    return expensiveFn(count);
  }, [count]);

  // Memoize callback to prevent child re-render if text updates
  const handleAction = useCallback(() => {
    console.log("Count is: ", count);
  }, [count]);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <HeavyChild compute={heavyCompute} onAction={handleAction} />
    </div>
  );
}

// Wrap child in React.memo to prevent re-renders when parent text state changes
const HeavyChild = React.memo(({ compute, onAction }) => {
  console.log("HeavyChild Rendered!");
  return <button onClick={onAction}>Val: {compute}</button>;
});
\`\`\`

---

## Common Interview Questions
1. **Why shouldn't you use array indices as keys?** If elements are reordered, deleted, or inserted, the index changes, causing React to mismatch component states and trigger unnecessary DOM writes.
2. **What is concurrent rendering?** The ability for React to prepare multiple versions of UI concurrently without blocking the main thread.
3. **Difference between \`useMemo\` and \`useCallback\`?** \`useMemo\` memoizes the *returned value* of a function, while \`useCallback\` memoizes the *function instance* itself.`,
    fallbackQuiz: [
      {
        question: "What is the primary purpose of the React Fiber architecture introduced in React 16?",
        options: [
          "To speed up CSS compile times.",
          "To allow asynchronous, non-blocking rendering by breaking reconciliation work into incremental units.",
          "To replace Redux with a built-in state manager.",
          "To enable server-side database connections directly from components."
        ],
        correct_index: 1,
        explanation: "Fiber split React's rendering stack into small, incremental chunks, allowing the browser to interrupt rendering to handle high-priority events like user inputs, improving responsiveness."
      },
      {
        question: "Why is using array index as a 'key' prop in dynamic lists considered an anti-pattern?",
        options: [
          "It causes compile errors in modern React.",
          "It forces the browser to download React twice.",
          "It can cause UI bugs and slow performance if the list is reordered, sorted, or items are deleted.",
          "It disables React Hooks in child components."
        ],
        correct_index: 2,
        explanation: "If a list is reordered or items are deleted, indices shift. React will map existing component state to incorrect elements since it relies on keys to track elements between renders."
      },
      {
        question: "What is the difference between useMemo and useCallback?",
        options: [
          "useMemo is for class components; useCallback is for functional components.",
          "useMemo caches a computed value; useCallback caches the function definition itself to prevent recreation.",
          "useMemo runs asynchronously; useCallback runs synchronously.",
          "useMemo stores state in localStorage; useCallback stores it in the heap."
        ],
        correct_index: 1,
        explanation: "useMemo executes a function and caches its result. useCallback caches the actual function instance (the memory address) to prevent child components from re-rendering due to prop reference changes."
      },
      {
        question: "During which phase of the React rendering pipeline are changes actually written to the browser DOM?",
        options: [
          "Render Phase",
          "Reconciliation Phase",
          "Commit Phase",
          "Diffing Phase"
        ],
        correct_index: 2,
        explanation: "The Commit phase is where React applies the computed differences to the DOM using node manipulation methods like appendChild or removeChild. This phase is synchronous and blocking."
      },
      {
        question: "What happens during the diffing phase if React encounters two elements of different HTML tag types (e.g. <div> changes to <span>)?",
        options: [
          "It updates the tag in-place and retains child elements.",
          "It ignores the change and preserves the DOM.",
          "It destroys the old element, tearing down the entire subtree, and creates the new element.",
          "It throws a syntax warning and falls back to vanilla JS."
        ],
        correct_index: 2,
        explanation: "Under React's diffing heuristics, elements of different types are assumed to produce different trees. React destroys the old subtree entirely and rebuilds the new one."
      },
      {
        question: "Which React hook is used to access and manipulate a physical DOM node directly?",
        options: [
          "useState",
          "useEffect",
          "useRef",
          "useContext"
        ],
        correct_index: 2,
        explanation: "useRef creates a mutable container object. By passing it to a ref attribute on an element, React populates its '.current' property with the reference to the actual DOM node."
      },
      {
        question: "What is 'Reconciliation' in React?",
        options: [
          "The process of loading CSS styles in JavaScript.",
          "The algorithm React uses to diff the Virtual DOM tree with the current DOM to compute minimal updates.",
          "Synchronizing React state with a backend server database.",
          "Resolving conflicts between branch commits in git."
        ],
        correct_index: 1,
        explanation: "Reconciliation is the process and algorithm React uses to identify changes by diffing the old Virtual DOM with the new one, minimizing costly DOM writes."
      },
      {
        question: "How does React.memo optimize component performance?",
        options: [
          "By caching database queries in memory.",
          "By performing a shallow comparison of props and preventing re-renders if props have not changed.",
          "By compiling the component into WebAssembly.",
          "By automatically running code in a web worker."
        ],
        correct_index: 1,
        explanation: "React.memo is a higher-order component that checks if props changed. If they are identical (using shallow comparison), React skips rendering that component and its children entirely."
      }
    ]
  },

  // 4. Soft Skills
  {
    id: "soft-star",
    title: "STAR Method & Behavioral Interviews",
    category: "Soft Skills",
    complexity: "Easy", // 5 questions
    tags: ["behavioral", "communication", "star-method", "leadership"],
    description: "Learn how to structure your answers to behavioral questions using the Situation, Task, Action, and Result (STAR) framework.",
    fallbackContent: `# STAR Method & Behavioral Interviews

## Introduction
Technical skills alone will not get you into FAANG. Behavioral interviews evaluate how you solve conflicts, handle failures, demonstrate leadership, and navigate ambiguity. The industry standard for answering behavioral questions is the **STAR Method**.

---

## What is the STAR Method?

### **S**ituation
Describe the context of the story: the company, project, or problem. Provide enough detail so the interviewer understands the complexity.
- *Keep it to 20% of your answer.*

### **T**ask
Explain your responsibility in the situation. What was the challenge, deadline, or goal?
- *Keep it to 10% of your answer.*

### **A**ction
Describe **what you did** to solve the problem. Use "**I**" instead of "we". Focus on your decisions, coding contributions, system designs, or conflict resolution steps.
- *This should be the bulk of your answer (60%).*

### **R**esult
Highlight the outcome. Use **quantifiable metrics** where possible (e.g., "reduced latency by 40%", "saved $10k/month in AWS costs", "delivered project 2 weeks ahead of schedule"). Explain what you learned.
- *Keep it to 10% of your answer.*

---

## Example STAR Answer Framework: "Handling a Production Outage"
- **Situation**: During a peak shopping event, our checkout API's database connections saturated, raising the failure rate to 15%.
- **Task**: As the on-call engineer, I had to identify the root cause and restore the service within 1 hour to prevent revenue loss.
- **Action**: I checked the logs and identified an un-indexed query scanning 10M order records. I immediately spun up a database replica to route non-critical traffic and ran a migration to add a composite index on the key.
- **Result**: The index reduced query execution times from 4.2 seconds to 8 milliseconds. Service was restored in 42 minutes, preventing an estimated $120k in lost transactions.

---

## Top Behavioral Questions
1. **\"Tell me about a time you had a conflict with a co-worker.\"** (Focus on empathy, active listening, and compromise).
2. **\"Describe a time you failed.\"** (Focus on taking responsibility, solving the fallout, and what you learned from it).
3. **\"Tell me about a time you handled ambiguity.\"** (Focus on how you gathered requirements, designed prototypes, and moved forward systematically).`,
    fallbackQuiz: [
      {
        question: "What does the STAR acronym stand for?",
        options: [
          "System, Technology, Architecture, Reliability",
          "Strategy, Timeline, Allocation, Resources",
          "Situation, Task, Action, Result",
          "Status, Target, Analysis, Review"
        ],
        correct_index: 2,
        explanation: "STAR stands for Situation, Task, Action, and Result. It is a structured manner of responding to behavioral-based interview questions."
      },
      {
        question: "Which component of the STAR method should receive the most detailed explanation (taking up about 60% of the response)?",
        options: [
          "Situation",
          "Task",
          "Action",
          "Result"
        ],
        correct_index: 2,
        explanation: "The Action section details your personal decisions, engineering steps, and leadership, which is what the interviewer is evaluating. Keep the Situation and Task brief."
      },
      {
        question: "When explaining the 'Result' in a behavioral interview, what makes an answer stand out the most to FAANG recruiters?",
        options: [
          "Blaming others for any remaining bugs.",
          "Using subjective adjectives like 'it felt much faster'.",
          "Quantifying the impact with specific metrics (latency, cost, percentages).",
          "Keeping the outcome secret to maintain security."
        ],
        correct_index: 3,
        explanation: "Quantifiable results (e.g., 'reduced API error rates by 95%', 'boosted conversion by 4.2%') demonstrate business acumen and provide solid evidence of your engineering impact."
      },
      {
        question: "Why is it important to use 'I' instead of 'we' when describing actions in a behavioral interview?",
        options: [
          "To show that you don't work well in teams.",
          "Because the interviewer wants to evaluate your individual contribution, not the team's collective effort.",
          "Using 'we' is grammatically incorrect in interviews.",
          "Using 'I' saves time."
        ],
        correct_index: 1,
        explanation: "Saying 'we' hides what *you* did. Interviewers need to write evaluations on *your* capabilities, so specify your individual actions, even when describing team projects."
      },
      {
        question: "If an interviewer asks: 'Tell me about a time you disagreed with your manager', what are they primarily evaluating?",
        options: [
          "Whether you obey all orders blindly.",
          "Whether you are prone to shouting arguments.",
          "Your communication skills, professional empathy, logic, and how you resolve conflicts constructivly.",
          "Your ability to code under stress."
        ],
        correct_index: 2,
        explanation: "Disagreements are natural. Interviewers want to see that you communicate professionally, present data-backed arguments, compromise, and align with the final decision ('disagree and commit')."
      }
    ]
  }
];

// Combine all remaining headers without fallback contents so they can be generated or have basic defaults
const ADDED_CHAPTERS = [
  // 1. DSA
  {
    id: "dsa-graphs",
    title: "Graphs, BFS & DFS",
    category: "DSA",
    complexity: "Hard",
    tags: ["graphs", "bfs", "dfs", "topological-sort", "dijkstra"],
    description: "Learn graph representations (adjacency lists) and master BFS, DFS, and shortest path algorithms.",
  },
  // 2. System Design
  {
    id: "sys-caching",
    title: "Caching Strategies & Load Balancing",
    category: "System Design",
    complexity: "Medium",
    tags: ["caching", "cdn", "load-balancer", "redis", "nginx"],
    description: "Implement cache policies (write-through, eviction) and distribute traffic with load balancers.",
  },
  {
    id: "sys-microservices",
    title: "Microservices & System APIs",
    category: "System Design",
    complexity: "Medium",
    tags: ["microservices", "grpc", "rest", "graphql", "api-gateway"],
    description: "Deconstruct monoliths, design RPC interfaces, and leverage API Gateways in microservices.",
  },
  // 3. Full Stack
  {
    id: "fs-node",
    title: "Node.js Event Loop & Performance",
    category: "Full Stack",
    complexity: "Medium",
    tags: ["nodejs", "event-loop", "v8-engine", "concurrency"],
    description: "Understand the non-blocking I/O loop, thread pool, phases of event execution, and scaling node.",
  },
  // 4. Cloud & DevOps
  {
    id: "cloud-containers",
    title: "Containers & Orchestration: Docker & K8s",
    category: "Cloud & DevOps",
    complexity: "Medium",
    tags: ["docker", "kubernetes", "containers", "orchestration"],
    description: "Build efficient container images and orchestrate scaling, self-healing services in Kubernetes.",
  },
  {
    id: "cloud-iac",
    title: "CI/CD & Infrastructure as Code (IaC)",
    category: "Cloud & DevOps",
    complexity: "Medium",
    tags: ["terraform", "github-actions", "cicd", "iac"],
    description: "Automate code deployments using GitHub Actions and declare server assets with Terraform.",
  },
  // 5. Databases
  {
    id: "db-acid",
    title: "Transactions, Isolation Levels & ACID",
    category: "Databases",
    complexity: "Hard",
    tags: ["transactions", "acid", "isolation-levels", "locks"],
    description: "Understand database integrity: Read Committed vs Serializable, locks, MVCC, and deadlocks.",
  },
  {
    id: "db-indexing",
    title: "Database Indexing (B-Trees vs LSM)",
    category: "Databases",
    complexity: "Medium",
    tags: ["indexes", "b-tree", "lsm-tree", "write-performance"],
    description: "Compare read-heavy B-Tree indexes with write-heavy Log-Structured Merge Trees.",
  },
  // 6. Security
  {
    id: "sec-oauth",
    title: "OAuth2, OIDC & Token Authentication",
    category: "Security",
    complexity: "Hard",
    tags: ["oauth2", "oidc", "jwt", "auth"],
    description: "Master authorization flows (Auth Code, PKCE) and verify tokens in distributed apps.",
  },
  {
    id: "sec-web",
    title: "Web Vulnerabilities: CSRF, XSS, CORS",
    category: "Security",
    complexity: "Medium",
    tags: ["xss", "csrf", "cors", "owasp-top-10"],
    description: "Secure frontends against cross-site scripts, request forgery, and configure headers.",
  },
  // 7. CS Fundamentals
  {
    id: "cs-os",
    title: "Operating Systems: Processes, Threads & Memory",
    category: "CS Fundamentals",
    complexity: "Medium",
    tags: ["os", "processes", "threads", "virtual-memory", "scheduler"],
    description: "Learn context switching, CPU scheduling, thread synchronization, and virtual memory layout.",
  },
  {
    id: "cs-network",
    title: "Computer Networks: TCP/IP & HTTP/3",
    category: "CS Fundamentals",
    complexity: "Medium",
    tags: ["networking", "tcp-ip", "http3", "quic", "dns"],
    description: "Understand 3-way handshakes, UDP vs TCP, and how HTTP/3 uses QUIC to bypass HOL blocking.",
  },

  // ── NEW: DSA ─────────────────────────────────────────────────────────────────
  { id: "dsa-linked-lists", title: "Linked Lists (Singly & Doubly)", category: "DSA", complexity: "Medium", tags: ["linked-list", "singly", "doubly", "reversal", "cycle-detection"], description: "Master singly and doubly linked lists: insertion, deletion, reversal, and Floyd's cycle detection — staple FAANG questions." },
  { id: "dsa-stacks-queues", title: "Stacks & Queues", category: "DSA", complexity: "Easy", tags: ["stack", "queue", "deque", "monotonic-stack", "lifo"], description: "Understand LIFO/FIFO principles, implement stacks with arrays or linked lists, and solve bracket-matching and sliding-window maximum problems." },
  { id: "dsa-hash-maps", title: "Hash Maps & Hash Sets", category: "DSA", complexity: "Easy", tags: ["hash-map", "hash-set", "collision", "chaining", "open-addressing"], description: "Learn hash functions, collision resolution strategies (chaining vs open addressing), and apply O(1) lookup to classic array and string problems." },
  { id: "dsa-two-pointers", title: "Two Pointers Technique", category: "DSA", complexity: "Medium", tags: ["two-pointers", "converging", "slow-fast", "in-place", "sorted-array"], description: "Apply converging and slow/fast pointer patterns to solve sorted-array pair problems, in-place partitioning, and linked-list cycle detection in O(N) time." },
  { id: "dsa-sliding-window", title: "Sliding Window Technique", category: "DSA", complexity: "Medium", tags: ["sliding-window", "variable-window", "fixed-window", "substring", "subarray"], description: "Reduce O(N²) subarray/substring brute-force to O(N) using fixed and variable sliding windows. Master longest/shortest subarray patterns." },
  { id: "dsa-binary-search", title: "Binary Search", category: "DSA", complexity: "Medium", tags: ["binary-search", "sorted-array", "search-space", "left-right-pointers", "log-n"], description: "Apply binary search beyond sorted arrays: search rotated arrays, find peak elements, and reduce search space on monotonic functions — all in O(log N)." },
  { id: "dsa-recursion", title: "Recursion & Backtracking", category: "DSA", complexity: "Hard", tags: ["recursion", "backtracking", "call-stack", "pruning", "subsets", "permutations"], description: "Build recursive thinking patterns and backtracking templates for generating subsets, permutations, and solving constraint-satisfaction problems (N-Queens, Sudoku)." },
  { id: "dsa-sorting", title: "Sorting Algorithms (Merge, Quick, Heap, Counting)", category: "DSA", complexity: "Medium", tags: ["merge-sort", "quick-sort", "heap-sort", "counting-sort", "stability"], description: "Understand time/space tradeoffs of comparison and non-comparison sorts. Know when to apply each algorithm in interviews and production systems." },
  { id: "dsa-tree-traversals", title: "Tree Traversals (Inorder, Preorder, Postorder, Level Order)", category: "DSA", complexity: "Medium", tags: ["inorder", "preorder", "postorder", "level-order", "bfs", "dfs"], description: "Implement all four traversal strategies iteratively and recursively. Understand which traversal solves which class of tree problem." },
  { id: "dsa-heaps", title: "Heaps & Priority Queues", category: "DSA", complexity: "Medium", tags: ["heap", "min-heap", "max-heap", "priority-queue", "heapify", "k-largest"], description: "Build and query min/max heaps for scheduling, K-largest element problems, and Dijkstra's algorithm. Understand heapify and the heap property." },
  { id: "dsa-tries", title: "Tries (Prefix Trees)", category: "DSA", complexity: "Medium", tags: ["trie", "prefix-tree", "autocomplete", "word-search", "insert-search"], description: "Design and implement prefix trees for autocomplete, word validation, and IP routing. Understand space tradeoffs vs hash maps for string keys." },
  { id: "dsa-graph-rep", title: "Graphs — Representation (Adjacency List & Matrix)", category: "DSA", complexity: "Easy", tags: ["adjacency-list", "adjacency-matrix", "directed", "undirected", "weighted"], description: "Represent directed, undirected, and weighted graphs as adjacency lists and matrices. Understand when each representation is optimal." },
  { id: "dsa-topological-sort", title: "Topological Sort", category: "DSA", complexity: "Hard", tags: ["topological-sort", "dag", "kahn-algorithm", "cycle-detection", "course-schedule"], description: "Sort directed acyclic graphs for dependency resolution using Kahn's BFS algorithm and DFS-based approach. Detect cycles in directed graphs." },
  { id: "dsa-union-find", title: "Union Find (Disjoint Set)", category: "DSA", complexity: "Medium", tags: ["union-find", "disjoint-set", "path-compression", "union-by-rank", "connected-components"], description: "Implement path-compressed, union-by-rank disjoint sets for near O(1) connectivity queries. Apply to Kruskal's MST and number-of-islands variants." },
  { id: "dsa-shortest-path", title: "Shortest Path Algorithms (Dijkstra, Bellman-Ford)", category: "DSA", complexity: "Hard", tags: ["dijkstra", "bellman-ford", "shortest-path", "weighted-graph", "negative-edges"], description: "Find shortest paths in weighted graphs: Dijkstra (no negative edges, O(E log V)) and Bellman-Ford (handles negative edges, O(VE))." },
  { id: "dsa-mst", title: "Minimum Spanning Tree (Kruskal, Prim)", category: "DSA", complexity: "Hard", tags: ["mst", "kruskal", "prim", "greedy", "union-find"], description: "Construct minimum spanning trees with Kruskal's (sort edges + union-find) and Prim's (greedy BFS with min-heap). Apply to network design problems." },
  { id: "dsa-dp-2d", title: "Dynamic Programming — 2D & Grid", category: "DSA", complexity: "Hard", tags: ["2d-dp", "grid-dp", "longest-common-subsequence", "edit-distance", "unique-paths"], description: "Solve 2D DP problems: LCS, Edit Distance, Unique Paths, and matrix chain multiplication. Define 2D state tables and transitions efficiently." },
  { id: "dsa-dp-intervals", title: "Dynamic Programming — Intervals", category: "DSA", complexity: "Hard", tags: ["interval-dp", "burst-balloons", "matrix-chain", "palindrome-partitioning", "merge-intervals"], description: "Solve interval DP problems by thinking inside-out: Burst Balloons, Palindrome Partitioning, Matrix Chain Multiplication. Define interval [i, j] state." },
  { id: "dsa-greedy", title: "Greedy Algorithms", category: "DSA", complexity: "Medium", tags: ["greedy", "activity-selection", "huffman", "interval-scheduling", "local-optimal"], description: "Apply greedy strategies where locally optimal choices lead to globally optimal solutions: interval scheduling, coin change, and Huffman coding." },
  { id: "dsa-divide-conquer", title: "Divide & Conquer", category: "DSA", complexity: "Medium", tags: ["divide-conquer", "merge-sort", "master-theorem", "karatsuba", "closest-pair"], description: "Solve problems by dividing into independent subproblems, solving recursively, and combining results. Apply the Master Theorem for complexity analysis." },
  { id: "dsa-bit-manipulation", title: "Bit Manipulation", category: "DSA", complexity: "Medium", tags: ["bitwise", "xor", "bit-masking", "shift-operators", "power-of-two"], description: "Use AND, OR, XOR, and shift operators for O(1) tricks: checking powers of 2, counting set bits, finding single non-duplicate, and bit masking." },
  { id: "dsa-complexity", title: "Complexity Analysis & Big O", category: "DSA", complexity: "Easy", tags: ["big-o", "time-complexity", "space-complexity", "amortized", "recurrence"], description: "Analyze time and space complexity of algorithms. Apply Master Theorem to recursive algorithms. Distinguish between average, best, and worst-case." },

  // ── NEW: System Design ───────────────────────────────────────────────────────
  { id: "sys-fundamentals", title: "System Design Fundamentals & Approach", category: "System Design", complexity: "Medium", tags: ["system-design", "requirements", "estimation", "back-of-envelope", "interview-framework"], description: "Learn the 4-step system design interview framework: clarify requirements, estimate scale, design high-level architecture, and deep dive into components." },
  { id: "sys-scalability", title: "Scalability — Horizontal vs Vertical Scaling", category: "System Design", complexity: "Medium", tags: ["scalability", "horizontal-scaling", "vertical-scaling", "stateless", "auto-scaling"], description: "Understand when to scale up (bigger machines) vs scale out (more machines). Design stateless services that auto-scale under variable load." },
  { id: "sys-load-balancing", title: "Load Balancing — Algorithms & Types", category: "System Design", complexity: "Medium", tags: ["load-balancer", "round-robin", "least-connections", "layer4", "layer7", "health-checks"], description: "Compare L4 vs L7 load balancers, round-robin vs least-connections vs IP-hash algorithms, and active health checking for high availability." },
  { id: "sys-cdn", title: "CDN (Content Delivery Networks)", category: "System Design", complexity: "Medium", tags: ["cdn", "edge-caching", "origin-server", "ttl", "cloudfront", "cache-invalidation"], description: "Understand how CDNs reduce latency by caching static assets at edge locations globally. Design cache TTL policies and invalidation strategies." },
  { id: "sys-sql-nosql", title: "SQL vs NoSQL — When to Use What", category: "System Design", complexity: "Medium", tags: ["sql", "nosql", "acid", "base", "document-store", "wide-column", "schema"], description: "Choose between relational and NoSQL databases based on consistency needs, query patterns, scale, and schema flexibility. Understand ACID vs BASE tradeoffs." },
  { id: "sys-cap", title: "CAP Theorem & Consistency Models", category: "System Design", complexity: "Hard", tags: ["cap-theorem", "consistency", "availability", "partition-tolerance", "eventual-consistency", "strong-consistency"], description: "Understand why distributed systems can only guarantee two of three CAP properties. Compare strong, eventual, and causal consistency models with real examples." },
  { id: "sys-rate-limiting", title: "Rate Limiting & Throttling", category: "System Design", complexity: "Medium", tags: ["rate-limiting", "token-bucket", "leaky-bucket", "sliding-window", "throttling", "ddos"], description: "Implement token bucket, leaky bucket, and sliding window counter algorithms for API rate limiting. Design distributed rate limiters with Redis." },
  { id: "sys-api-design", title: "API Design — REST, GraphQL, gRPC", category: "System Design", complexity: "Medium", tags: ["rest", "graphql", "grpc", "api-design", "versioning", "pagination", "idempotency"], description: "Design clean REST APIs (versioning, pagination, idempotency) vs GraphQL (flexible queries, N+1 problem) vs gRPC (binary, streaming, contract-first)." },
  { id: "sys-message-queues", title: "Message Queues & Event-Driven Architecture", category: "System Design", complexity: "Medium", tags: ["message-queue", "kafka", "rabbitmq", "pub-sub", "at-least-once", "event-driven"], description: "Decouple services using message brokers. Compare Kafka (event streaming, retention) vs RabbitMQ (task queues). Design at-least-once and exactly-once delivery." },
  { id: "sys-service-discovery", title: "Service Discovery & API Gateway", category: "System Design", complexity: "Medium", tags: ["service-discovery", "api-gateway", "consul", "eureka", "nginx", "reverse-proxy"], description: "Route service-to-service traffic using client-side vs server-side discovery. Design API gateways for auth, rate limiting, and request routing." },
  { id: "sys-consistent-hashing", title: "Consistent Hashing", category: "System Design", complexity: "Hard", tags: ["consistent-hashing", "virtual-nodes", "hash-ring", "rebalancing", "distributed-cache"], description: "Distribute data across nodes using a hash ring so only K/N keys move when a node is added or removed. Understand virtual nodes for load balance." },
  { id: "sys-distributed-tx", title: "Distributed Transactions & Saga Pattern", category: "System Design", complexity: "Hard", tags: ["distributed-transactions", "saga", "2pc", "choreography", "orchestration", "compensating-transactions"], description: "Coordinate multi-service transactions using Two-Phase Commit (strong consistency) or Saga pattern (eventual consistency with compensating transactions)." },
  { id: "sys-circuit-breaker", title: "Circuit Breaker & Resilience Patterns", category: "System Design", complexity: "Medium", tags: ["circuit-breaker", "retry", "bulkhead", "fallback", "timeout", "resilience4j"], description: "Prevent cascading failures using circuit breaker (closed/open/half-open states), retry with exponential backoff, bulkhead isolation, and graceful fallbacks." },
  { id: "sys-design-url-shortener", title: "Designing a URL Shortener", category: "System Design", complexity: "Hard", tags: ["url-shortener", "base62", "hashing", "redirect", "analytics", "key-generation"], description: "Design a TinyURL-style system handling 100M+ URLs. Cover base-62 encoding, key generation service, caching with Redis, and 301 vs 302 redirects." },
  { id: "sys-design-social-feed", title: "Designing a Social Media Feed (Instagram/Twitter)", category: "System Design", complexity: "Hard", tags: ["social-feed", "fan-out", "timeline", "celebrity-problem", "newsfeed", "ranking"], description: "Design an Instagram/Twitter news feed with fan-out-on-write vs fan-out-on-read tradeoffs. Handle celebrity accounts, ranking algorithms, and feed pagination." },
  { id: "sys-design-chat", title: "Designing a Chat System (WhatsApp)", category: "System Design", complexity: "Hard", tags: ["chat-system", "websocket", "long-polling", "message-storage", "presence", "end-to-end-encryption"], description: "Build a WhatsApp-scale chat system using WebSockets for real-time messaging, presence detection, message ordering, offline delivery, and E2E encryption design." },
  { id: "sys-design-video", title: "Designing a Video Streaming Service (Netflix/YouTube)", category: "System Design", complexity: "Hard", tags: ["video-streaming", "cdn", "hls", "adaptive-bitrate", "encoding", "chunked-upload"], description: "Design Netflix/YouTube: video chunked upload pipeline, transcoding to multiple resolutions, HLS adaptive bitrate streaming, CDN distribution, and recommendation edge cases." },

  // ── NEW: Full Stack ──────────────────────────────────────────────────────────
  { id: "fs-hooks", title: "React Hooks Deep Dive (useState, useEffect, useRef, useMemo, useCallback)", category: "Full Stack", complexity: "Medium", tags: ["react-hooks", "useEffect", "useMemo", "useCallback", "useRef", "custom-hooks"], description: "Master all built-in React hooks: dependency arrays, closures in effects, memoization strategies, and building reusable custom hooks." },
  { id: "fs-state-mgmt", title: "React State Management (Context API, Redux, Zustand)", category: "Full Stack", complexity: "Medium", tags: ["redux", "zustand", "context-api", "state-management", "global-state", "react-query"], description: "Choose and implement the right state management solution: local state, Context API, Redux Toolkit, or Zustand. Understand when server state (React Query) is more appropriate." },
  { id: "fs-ts-basics", title: "TypeScript Fundamentals for React", category: "Full Stack", complexity: "Medium", tags: ["typescript", "types", "interfaces", "enums", "type-inference", "react-typescript"], description: "Type React components, hooks, and events with TypeScript. Understand type inference, interface vs type, and common patterns for typed props and state." },
  { id: "fs-ts-advanced", title: "TypeScript Advanced (Generics, Utility Types, Type Guards)", category: "Full Stack", complexity: "Hard", tags: ["generics", "utility-types", "type-guards", "conditional-types", "mapped-types", "infer"], description: "Use TypeScript generics, mapped types, conditional types, and utility types (Partial, Pick, Omit, ReturnType) to build type-safe libraries and APIs." },
  { id: "fs-css", title: "CSS Fundamentals & Flexbox / Grid", category: "Full Stack", complexity: "Easy", tags: ["css", "flexbox", "grid", "responsive", "box-model", "specificity"], description: "Master CSS box model, specificity, Flexbox for 1D layouts, and CSS Grid for 2D layouts. Build fully responsive designs without frameworks." },
  { id: "fs-tailwind", title: "Tailwind CSS", category: "Full Stack", complexity: "Easy", tags: ["tailwind", "utility-first", "responsive", "dark-mode", "jit", "design-system"], description: "Build UIs rapidly with utility-first Tailwind CSS. Understand the JIT compiler, responsive breakpoints, dark mode, and extracting components with @apply." },
  { id: "fs-performance", title: "Web Performance Optimization (Lazy Loading, Code Splitting, Memoization)", category: "Full Stack", complexity: "Medium", tags: ["lazy-loading", "code-splitting", "memoization", "bundle-size", "lighthouse", "tree-shaking"], description: "Optimize React apps with lazy imports, Suspense, React.memo, useMemo, and tree shaking. Measure performance with Lighthouse and Chrome DevTools." },
  { id: "fs-web-vitals", title: "Core Web Vitals & SEO Basics", category: "Full Stack", complexity: "Medium", tags: ["core-web-vitals", "lcp", "fid", "cls", "seo", "meta-tags", "structured-data"], description: "Understand LCP, CLS, and INP metrics and techniques to improve them. Implement SEO-friendly meta tags, Open Graph, structured data, and sitemaps." },
  { id: "fs-frontend-testing", title: "Frontend Testing (Jest, React Testing Library)", category: "Full Stack", complexity: "Medium", tags: ["jest", "react-testing-library", "unit-testing", "integration-testing", "mocking", "test-driven-development"], description: "Write maintainable React tests using RTL's user-centric queries. Mock APIs, test async flows, and integrate testing into CI pipelines." },
  { id: "fs-express", title: "Express.js — Building REST APIs", category: "Full Stack", complexity: "Medium", tags: ["express", "rest-api", "routing", "middleware", "error-handling", "cors"], description: "Build production-grade REST APIs with Express: routing, middleware pipeline, error handling, CORS, input validation with Zod/Joi, and rate limiting." },
  { id: "fs-graphql", title: "GraphQL — Schema, Resolvers, Queries & Mutations", category: "Full Stack", complexity: "Medium", tags: ["graphql", "schema", "resolvers", "mutations", "subscriptions", "dataloader", "n+1"], description: "Design GraphQL schemas, implement resolvers, solve the N+1 problem with DataLoader, and handle subscriptions for real-time data." },
  { id: "fs-auth-jwt", title: "Authentication — JWT, Sessions, Cookies", category: "Full Stack", complexity: "Medium", tags: ["jwt", "sessions", "cookies", "access-token", "refresh-token", "httponly"], description: "Implement stateless JWT auth (access + refresh token rotation) and stateful session-cookie auth. Understand HttpOnly cookies, CSRF protection, and token storage security." },
  { id: "fs-oauth2", title: "OAuth2 & OpenID Connect", category: "Full Stack", complexity: "Hard", tags: ["oauth2", "oidc", "authorization-code", "pkce", "scopes", "id-token"], description: "Implement OAuth2 Authorization Code flow with PKCE for SPAs. Integrate third-party providers (Google, GitHub) and validate ID tokens with OpenID Connect." },
  { id: "fs-middleware", title: "Middleware, Error Handling & Validation", category: "Full Stack", complexity: "Medium", tags: ["middleware", "error-handling", "validation", "zod", "joi", "express-middleware"], description: "Design layered Express middleware for logging, auth, validation (Zod/Joi), and centralized error handling. Distinguish operational from programmer errors." },
  { id: "fs-file-uploads", title: "File Uploads & Storage", category: "Full Stack", complexity: "Medium", tags: ["file-uploads", "multipart", "multer", "s3", "presigned-urls", "stream"], description: "Handle multipart file uploads with Multer, stream large files to S3 with presigned URLs, validate MIME types, and implement virus scanning patterns." },
  { id: "fs-websockets", title: "WebSockets & Real-time Communication", category: "Full Stack", complexity: "Medium", tags: ["websockets", "socket-io", "sse", "long-polling", "real-time", "rooms"], description: "Build real-time features using WebSockets (Socket.IO), Server-Sent Events, and long polling. Understand when to use each, and how to scale with Redis pub/sub." },
  { id: "fs-message-queues", title: "Message Queues with Kafka & RabbitMQ", category: "Full Stack", complexity: "Hard", tags: ["kafka", "rabbitmq", "producer-consumer", "topics", "queues", "dead-letter", "at-least-once"], description: "Integrate Kafka (log-based, high throughput, replay) and RabbitMQ (task queues, routing, dead-letter queues) into Node.js backends. Handle backpressure and message ordering." },
  { id: "fs-redis-caching", title: "Caching with Redis", category: "Full Stack", complexity: "Medium", tags: ["redis", "caching", "ttl", "eviction", "pub-sub", "session-storage", "cache-aside"], description: "Use Redis for cache-aside, write-through, and session storage patterns. Configure TTL, eviction policies (LRU), and pub/sub channels in Node.js applications." },
  { id: "fs-backend-testing", title: "Backend Testing (Unit, Integration, E2E)", category: "Full Stack", complexity: "Medium", tags: ["unit-testing", "integration-testing", "supertest", "jest", "test-containers", "e2e"], description: "Test Node.js APIs at multiple levels: unit test with Jest, integration test HTTP endpoints with Supertest, and run E2E tests against real databases with Testcontainers." },
  { id: "fs-api-security", title: "API Security Best Practices", category: "Full Stack", complexity: "Hard", tags: ["api-security", "owasp", "injection", "rate-limiting", "input-sanitization", "dependency-scanning"], description: "Harden APIs against OWASP Top 10 threats: SQL injection, broken auth, security misconfiguration. Implement input sanitization, rate limiting, and dependency auditing." },
  { id: "fs-nextjs", title: "Server-Side Rendering with Next.js", category: "Full Stack", complexity: "Medium", tags: ["nextjs", "ssr", "ssg", "isr", "app-router", "server-components", "streaming"], description: "Build SEO-friendly apps with Next.js: compare SSR, SSG, and ISR strategies. Use the App Router, React Server Components, and streaming for performance." },
  { id: "fs-deployment", title: "Building & Deploying a Full Stack App End-to-End", category: "Full Stack", complexity: "Hard", tags: ["deployment", "docker", "ci-cd", "vercel", "aws", "environment-variables", "zero-downtime"], description: "Deploy a full stack Next.js app: containerize with Docker, configure CI/CD with GitHub Actions, manage environment secrets, and implement zero-downtime deployments on AWS/Vercel." },

  // ── NEW: Cloud & DevOps ──────────────────────────────────────────────────────
  { id: "cloud-aws-core", title: "AWS Core Concepts & Global Infrastructure", category: "Cloud & DevOps", complexity: "Easy", tags: ["aws", "regions", "availability-zones", "edge-locations", "shared-responsibility", "global-infrastructure"], description: "Understand AWS global infrastructure (regions, AZs, edge locations), the shared responsibility model, pricing models, and how to navigate the AWS ecosystem." },
  { id: "cloud-ec2", title: "EC2 — Compute, AMIs, Auto Scaling Groups", category: "Cloud & DevOps", complexity: "Medium", tags: ["ec2", "ami", "instance-types", "auto-scaling", "launch-template", "spot-instances"], description: "Configure EC2 instances, create AMIs, design Auto Scaling Groups with launch templates, and choose between On-Demand, Reserved, and Spot pricing." },
  { id: "cloud-s3", title: "S3 — Storage, Buckets, Policies, Lifecycle Rules", category: "Cloud & DevOps", complexity: "Medium", tags: ["s3", "buckets", "iam-policies", "lifecycle-rules", "versioning", "presigned-urls", "storage-classes"], description: "Design S3 bucket policies, configure lifecycle transitions (Standard → Glacier), enable versioning, generate presigned URLs, and optimize costs with storage classes." },
  { id: "cloud-iam", title: "IAM — Users, Roles, Policies, Best Practices", category: "Cloud & DevOps", complexity: "Medium", tags: ["iam", "roles", "policies", "least-privilege", "sts", "assume-role", "service-accounts"], description: "Design IAM with least-privilege: users, groups, roles, and inline vs managed policies. Use STS AssumeRole for cross-account access and EC2 instance profiles." },
  { id: "cloud-vpc", title: "VPC — Subnets, Security Groups, NACLs, Peering", category: "Cloud & DevOps", complexity: "Hard", tags: ["vpc", "subnets", "security-groups", "nacl", "peering", "nat-gateway", "internet-gateway"], description: "Design a production VPC: public/private subnets, security groups (stateful) vs NACLs (stateless), NAT gateways for private subnets, and VPC peering for multi-account setups." },
  { id: "cloud-rds", title: "RDS & Aurora — Managed Databases on AWS", category: "Cloud & DevOps", complexity: "Medium", tags: ["rds", "aurora", "multi-az", "read-replicas", "parameter-groups", "automated-backups"], description: "Deploy RDS PostgreSQL with Multi-AZ for high availability and read replicas for horizontal read scaling. Compare RDS vs Aurora performance and cost." },
  { id: "cloud-lambda", title: "Lambda & Serverless Architecture", category: "Cloud & DevOps", complexity: "Medium", tags: ["lambda", "serverless", "cold-start", "event-triggers", "concurrency", "layers"], description: "Build event-driven functions with Lambda: handle cold starts, configure concurrency limits, use layers for dependencies, and trigger from API Gateway, S3, SQS, and DynamoDB Streams." },
  { id: "cloud-api-gateway", title: "API Gateway — Building Serverless APIs", category: "Cloud & DevOps", complexity: "Medium", tags: ["api-gateway", "lambda-proxy", "authorizer", "throttling", "cors", "stages", "serverless"], description: "Build REST and HTTP APIs with AWS API Gateway: integrate with Lambda, configure authorizers (JWT/Cognito), throttle requests, manage stages, and handle CORS." },
  { id: "cloud-cloudfront", title: "CloudFront — CDN & Edge Caching", category: "Cloud & DevOps", complexity: "Medium", tags: ["cloudfront", "cdn", "edge-caching", "distributions", "cache-behaviors", "lambda-at-edge", "ssl"], description: "Distribute content globally with CloudFront: configure origins (S3, ALB), cache behaviors per path pattern, Lambda@Edge for personalization, and custom SSL certificates." },
  { id: "cloud-aws-saa", title: "AWS SAA Exam Key Concepts & Practice", category: "Cloud & DevOps", complexity: "Hard", tags: ["aws-saa", "well-architected", "disaster-recovery", "high-availability", "cost-optimization", "exam-prep"], description: "Consolidate AWS SAA knowledge: well-architected framework (5 pillars), disaster recovery strategies (RPO/RTO), cost optimization patterns, and high-availability design." },
  { id: "cloud-linux", title: "Linux Command Line for Developers", category: "Cloud & DevOps", complexity: "Easy", tags: ["linux", "bash", "permissions", "grep", "awk", "systemd", "ssh", "cron"], description: "Master essential Linux commands for DevOps: file permissions, process management, systemd services, SSH key management, cron jobs, and shell scripting basics." },
  { id: "cloud-git", title: "Git Advanced (Branching Strategies, Rebase, Cherry Pick)", category: "Cloud & DevOps", complexity: "Medium", tags: ["git", "rebase", "cherry-pick", "gitflow", "trunk-based", "merge-vs-rebase", "stash"], description: "Master advanced Git: interactive rebase, cherry-pick, stash, reflog recovery. Compare GitFlow vs trunk-based development for team workflows." },
  { id: "cloud-k8s-basics", title: "Kubernetes — Pods, Deployments, Services, Ingress", category: "Cloud & DevOps", complexity: "Medium", tags: ["kubernetes", "pods", "deployments", "services", "ingress", "kubectl", "namespaces"], description: "Deploy applications on Kubernetes: create Pods, Deployments with rolling updates, Services (ClusterIP/NodePort/LoadBalancer), and Ingress rules for HTTP routing." },
  { id: "cloud-k8s-advanced", title: "Kubernetes — ConfigMaps, Secrets, Scaling & Monitoring", category: "Cloud & DevOps", complexity: "Hard", tags: ["configmaps", "secrets", "hpa", "resource-limits", "liveness-readiness", "helm", "service-mesh"], description: "Manage Kubernetes configuration with ConfigMaps/Secrets, configure HPA for auto-scaling, set resource requests/limits, implement health probes, and deploy with Helm charts." },
  { id: "cloud-terraform", title: "Infrastructure as Code with Terraform", category: "Cloud & DevOps", complexity: "Medium", tags: ["terraform", "hcl", "state", "modules", "plan-apply", "remote-state", "workspaces"], description: "Write declarative AWS infrastructure with Terraform HCL: resources, variables, outputs, modules, remote state in S3, and workspace-based environment management." },
  { id: "cloud-nginx", title: "Nginx — Reverse Proxy, Load Balancing, SSL Termination", category: "Cloud & DevOps", complexity: "Medium", tags: ["nginx", "reverse-proxy", "load-balancing", "ssl-termination", "upstream", "rate-limiting", "gzip"], description: "Configure Nginx as a reverse proxy and load balancer: upstream server groups, SSL/TLS termination with Let's Encrypt, rate limiting, gzip compression, and caching headers." },
  { id: "cloud-monitoring", title: "Monitoring & Alerting (Prometheus & Grafana)", category: "Cloud & DevOps", complexity: "Medium", tags: ["prometheus", "grafana", "metrics", "alertmanager", "scraping", "dashboards", "sli-slo"], description: "Instrument applications with Prometheus metrics, define SLIs/SLOs, build Grafana dashboards, configure Alertmanager rules, and implement RED (Rate/Error/Duration) monitoring." },
  { id: "cloud-logging", title: "Log Management (ELK Stack — Elasticsearch, Logstash, Kibana)", category: "Cloud & DevOps", complexity: "Medium", tags: ["elk-stack", "elasticsearch", "logstash", "kibana", "log-aggregation", "structured-logging", "fluentd"], description: "Aggregate and search logs with the ELK stack: ship logs with Logstash/Fluentd, index in Elasticsearch, and visualize in Kibana. Implement structured JSON logging." },
  { id: "cloud-sre", title: "Site Reliability Engineering (SRE) Concepts", category: "Cloud & DevOps", complexity: "Hard", tags: ["sre", "sli", "slo", "error-budget", "toil", "blameless-postmortem", "reliability"], description: "Apply SRE principles: define SLIs/SLOs/SLAs, manage error budgets, reduce operational toil with automation, and run blameless postmortems for incident management." },
  { id: "cloud-devsecops", title: "DevSecOps — Security in CI/CD Pipelines", category: "Cloud & DevOps", complexity: "Hard", tags: ["devsecops", "sast", "dast", "dependency-scanning", "container-scanning", "secrets-detection", "shift-left"], description: "Embed security into CI/CD: SAST (static analysis), DAST (dynamic testing), dependency auditing (Snyk/OWASP), container image scanning (Trivy), and secret detection (GitLeaks)." },

  // ── NEW: Databases ───────────────────────────────────────────────────────────
  { id: "db-relational", title: "Relational Database Fundamentals", category: "Databases", complexity: "Easy", tags: ["relational-db", "tables", "primary-key", "foreign-key", "schema", "er-diagram"], description: "Understand relational model foundations: tables, primary/foreign keys, entity-relationship diagrams, and basic normalization principles." },
  { id: "db-sql", title: "SQL Deep Dive — Joins, Subqueries, Window Functions", category: "Databases", complexity: "Medium", tags: ["sql", "joins", "subqueries", "window-functions", "cte", "aggregation", "explain"], description: "Master advanced SQL: all JOIN types, correlated subqueries, CTEs (WITH), window functions (ROW_NUMBER, LAG, LEAD, PARTITION BY), and query execution plans with EXPLAIN." },
  { id: "db-postgres-tx", title: "PostgreSQL — Transactions, Locks & MVCC", category: "Databases", complexity: "Hard", tags: ["postgresql", "transactions", "mvcc", "row-locking", "deadlock", "isolation-levels", "vacuum"], description: "Deep dive into PostgreSQL transaction internals: MVCC (Multi-Version Concurrency Control), row-level locking, deadlock detection, isolation levels, and VACUUM for bloat." },
  { id: "db-normalization", title: "Database Normalization (1NF, 2NF, 3NF, BCNF)", category: "Databases", complexity: "Medium", tags: ["normalization", "1nf", "2nf", "3nf", "bcnf", "functional-dependency", "denormalization"], description: "Eliminate data redundancy through normalization: understand functional dependencies, walk through 1NF through BCNF transformations, and know when to intentionally denormalize." },
  { id: "db-nosql", title: "NoSQL Fundamentals — Types & Use Cases", category: "Databases", complexity: "Medium", tags: ["nosql", "document-store", "key-value", "wide-column", "graph-db", "mongodb", "dynamodb"], description: "Compare NoSQL categories: document (MongoDB), key-value (Redis/DynamoDB), wide-column (Cassandra), and graph (Neo4j) databases. Choose based on query patterns and scale." },
  { id: "db-mongodb", title: "MongoDB — Documents, Collections, Aggregation Pipeline", category: "Databases", complexity: "Medium", tags: ["mongodb", "documents", "aggregation-pipeline", "indexes", "sharding", "atlas", "schema-design"], description: "Design MongoDB schemas for embedded vs referenced documents. Build aggregation pipelines ($match, $group, $lookup), create compound indexes, and understand MongoDB Atlas." },
  { id: "db-redis", title: "Redis — Data Structures, Caching, Pub/Sub, TTL", category: "Databases", complexity: "Medium", tags: ["redis", "strings", "lists", "sets", "sorted-sets", "pub-sub", "ttl", "lua-scripting"], description: "Use Redis data structures (Strings, Lists, Sets, Sorted Sets, Hashes) for caching, leaderboards, rate limiting, pub/sub messaging, and session storage." },
  { id: "db-sharding", title: "Database Sharding & Partitioning", category: "Databases", complexity: "Hard", tags: ["sharding", "partitioning", "shard-key", "range-sharding", "hash-sharding", "hotspot", "rebalancing"], description: "Horizontally partition databases with range-based, hash-based, and directory-based sharding. Manage hotspot avoidance, cross-shard queries, and rebalancing." },
  { id: "db-replication", title: "Database Replication — Master-Slave, Multi-Master", category: "Databases", complexity: "Hard", tags: ["replication", "leader-follower", "multi-leader", "leaderless", "replication-lag", "quorum"], description: "Replicate data for high availability: leader-follower (single leader), multi-leader (active-active), and leaderless (Dynamo-style quorum) replication models and tradeoffs." },
  { id: "db-cap", title: "CAP Theorem in Practice", category: "Databases", complexity: "Hard", tags: ["cap-theorem", "consistency", "availability", "partition-tolerance", "cassandra", "zookeeper", "dynamo"], description: "Apply CAP theorem to real databases: Cassandra (AP), HBase (CP), and PostgreSQL (CA in non-partitioned settings). Understand PACELC as an extension of CAP." },
  { id: "db-timeseries", title: "Time-Series Databases (InfluxDB Concepts)", category: "Databases", complexity: "Medium", tags: ["time-series", "influxdb", "metrics", "downsampling", "retention-policies", "iot", "prometheus"], description: "Store and query time-stamped data with InfluxDB: measurements, tags, fields, continuous queries for downsampling, and retention policies for IoT and monitoring use cases." },
  { id: "db-elasticsearch", title: "Search Engines — Elasticsearch Fundamentals", category: "Databases", complexity: "Medium", tags: ["elasticsearch", "inverted-index", "mapping", "query-dsl", "relevance", "aggregations", "full-text-search"], description: "Power full-text search with Elasticsearch: understand inverted index, define mappings, write Query DSL (match, bool, must/should), and build aggregations for analytics." },
  { id: "db-warehousing", title: "Data Warehousing Concepts (BigQuery, Redshift)", category: "Databases", complexity: "Medium", tags: ["data-warehousing", "olap", "bigquery", "redshift", "columnar-storage", "star-schema", "etl"], description: "Design OLAP data warehouses with columnar storage. Compare BigQuery (serverless, separated storage/compute) vs Redshift (provisioned). Implement star/snowflake schemas and ETL pipelines." },
  { id: "db-orm", title: "ORM vs Raw Queries — Prisma, Sequelize, TypeORM", category: "Databases", complexity: "Medium", tags: ["orm", "prisma", "sequelize", "typeorm", "migrations", "n+1", "raw-queries"], description: "Use Prisma, Sequelize, and TypeORM for database interaction. Understand N+1 query problems, eager/lazy loading, schema migrations, and when raw SQL outperforms ORM." },

  // ── NEW: Security ────────────────────────────────────────────────────────────
  { id: "sec-fundamentals", title: "Security Fundamentals & CIA Triad", category: "Security", complexity: "Easy", tags: ["cia-triad", "confidentiality", "integrity", "availability", "threat-modeling", "defense-in-depth"], description: "Understand the CIA Triad (Confidentiality, Integrity, Availability), threat modeling, defense-in-depth strategy, and the principle of least privilege." },
  { id: "sec-owasp-auth", title: "OWASP Top 10 — Broken Auth, IDOR, Security Misconfiguration", category: "Security", complexity: "Medium", tags: ["broken-authentication", "idor", "security-misconfiguration", "owasp", "insecure-design", "ssrf"], description: "Prevent broken authentication (credential stuffing, weak passwords), IDOR (insecure direct object reference), security misconfiguration, and SSRF vulnerabilities." },
  { id: "sec-tls", title: "HTTPS, TLS & SSL Certificates", category: "Security", complexity: "Medium", tags: ["https", "tls", "ssl", "certificate-authority", "handshake", "hsts", "certificate-pinning"], description: "Understand TLS handshake (key exchange, cipher negotiation), certificate chain of trust, HSTS, certificate pinning, and how to configure HTTPS properly in production." },
  { id: "sec-crypto", title: "Cryptography Basics — Symmetric vs Asymmetric", category: "Security", complexity: "Medium", tags: ["cryptography", "symmetric", "asymmetric", "aes", "rsa", "diffie-hellman", "elliptic-curve"], description: "Understand symmetric encryption (AES), asymmetric encryption (RSA, ECC), and key exchange (Diffie-Hellman). Know when to use each and how TLS combines them." },
  { id: "sec-hashing", title: "Hashing Algorithms (MD5, SHA, bcrypt, Argon2)", category: "Security", complexity: "Medium", tags: ["hashing", "md5", "sha-256", "bcrypt", "argon2", "rainbow-tables", "salting"], description: "Choose the right hashing algorithm: MD5/SHA for data integrity (not passwords), bcrypt/Argon2 for password hashing. Understand salting and rainbow table attacks." },
  { id: "sec-pki", title: "Public Key Infrastructure (PKI) & Digital Signatures", category: "Security", complexity: "Hard", tags: ["pki", "digital-signatures", "certificate-authority", "x509", "rsa", "ecdsa", "code-signing"], description: "Understand PKI: certificate authorities, X.509 certificates, digital signatures (RSA/ECDSA), certificate revocation (CRL, OCSP), and code signing for software distribution." },
  { id: "sec-jwt", title: "JWT Security — Common Vulnerabilities & Best Practices", category: "Security", complexity: "Medium", tags: ["jwt", "alg-none", "secret-rotation", "rs256", "token-expiry", "refresh-token", "jku-attack"], description: "Secure JWTs against alg:none attacks, key confusion (HS256 vs RS256), jku/x5u header injection, and improper secret management. Implement token rotation and short expiry." },
  { id: "sec-secrets", title: "Secrets Management (Vault, AWS Secrets Manager)", category: "Security", complexity: "Medium", tags: ["secrets-management", "vault", "aws-secrets-manager", "env-variables", "rotation", "dynamic-secrets"], description: "Manage application secrets securely: avoid hardcoding, use HashiCorp Vault (dynamic secrets, leases) or AWS Secrets Manager (auto-rotation), and inject secrets at runtime." },
  { id: "sec-ddos", title: "Rate Limiting & DDoS Protection", category: "Security", complexity: "Medium", tags: ["ddos", "rate-limiting", "cloudflare", "waf", "ip-blocking", "bot-detection", "captcha"], description: "Defend against DDoS attacks with CDN-level protection (Cloudflare/AWS Shield), WAF rules, IP rate limiting, CAPTCHA challenges, and bot detection strategies." },
  { id: "sec-container-security", title: "Container & Cloud Security Best Practices", category: "Security", complexity: "Hard", tags: ["container-security", "image-scanning", "least-privilege", "seccomp", "pod-security", "ecr", "trivy"], description: "Harden containers: scan images with Trivy, use non-root users, apply seccomp profiles, configure Kubernetes PodSecurityAdmission, and manage ECR image access with IAM." },
  { id: "sec-pentest", title: "Penetration Testing Concepts for Developers", category: "Security", complexity: "Medium", tags: ["penetration-testing", "vulnerability-assessment", "burp-suite", "recon", "exploit", "remediation", "owasp-zap"], description: "Understand penetration testing phases: reconnaissance, scanning, exploitation, and reporting. Use OWASP ZAP and Burp Suite to test your own APIs and web applications." },
  { id: "sec-zero-trust", title: "Zero Trust Architecture", category: "Security", complexity: "Hard", tags: ["zero-trust", "bza", "microsegmentation", "identity-verification", "never-trust-always-verify", "mtls", "spiffe"], description: "Design Zero Trust networks where no implicit trust is granted: verify every identity, microsegment networks, enforce mTLS between services, and implement continuous authorization." },

  // ── NEW: CS Fundamentals ─────────────────────────────────────────────────────
  { id: "cs-http", title: "HTTP Deep Dive — Methods, Status Codes, Headers", category: "CS Fundamentals", complexity: "Easy", tags: ["http", "methods", "status-codes", "headers", "idempotency", "content-negotiation", "caching"], description: "Master HTTP semantics: GET/POST/PUT/PATCH/DELETE idempotency, status code ranges, important headers (Cache-Control, ETag, Authorization), and content negotiation." },
  { id: "cs-http3", title: "HTTP/2 & HTTP/3 — What Changed & Why", category: "CS Fundamentals", complexity: "Medium", tags: ["http2", "http3", "quic", "multiplexing", "hol-blocking", "header-compression", "0-rtt"], description: "Understand HTTP/2 multiplexing and HPACK compression. See why HTTP/3 switches to QUIC (UDP) to eliminate head-of-line blocking and reduce connection latency with 0-RTT." },
  { id: "cs-api-comparison", title: "REST vs GraphQL vs gRPC — Detailed Comparison", category: "CS Fundamentals", complexity: "Medium", tags: ["rest", "graphql", "grpc", "protobuf", "over-fetching", "under-fetching", "streaming"], description: "Compare REST (resource-based, HTTP caching) vs GraphQL (flexible queries, N+1 problem) vs gRPC (binary protobuf, streaming, strong contracts). Choose the right API for each use case." },
  { id: "cs-websockets", title: "WebSockets & Server-Sent Events", category: "CS Fundamentals", complexity: "Medium", tags: ["websockets", "sse", "long-polling", "bidirectional", "upgrade-header", "heartbeat", "scaling"], description: "Enable real-time communication: WebSockets (bidirectional, TCP upgrade) vs SSE (server push, HTTP/1.1) vs long polling. Handle connection scaling with load balancers." },
  { id: "cs-concurrency", title: "Concurrency & Parallelism", category: "CS Fundamentals", complexity: "Hard", tags: ["concurrency", "parallelism", "threads", "async", "event-loop", "goroutines", "actor-model"], description: "Distinguish concurrency (handling many tasks) from parallelism (executing tasks simultaneously). Compare threads, async/await, goroutines, and the actor model for concurrent design." },
  { id: "cs-memory", title: "Memory Management — Stack vs Heap", category: "CS Fundamentals", complexity: "Medium", tags: ["memory-management", "stack", "heap", "garbage-collection", "memory-leak", "reference-counting", "v8"], description: "Understand stack (function call frames, LIFO) vs heap (dynamic allocation). Study garbage collection strategies (mark-and-sweep, generational GC) and how V8 manages JS memory." },
  { id: "cs-deadlocks", title: "Deadlocks, Race Conditions & Mutexes", category: "CS Fundamentals", complexity: "Hard", tags: ["deadlock", "race-condition", "mutex", "semaphore", "coffman-conditions", "livelock", "atomic"], description: "Understand the four Coffman conditions for deadlocks, prevention strategies, race conditions with shared state, and synchronization primitives (mutex, semaphore, atomic operations)." },
  { id: "cs-cpu-scheduling", title: "CPU Scheduling Algorithms", category: "CS Fundamentals", complexity: "Medium", tags: ["cpu-scheduling", "round-robin", "fcfs", "sjf", "priority-scheduling", "preemptive", "context-switch"], description: "Compare CPU scheduling algorithms: FCFS, SJF, Round-Robin, and priority scheduling. Understand preemption, context switching overhead, and how real OS kernels schedule processes." },
  { id: "cs-virtual-memory", title: "Virtual Memory & Paging", category: "CS Fundamentals", complexity: "Medium", tags: ["virtual-memory", "paging", "page-table", "tlb", "page-fault", "demand-paging", "swap"], description: "Understand how virtual memory abstracts physical RAM: page tables, TLB for fast address translation, demand paging, page replacement algorithms (LRU, Clock), and swap space." },
  { id: "cs-filesystems", title: "File Systems & I/O", category: "CS Fundamentals", complexity: "Medium", tags: ["file-system", "inodes", "fat", "ext4", "buffered-io", "memory-mapped", "journaling"], description: "Understand file system structures: inodes, directory trees, ext4 journaling for crash recovery, and I/O modes (buffered, direct, memory-mapped). Relevant for database storage engines." },
  { id: "cs-compilers", title: "Compilers vs Interpreters — How Code Runs", category: "CS Fundamentals", complexity: "Medium", tags: ["compiler", "interpreter", "jit", "ast", "lexer", "parser", "bytecode", "v8", "llvm"], description: "Trace code from source to execution: lexing, parsing (AST), semantic analysis, code generation, and optimization. Compare AOT compilers vs interpreters vs JIT (V8, JVM)." },
  { id: "cs-patterns-creational", title: "Design Patterns — Creational (Singleton, Factory, Builder)", category: "CS Fundamentals", complexity: "Medium", tags: ["singleton", "factory", "abstract-factory", "builder", "prototype", "design-patterns", "creational"], description: "Implement Singleton (global instance), Factory/Abstract Factory (object creation without specifying class), and Builder (step-by-step complex object construction) patterns in JavaScript/TypeScript." },
  { id: "cs-patterns-structural", title: "Design Patterns — Structural (Adapter, Decorator, Proxy)", category: "CS Fundamentals", complexity: "Medium", tags: ["adapter", "decorator", "proxy", "facade", "composite", "structural-patterns", "wrapper"], description: "Apply structural patterns: Adapter (interface compatibility), Decorator (extend behavior without subclassing), Proxy (access control, lazy initialization), and Facade (simplified interface)." },
  { id: "cs-patterns-behavioral", title: "Design Patterns — Behavioral (Observer, Strategy, Command)", category: "CS Fundamentals", complexity: "Medium", tags: ["observer", "strategy", "command", "iterator", "state", "behavioral-patterns", "event-emitter"], description: "Implement behavioral patterns: Observer (event-driven decoupling), Strategy (interchangeable algorithms), Command (encapsulate actions as objects), and State (finite state machines)." },

  // ── NEW: Soft Skills ─────────────────────────────────────────────────────────
  { id: "soft-communication", title: "Communication for Engineers — Technical & Non-Technical Audiences", category: "Soft Skills", complexity: "Easy", tags: ["communication", "technical-writing", "presentations", "clarity", "rubber-duck-debugging", "documentation"], description: "Communicate complex technical concepts to both engineering peers and non-technical stakeholders. Structure explanations, use analogies, and write clear technical documents." },
  { id: "soft-ownership", title: "Ownership & Accountability Mindset", category: "Soft Skills", complexity: "Easy", tags: ["ownership", "accountability", "initiative", "follow-through", "leadership", "amazon-lp"], description: "Demonstrate Ownership (Amazon LP): proactively identify problems, follow through without being asked, and take responsibility for outcomes — even when things go wrong." },
  { id: "soft-feedback", title: "Giving & Receiving Feedback Effectively", category: "Soft Skills", complexity: "Easy", tags: ["feedback", "sbi-model", "growth-mindset", "radical-candor", "constructive-feedback", "psychological-safety"], description: "Give structured feedback using the SBI model (Situation-Behavior-Impact). Receive feedback with a growth mindset. Build psychological safety on engineering teams." },
  { id: "soft-agile", title: "Working in Agile & Scrum Teams", category: "Soft Skills", complexity: "Easy", tags: ["agile", "scrum", "sprint", "retrospective", "kanban", "story-points", "velocity"], description: "Operate effectively in Agile/Scrum teams: sprint planning, daily standups, retrospectives, backlog grooming, and Kanban flow. Understand story point estimation and velocity." },
  { id: "soft-documentation", title: "Writing Technical Documentation & ADRs", category: "Soft Skills", complexity: "Easy", tags: ["documentation", "adr", "architecture-decision-record", "readme", "runbook", "tech-spec", "rfcs"], description: "Write clear READMEs, runbooks, and Architecture Decision Records (ADRs). Structure tech specs and RFCs that align stakeholders and document decisions for future engineers." },
  { id: "soft-code-review", title: "Code Review Best Practices", category: "Soft Skills", complexity: "Medium", tags: ["code-review", "pr-etiquette", "constructive-comments", "reviewer-checklist", "author-responsibility", "automated-checks"], description: "Conduct effective code reviews: focus on logic and maintainability, write respectful comments, use automated linting/CI to reduce review friction, and respond to feedback professionally." },
  { id: "soft-stakeholder", title: "Stakeholder Management for Big 4 Consulting", category: "Soft Skills", complexity: "Medium", tags: ["stakeholder-management", "consulting", "executive-communication", "expectation-setting", "delivery", "big4"], description: "Manage stakeholder expectations in consulting and enterprise: executive-level communication, status reporting, scope management, and delivering bad news professionally." },
  { id: "soft-problem-solving", title: "Problem Solving & First Principles Thinking", category: "Soft Skills", complexity: "Medium", tags: ["problem-solving", "first-principles", "decomposition", "root-cause-analysis", "5-whys", "systems-thinking"], description: "Break down ambiguous problems using first principles and decomposition. Apply the 5 Whys for root cause analysis and systems thinking to understand emergent complexity." },
  { id: "soft-time-management", title: "Time Management & Prioritization (Eisenhower Matrix, Deep Work)", category: "Soft Skills", complexity: "Easy", tags: ["time-management", "eisenhower-matrix", "deep-work", "prioritization", "focus", "maker-manager-schedule"], description: "Prioritize engineering work with the Eisenhower Matrix (urgent/important quadrants), protect deep work blocks, and balance maker vs manager schedule conflicts." },
  { id: "soft-personal-brand", title: "Building Your Personal Brand (LinkedIn, GitHub, Blogging)", category: "Soft Skills", complexity: "Easy", tags: ["personal-brand", "linkedin", "github", "blogging", "open-source", "networking", "portfolio"], description: "Build a technical personal brand: craft a compelling LinkedIn profile and GitHub portfolio, write engineering blog posts, contribute to open source, and grow your professional network." },
  { id: "soft-negotiation", title: "Negotiating Offers — Salary, Equity & Benefits", category: "Soft Skills", complexity: "Medium", tags: ["negotiation", "salary", "equity", "rsu", "options", "total-compensation", "counter-offer"], description: "Negotiate total compensation confidently: understand base salary, RSU vesting schedules, option grants, signing bonuses, and how to structure counter-offers at FAANG and Big 4." },
];

// Augment the CHAPTERS with simple fallbacks for added chapters to ensure everything works
export const ALL_CHAPTERS = [
  ...CHAPTERS,
  ...ADDED_CHAPTERS.map(ch => ({
    ...ch,
    fallbackContent: `# ${ch.title}

## Introduction
This is a comprehensive study module on **${ch.title}**, specifically prepared for FAANG-level technical interview rounds.

## Core Concepts
1. **Key Concepts**: This topic covers essential designs, operations, and theoretical boundaries including: ${ch.tags.join(', ')}.
2. **Interview Context**: Senior developer interviews require discussing these concepts with respect to tradeoffs, horizontal scaling, memory consumption, and runtime complexity.

## Code Example / System Diagram
\`\`\`javascript
// Base pattern / mock implementation
console.log("Analyzing ${ch.id} properties...");
// Complexity: average case O(N log N) or O(1) metadata index lookups
\`\`\`

## Key Takeaways
- Be prepared to discuss architectural tradeoffs.
- Review standard definitions and flow charts for ${ch.title}.
- Test your understanding using the quiz mode!`,
    fallbackQuiz: [
      {
        question: `What is the core concern when analyzing ${ch.title}?`,
        options: [
          "Optimizing styling and markup sizes.",
          "Evaluating scaling bottlenecks, hardware resource bounds, or runtime/space complexities.",
          "Choosing variable names in camelCase.",
          "Running compilers on visual design assets."
        ],
        correct_index: 1,
        explanation: `Analyzing ${ch.title} focus on resolving scaling bottlenecks, resource bounds, or algorithmic time/space complexities.`
      },
      {
        question: `Which of the following tag/concept is directly associated with ${ch.title}?`,
        options: [
          "HTML5 flexbox positioning",
          `"${ch.tags[0]}"`,
          "Direct browser cookie decryption",
          "Node module packaging configuration"
        ],
        correct_index: 1,
        explanation: `"${ch.tags[0]}" is a key concept in ${ch.title}.`
      },
      {
        question: "In technical interviews, what is the best way to handle design trade-offs?",
        options: [
          "Claiming there is a single perfect solution with no downsides.",
          "Stating you will use whatever the manager tells you to use.",
          "Identifying pros and cons of multiple options and picking the best fit for the specific requirements.",
          "Refusing to answer trade-off questions."
        ],
        correct_index: 2,
        explanation: "Answering design questions requires weighing multiple approaches (e.g. read latency vs write throughput) and choosing the one matching the problem's constraints."
      },
      {
        question: "What is horizontal scaling (scaling out)?",
        options: [
          "Upgrading server CPU units.",
          "Adding more instances/servers to your resource pool and distributing load across them.",
          "Re-aligning components side-by-side in code files.",
          "Increasing horizontal layout widths."
        ],
        correct_index: 1,
        explanation: "Horizontal scaling involves adding more servers/machines to handle load, which is core to modern distributed computing architectures."
      },
      {
        question: "Why are code readability and design patterns valued in big tech companies?",
        options: [
          "They make the codebase compile faster.",
          "They enable thousands of engineers to collaborate, maintain, and scale the software system without compounding technical debt.",
          "They are required by internet service protocols.",
          "They prevent computers from overheating."
        ],
        correct_index: 1,
        explanation: "In large organizations, code is read and modified by many developers. Readability and clean patterns prevent bugs, reduce debt, and speed up features."
      }
    ]
  }))
];
