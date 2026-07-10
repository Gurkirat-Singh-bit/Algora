 User approved Claude's plan
  ⎿  Plan saved to: ~/.claude/plans/claude-something-has-been-happy-dijkstra.md · /plan to edit
     DSA Visualizer — Implementation Plan

     Context

     Build an interactive Data Structures & Algorithms visualization platform from a college syllabus. Empty Next.js project at
     /home/mavaligamerz/code/Personal/EXPERIMENT. Stack: Next.js 15 (App Router), Bun, Shadcn/UI, TypeScript. Orchestration rule:
     Sonnet spawns Haiku sub-agents for ALL coding. Sonnet never writes code — only reviews output, assigns next tasks, and verifies.

     Tech Stack

     - Framework: Next.js 15 App Router
     - Package manager: Bun
     - UI: Shadcn/UI + Tailwind CSS (dark theme)
     - Node/graph viz: reactflow + @dagrejs/dagre
     - Animation: framer-motion
     - Language: TypeScript

     Color Palette

     Background: #0a0a0f  |  Surface: #12121a  |  Card: #1a1a2e
     Primary: #6366f1     |  Active: #f59e0b   |  Compare: #3b82f6
     Found: #22c55e       |  Delete: #ef4444   |  Insert: #a855f7

     Shared Type Contract (lib/types.ts)

     All agents must conform to these types:
     - StepAction: highlight | compare | swap | insert | delete | traverse | found | info
     - Step: { action, indices: number[], description, highlightColor?, pseudoCodeLine? }
     - NodeData: { value, state: default|active|comparing|found|deleting|inserting }
     - ComplexityInfo: { operation, time, space, best?, worst?, note? }
     - AnimationState: { steps, currentStep, isPlaying, speed, isComplete }

     Animation Engine Contract (hooks/useAnimationEngine.ts)

     Central hook every visualizer uses:
     { steps, currentStep, isPlaying, speed, setSteps, play, pause, stepForward, stepBackward, reset, setSpeed }
     Speed mapping: 1→2000ms, 2→1200ms, 3→700ms, 4→300ms, 5→100ms

     ---
     Phase 1 — Project Bootstrap (1 Haiku Agent, sequential)

     Checklist A: Foundation

     - Run: bunx create-next-app@latest . --typescript --tailwind --app --src-dir=no --import-alias="@/*" --yes
     - Run: bunx shadcn@latest init --defaults
     - Run: bunx shadcn@latest add button input slider badge tabs card separator tooltip scroll-area
     - Run: bun add reactflow framer-motion @dagrejs/dagre && bun add -d @types/dagre
     - tailwind.config.ts — custom colors, darkMode: 'class'
     - app/globals.css — CSS vars, scrollbar styles, ReactFlow overrides
     - lib/types.ts — full type system (Step, NodeData, ComplexityInfo, AnimationState)
     - lib/utils.ts — sleep(ms), getNodeColor(state), speedToMs(1-5), clamp()
     - constants/navigation.ts — { label, href, icon, category }[] for all 13 topics
     - hooks/useAnimationEngine.ts — full animation engine with setInterval loop
     - hooks/useStepRunner.ts — wrapper providing currentStepData: Step | null
     - components/shared/AnimatedNode.tsx — framer-motion div, color transitions by state
     - components/shared/VisualizerLayout.tsx — sidebar + canvas + control strip grid
     - components/shared/Sidebar.tsx — fixed 260px left nav, collapsible categories
     - components/shared/ControlPanel.tsx — form inputs + action buttons
     - components/shared/ComplexityBadge.tsx — Big-O cards row
     - components/shared/SpeedSlider.tsx — Shadcn Slider 1-5, Slow→Fast labels
     - components/shared/StepController.tsx — Reset/Prev/Play/Next + SpeedSlider
     - components/shared/StepLog.tsx — scrollable step list, current step highlighted
     - components/shared/CodeHighlight.tsx — monospace code with line highlighting
     - app/layout.tsx — root layout, dark class, Sidebar + main flex
     - app/page.tsx — hero + 13 topic cards grid
     - Run bun run dev and verify home page loads before Phase 2

     ---
     Phase 2 — Core Structures Group A (3 Parallel Haiku Agents)

     Start all 3 simultaneously after Phase 1 ✓

     Checklist B1: Arrays + Searching (Agent 2A)

     - lib/algorithms/array-ops.ts — insertStep, deleteStep, traverseSteps, linearSearchSteps, binarySearchSteps
     - lib/algorithms/searching-ops.ts — re-export search functions with page context metadata
     - components/arrays/ArrayVisualizer.tsx — flex row of AnimatedNode, pointer arrows for binary search
     - app/arrays/page.tsx — tabs: Insert/Delete/Traverse/Linear Search/Binary Search
     - components/searching/SearchingVisualizer.tsx — sorted array enforcement for binary search
     - app/searching/page.tsx — tabs: Linear/Binary with sort enforcement

     Checklist B2: Linked Lists (Agent 2B)

     - lib/algorithms/linked-list-ops.ts — all singly, doubly, circular operations returning Step[]
     - components/linked-list/SinglyLinkedListVisualizer.tsx — ReactFlow, dagre LR layout, NULL sentinel
     - components/linked-list/DoublyLinkedListVisualizer.tsx — ReactFlow, solid next arrows, dashed prev arrows
     - components/linked-list/CircularLinkedListVisualizer.tsx — ReactFlow, Math.cos/sin circular layout, curved last→first edge
     - app/singly-linked-list/page.tsx — tabs: Create/Insert(3 positions)/Delete/Traverse
     - app/doubly-linked-list/page.tsx — tabs: Insert/Delete/Forward Traverse/Backward Traverse
     - app/circular-linked-list/page.tsx — tabs: Insert/Delete/Traverse

     Checklist B3: Stack + Queue (Agent 2C)

     - lib/algorithms/stack-ops.ts — pushSteps, popSteps, peekSteps
     - lib/algorithms/queue-ops.ts — enqueue/dequeue, circular queue, deque operations
     - components/stack/StackVisualizer.tsx — vertical AnimatePresence stack, TOP label, LIFO label
     - components/queue/QueueVisualizer.tsx — horizontal row, Front/Rear pointer arrows
     - components/queue/CircularQueueVisualizer.tsx — circular layout, capacity slots
     - components/queue/DequeVisualizer.tsx — horizontal with bidirectional end indicators
     - app/stack/page.tsx — Push/Pop/Peek operations
     - app/queue/page.tsx — tabs: Queue/Circular Queue/Deque

     ---
     Phase 3 — Core Structures Group B (3 Parallel Haiku Agents)

     Start all 3 simultaneously after Phase 2 ✓

     Checklist C1: Binary Tree + BST (Agent 3A)

     - lib/algorithms/tree-ops.ts — inorderSteps, preorderSteps, postorderSteps, buildTreeFromArray
     - lib/algorithms/bst-ops.ts — bstInsertSteps, bstSearchSteps, bstDeleteSteps (all 3 delete cases)
     - components/tree/BinaryTreeVisualizer.tsx — ReactFlow + dagre TB, circle nodes, treeToFlow() helper
     - components/tree/BSTVisualizer.tsx — extends BinaryTree, reconstructs graph after insert/delete, inorder-successor label
     - app/binary-tree/page.tsx — pre-built tree, tabs: Inorder/Preorder/Postorder
     - app/bst/page.tsx — seed tree pre-inserted, tabs: Insert/Search/Delete

     Checklist C2: Heap + Recursion (Agent 3B)

     - lib/algorithms/heap-ops.ts — heapInsertSteps (sift-up), heapExtractSteps (sift-down), buildHeapArray
     - lib/algorithms/recursion-ops.ts — factorialCallStackSteps, fibonacciCallTreeSteps
     - components/heap/HeapVisualizer.tsx — dual view: ReactFlow tree (top) + flat array (bottom), synced highlights
     - components/recursion/FactorialVisualizer.tsx — visual call stack with frame cards, bottom-up resolution
     - components/recursion/FibonacciVisualizer.tsx — ReactFlow call tree, dagre TB, cached nodes dashed
     - app/heap/page.tsx — tabs: Min Heap/Max Heap; Insert/Extract/Build operations
     - app/recursion/page.tsx — tabs: Factorial/Fibonacci; n input clamped ≤8 for fib

     Checklist C3: Sorting (Agent 3C)

     - lib/algorithms/sorting-ops.ts — bubbleSortSteps, selectionSortSteps, insertionSortSteps, mergeSortSteps, quickSortSteps
     - components/sorting/SortingVisualizer.tsx — bar chart, framer-motion layout+layoutId by value (FLIP), sorted green zone
     - app/sorting/page.tsx — tabs: Bubble/Selection/Insertion/Merge/Quick; random array generator; complexity comparison table

     ---
     Phase 4 — Graphs + Polish (2 Parallel Haiku Agents)

     Start both simultaneously after Phase 3 ✓

     Checklist D1: Graphs (Agent 4A)

     - lib/algorithms/graph-ops.ts — bfsSteps, dfsSteps, buildAdjacencyList, buildAdjacencyMatrix
     - components/graphs/GraphVisualizer.tsx — ReactFlow, drag nodes, add node/edge interactively, live adjacency update
     - components/graphs/AdjacencyDisplay.tsx — toggle List/Matrix view, highlights active cell during traversal
     - app/graphs/page.tsx — pre-built 6-7 node example, BFS/DFS tabs, start-node dropdown, reset button

     Checklist D2: Polish + Integration (Agent 4B)

     - app/page.tsx (full) — animated hero, feature grid, CTA
     - components/shared/Sidebar.tsx (enhance) — usePathname active highlight, search/filter input, mobile Sheet drawer
     - components/shared/PageHeader.tsx — title + breadcrumb + description
     - components/shared/EmptyState.tsx — friendly message before first operation
     - components/shared/ErrorBoundary.tsx — React error boundary per visualizer
     - app/layout.tsx (enhance) — Suspense boundaries, loading progress bar
     - Cross-page audit: verify all routes exist, ComplexityBadge data accurate, StepController wired everywhere

     ---
     Inter-Agent Rules

     1. Agents within same phase never import from each other — zero cross-dependencies
     2. Every agent imports only from Phase 1 shared files (lib/types.ts, hooks/*, components/shared/*)
     3. ReactFlow pattern: maintain nodes[]+edges[] state; on each step update data.state based on stepData.indices
     4. Dagre layout helper: each agent using ReactFlow must implement applyDagreLayout() locally
     5. Bar chart pattern: key={element.value} + layoutId for FLIP swap animations

     Routes

     /arrays /singly-linked-list /doubly-linked-list /circular-linked-list /stack /queue /recursion /binary-tree /bst /heap /sorting
     /searching /graphs

     Verification

     After each phase:
     - bun run dev must start without errors
     - Visit each new route in browser, confirm visualizer renders
     - Trigger one operation per page, confirm animation plays
     - Check dark theme, sidebar nav, StepController all functional
     - TypeScript: bunx tsc --noEmit must pass after each phase

