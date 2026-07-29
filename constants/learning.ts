export interface LearningGuide {
  slug: string
  title: string
  visualizerHref: string
  level: 'Foundation' | 'Core' | 'Advanced'
  minutes: number
  mentalModel: string
  purpose: string
  prerequisites: string[]
  invariants: string[]
  walkthrough: string[]
  practice: string[]
}

export const learningGuides: LearningGuide[] = [
  {
    slug: 'arrays',
    title: 'Arrays',
    visualizerHref: '/arrays',
    level: 'Foundation',
    minutes: 12,
    mentalModel: 'A numbered row of fixed-size slots stored next to one another.',
    purpose: 'Arrays make random access cheap because an index maps directly to an address. Insertion and deletion can be expensive because later values must shift.',
    prerequisites: [],
    invariants: [
      'Valid indices run from 0 through length minus 1.',
      'Every element is reached in constant time when its index is known.',
      'Shifting preserves the relative order of unaffected elements.',
    ],
    walkthrough: [
      'Insert near the front and count how many values move.',
      'Delete from the tail, then compare the trace with a front deletion.',
      'Run binary search only after sorting the values.',
    ],
    practice: [
      'Explain why appending can be O(1) while front insertion is O(n).',
      'Find the first and last valid index for an array of length eight.',
      'Predict the array after deleting index two.',
    ],
  },
  {
    slug: 'singly-linked-list',
    title: 'Singly Linked List',
    visualizerHref: '/singly-linked-list',
    level: 'Core',
    minutes: 14,
    mentalModel: 'A trail of nodes where each node knows only the next stop.',
    purpose: 'Linked lists trade direct indexing for cheap pointer changes. They are useful when structure changes matter more than random access.',
    prerequisites: ['arrays'],
    invariants: [
      'Head is either null or points to the first node.',
      'Every non-tail node points to exactly one next node.',
      'Tail points to null and no reachable node is skipped.',
    ],
    walkthrough: [
      'Insert at the head and identify the only pointer that changes.',
      'Insert in the middle and track predecessor, new node, and successor.',
      'Traverse to the tail and count the required pointer hops.',
    ],
    practice: [
      'Describe why indexing is O(n).',
      'List the pointer updates needed to delete the head.',
      'Explain what makes a node unreachable.',
    ],
  },
  {
    slug: 'doubly-linked-list',
    title: 'Doubly Linked List',
    visualizerHref: '/doubly-linked-list',
    level: 'Core',
    minutes: 14,
    mentalModel: 'A two-way chain where every node can name its neighbor on either side.',
    purpose: 'Backward links support reverse traversal and local deletion, but every mutation must maintain two directions.',
    prerequisites: ['singly-linked-list'],
    invariants: [
      'For adjacent nodes a and b, a.next is b and b.prev is a.',
      'Head.prev is null and tail.next is null.',
      'Forward and backward traversal visit the same nodes in opposite order.',
    ],
    walkthrough: [
      'Insert between two nodes and count four link assignments.',
      'Delete the tail and confirm the new tail has no next node.',
      'Compare forward and backward visit order.',
    ],
    practice: [
      'Explain the memory tradeoff versus a singly linked list.',
      'Identify the links repaired after a middle deletion.',
      'Describe when a tail pointer is valuable.',
    ],
  },
  {
    slug: 'circular-linked-list',
    title: 'Circular Linked List',
    visualizerHref: '/circular-linked-list',
    level: 'Core',
    minutes: 12,
    mentalModel: 'A loop of nodes with no null marker at the end.',
    purpose: 'Circular lists model repeating schedules and round-robin work where traversal naturally returns to the start.',
    prerequisites: ['singly-linked-list'],
    invariants: [
      'When non-empty, tail.next points to head.',
      'A full traversal stops after returning to the starting node.',
      'There is no null next pointer in a valid non-empty cycle.',
    ],
    walkthrough: [
      'Traverse once and note the explicit stopping condition.',
      'Insert at the head and watch the tail link move.',
      'Delete the only node and verify the structure becomes empty.',
    ],
    practice: [
      'Explain why a standard null-based loop would not terminate.',
      'Model three processes in a round-robin scheduler.',
      'List the special cases for deletion.',
    ],
  },
  {
    slug: 'stack',
    title: 'Stack',
    visualizerHref: '/stack',
    level: 'Foundation',
    minutes: 10,
    mentalModel: 'A pile where only the top item is directly available.',
    purpose: 'Stacks preserve last-in, first-out order for nested work, undo history, parsing, and call frames.',
    prerequisites: ['arrays'],
    invariants: [
      'Push and pop change only the top end.',
      'Pop returns the most recently pushed remaining value.',
      'An empty stack has no valid top value.',
    ],
    walkthrough: [
      'Push three values and predict their pop order.',
      'Peek, then confirm the stack size does not change.',
      'Pop until empty and inspect the underflow trace.',
    ],
    practice: [
      'Use a stack to reverse a short string.',
      'Explain how a stack validates nested brackets.',
      'Distinguish peek from pop.',
    ],
  },
  {
    slug: 'queue',
    title: 'Queue and Deque',
    visualizerHref: '/queue',
    level: 'Foundation',
    minutes: 14,
    mentalModel: 'A waiting line where work enters at one end and leaves at the other.',
    purpose: 'Queues preserve arrival order. Circular queues reuse storage, while deques permit operations at both ends.',
    prerequisites: ['arrays'],
    invariants: [
      'A basic queue dequeues the oldest remaining item.',
      'Front identifies the next removal and rear identifies the newest insertion.',
      'Circular indices wrap without changing logical order.',
    ],
    walkthrough: [
      'Enqueue three values and predict the dequeue sequence.',
      'Wrap a circular queue rear index back to zero.',
      'Compare deque insertion at front and rear.',
    ],
    practice: [
      'Explain why breadth-first search uses a queue.',
      'Detect full and empty circular queue states.',
      'Name one workload that needs a deque.',
    ],
  },
  {
    slug: 'recursion',
    title: 'Recursion',
    visualizerHref: '/recursion',
    level: 'Core',
    minutes: 16,
    mentalModel: 'A function pauses its current frame while a smaller version of the same problem runs.',
    purpose: 'Recursion expresses self-similar problems, but correctness depends on a reachable base case and progress toward it.',
    prerequisites: ['stack'],
    invariants: [
      'Every call owns a separate frame and local state.',
      'A base case returns without making another recursive call.',
      'Each recursive step must move closer to a base case.',
    ],
    walkthrough: [
      'Watch factorial frames grow, then unwind in reverse order.',
      'Compare repeated Fibonacci calls before memo reuse.',
      'Match each return value to the frame that receives it.',
    ],
    practice: [
      'Write the base case for summing numbers from one to n.',
      'Explain stack overflow in terms of missing progress.',
      'Trace factorial of four by hand.',
    ],
  },
  {
    slug: 'searching',
    title: 'Searching',
    visualizerHref: '/searching',
    level: 'Core',
    minutes: 12,
    mentalModel: 'Use known structure to eliminate places where the answer cannot be.',
    purpose: 'Linear search assumes nothing. Binary search spends a sorted-order guarantee to remove half of the remaining candidates per comparison.',
    prerequisites: ['arrays'],
    invariants: [
      'Linear search never skips an unchecked earlier position.',
      'Binary search requires ascending input.',
      'The binary search target, if present, remains inside low through high.',
    ],
    walkthrough: [
      'Search for the first and last array values linearly.',
      'Run binary search and track low, mid, and high.',
      'Compare comparisons for successful and unsuccessful searches.',
    ],
    practice: [
      'Explain why sorting cost matters before one binary search.',
      'Calculate the maximum comparisons for 32 sorted values.',
      'Identify the off-by-one condition that ends binary search.',
    ],
  },
  {
    slug: 'sorting',
    title: 'Sorting',
    visualizerHref: '/sorting',
    level: 'Core',
    minutes: 20,
    mentalModel: 'Repeatedly grow a region whose order is already guaranteed.',
    purpose: 'Sorting algorithms expose tradeoffs between comparisons, swaps, extra memory, stability, and divide-and-conquer structure.',
    prerequisites: ['arrays', 'recursion'],
    invariants: [
      'The algorithm-specific sorted region remains sorted after each outer step.',
      'Every output value comes from the input with the same frequency.',
      'Completion means every adjacent pair is in nondecreasing order.',
    ],
    walkthrough: [
      'Compare swap counts for bubble and selection sort.',
      'Watch insertion sort grow a sorted prefix.',
      'Follow one quicksort partition and one merge operation.',
    ],
    practice: [
      'Choose an algorithm for nearly sorted input.',
      'Explain stability using duplicate values.',
      'Distinguish in-place work from auxiliary arrays.',
    ],
  },
  {
    slug: 'binary-tree',
    title: 'Binary Tree',
    visualizerHref: '/binary-tree',
    level: 'Core',
    minutes: 16,
    mentalModel: 'Each node opens at most two smaller subproblems, a left subtree and a right subtree.',
    purpose: 'Tree traversals define when the root is processed relative to its subtrees.',
    prerequisites: ['recursion'],
    invariants: [
      'Every non-root node has one parent.',
      'A tree contains no cycle.',
      'Traversal visits each reachable node exactly once.',
    ],
    walkthrough: [
      'Run preorder and note that roots appear before descendants.',
      'Run inorder and compare the placement of each root.',
      'Run postorder and identify why children finish first.',
    ],
    practice: [
      'Reconstruct a small tree from level-order values.',
      'Choose a traversal for deleting a tree.',
      'Explain height versus node count.',
    ],
  },
  {
    slug: 'bst',
    title: 'Binary Search Tree',
    visualizerHref: '/bst',
    level: 'Core',
    minutes: 18,
    mentalModel: 'Every comparison chooses one ordered half of a tree.',
    purpose: 'A BST supports ordered lookup and mutation when its shape stays reasonably balanced.',
    prerequisites: ['binary-tree', 'searching'],
    invariants: [
      'Every left-subtree value is less than its node.',
      'Every right-subtree value is greater than its node.',
      'Inorder traversal produces ascending values.',
    ],
    walkthrough: [
      'Insert values that take both left and right branches.',
      'Delete a leaf, a one-child node, and a two-child node.',
      'Find the inorder successor used during deletion.',
    ],
    practice: [
      'Explain how sorted insertion creates a poor tree.',
      'Predict the search path for a missing value.',
      'Verify a tree using lower and upper bounds.',
    ],
  },
  {
    slug: 'heap',
    title: 'Heap',
    visualizerHref: '/heap',
    level: 'Advanced',
    minutes: 16,
    mentalModel: 'A complete binary tree stored in an array, with the best-priority value fixed at the root.',
    purpose: 'Heaps provide fast access to a minimum or maximum without fully sorting every value.',
    prerequisites: ['arrays', 'binary-tree'],
    invariants: [
      'The tree is complete and maps to contiguous array indices.',
      'Each parent satisfies the selected order against both children.',
      'Only the root is guaranteed to be globally minimum or maximum.',
    ],
    walkthrough: [
      'Insert a value that sifts through multiple levels.',
      'Extract the root and follow the replacement downward.',
      'Match every tree edge to parent and child array indices.',
    ],
    practice: [
      'Calculate children of index five.',
      'Explain why a heap is not a fully sorted array.',
      'Use a min-heap to keep the next scheduled task.',
    ],
  },
  {
    slug: 'graphs',
    title: 'Graphs',
    visualizerHref: '/graphs',
    level: 'Advanced',
    minutes: 20,
    mentalModel: 'Entities are nodes and relationships are edges, with no required hierarchy.',
    purpose: 'Graphs model routes, dependencies, networks, and state spaces. Traversal systematically discovers the reachable region.',
    prerequisites: ['queue', 'stack'],
    invariants: [
      'Visited tracking prevents repeated processing and cycles.',
      'BFS expands by distance layers with a queue.',
      'DFS follows one branch deeply with a stack or recursion.',
    ],
    walkthrough: [
      'Build a graph with a cycle and run BFS.',
      'Run DFS from the same node and compare visit order.',
      'Toggle direction and inspect the changed adjacency data.',
    ],
    practice: [
      'Choose BFS for an unweighted shortest path.',
      'Explain the O(V + E) bound.',
      'Predict which nodes become unreachable after directing an edge.',
    ],
  },
  {
    slug: 'hash-table',
    title: 'Hash Table',
    visualizerHref: '/hash-table',
    level: 'Advanced',
    minutes: 16,
    mentalModel: 'A hash function chooses a small neighborhood where a key should live.',
    purpose: 'Hash tables provide near-constant lookup by spreading keys across buckets and resolving collisions.',
    prerequisites: ['arrays', 'singly-linked-list'],
    invariants: [
      'The same key always hashes to the same bucket at a fixed capacity.',
      'Every stored key appears in the chain for its computed bucket.',
      'Colliding keys remain distinct entries.',
    ],
    walkthrough: [
      'Insert keys one capacity apart to force collisions.',
      'Search a long chain and count comparisons.',
      'Delete a middle chain value without moving other buckets.',
    ],
    practice: [
      'Explain average versus worst-case lookup.',
      'Normalize the bucket index for a negative key.',
      'Describe why resizing can improve performance.',
    ],
  },
  {
    slug: 'trie',
    title: 'Trie',
    visualizerHref: '/trie',
    level: 'Advanced',
    minutes: 16,
    mentalModel: 'Words share one path for every prefix they have in common.',
    purpose: 'Tries make prefix operations depend on word length instead of the number of stored words.',
    prerequisites: ['binary-tree', 'hash-table'],
    invariants: [
      'Each edge from a node has a unique character.',
      'A path can be a prefix without being a complete word.',
      'Terminal markers distinguish stored words from prefixes.',
    ],
    walkthrough: [
      'Insert car, card, and care and observe prefix sharing.',
      'Search for both car and the non-terminal prefix ca.',
      'Delete card while preserving car and care.',
    ],
    practice: [
      'Explain autocomplete from a prefix node.',
      'Estimate lookup work for a ten-letter word.',
      'Identify when a deleted suffix node can be pruned.',
    ],
  },
  {
    slug: 'union-find',
    title: 'Disjoint Set',
    visualizerHref: '/union-find',
    level: 'Advanced',
    minutes: 18,
    mentalModel: 'Each component elects one representative root, and every member can follow parent links to it.',
    purpose: 'Disjoint sets answer dynamic connectivity questions with union by rank and path compression.',
    prerequisites: ['graphs', 'binary-tree'],
    invariants: [
      'Every parent chain ends at a self-parent root.',
      'Values share a set exactly when their roots match.',
      'Union changes one root parent, never an arbitrary member parent.',
    ],
    walkthrough: [
      'Union two pairs, then merge the resulting components.',
      'Find a value on a deep path and watch compression.',
      'Repeat the find and compare the shorter trace.',
    ],
    practice: [
      'Use disjoint sets to detect a cycle in an undirected graph.',
      'Explain why ranks do not equal exact heights after compression.',
      'Describe the role of disjoint sets in Kruskal’s algorithm.',
    ],
  },
]

export const learningGuideBySlug = new Map(
  learningGuides.map(guide => [guide.slug, guide])
)
