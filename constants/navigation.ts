import {
  ArrowUpDown,
  Binary,
  Compass,
  GitBranch,
  Layers,
  Link as LinkIcon,
  Link2,
  Network,
  RefreshCcw,
  Repeat,
  Rows3,
  Search,
  SquareStack,
  TreePine,
  type LucideIcon,
} from 'lucide-react'

export const iconMap = {
  Compass,
  SquareStack,
  Link: LinkIcon,
  Link2,
  RefreshCcw,
  Layers,
  Rows3,
  Search,
  ArrowUpDown,
  Repeat,
  GitBranch,
  Binary,
  TreePine,
  Network,
} satisfies Record<string, LucideIcon>

export type NavIcon = keyof typeof iconMap

// Public source repository. The sidebar GitHub link only renders when non-empty.
export const REPO_URL = 'https://github.com/Gurkirat-Singh-bit/Algora'

export interface NavItem {
  label: string
  href: string
  icon: NavIcon
  category: string
  summary: string
}

export const navItems: NavItem[] = [
  {
    label: 'Learning Path',
    href: '/learn',
    icon: 'Compass',
    category: 'Curriculum',
    summary: 'Structured learning order aligned to a common DSA course sequence.',
  },
  {
    label: 'Arrays',
    href: '/arrays',
    icon: 'SquareStack',
    category: 'Linear Data Structures',
    summary: 'Index-driven insert, delete, traversal, and search behavior.',
  },
  {
    label: 'Singly Linked List',
    href: '/singly-linked-list',
    icon: 'Link',
    category: 'Linear Data Structures',
    summary: 'Pointer updates across head, middle, and tail operations.',
  },
  {
    label: 'Doubly Linked List',
    href: '/doubly-linked-list',
    icon: 'Link2',
    category: 'Linear Data Structures',
    summary: 'Forward and backward traversal with dual-link maintenance.',
  },
  {
    label: 'Circular Linked List',
    href: '/circular-linked-list',
    icon: 'RefreshCcw',
    category: 'Linear Data Structures',
    summary: 'Looped structures where the tail reconnects to the head.',
  },
  {
    label: 'Stack',
    href: '/stack',
    icon: 'Layers',
    category: 'Linear Data Structures',
    summary: 'LIFO behavior with top pointer emphasis during push and pop.',
  },
  {
    label: 'Queue',
    href: '/queue',
    icon: 'Rows3',
    category: 'Linear Data Structures',
    summary: 'FIFO operations, circular queue indexing, and deque variants.',
  },
  {
    label: 'Recursion',
    href: '/recursion',
    icon: 'Repeat',
    category: 'Algorithms',
    summary: 'Call stack growth and unwind flow for recursive logic.',
  },
  {
    label: 'Searching',
    href: '/searching',
    icon: 'Search',
    category: 'Algorithms',
    summary: 'Linear and binary search traces with direct comparisons.',
  },
  {
    label: 'Sorting',
    href: '/sorting',
    icon: 'ArrowUpDown',
    category: 'Algorithms',
    summary: 'Swap-centric visual traces from basic to divide-and-conquer sorts.',
  },
  {
    label: 'Binary Tree',
    href: '/binary-tree',
    icon: 'GitBranch',
    category: 'Trees and Graphs',
    summary: 'Traversal order visualized across left and right subtrees.',
  },
  {
    label: 'BST',
    href: '/bst',
    icon: 'Binary',
    category: 'Trees and Graphs',
    summary: 'Ordered insert/search/delete cases with structured balancing cues.',
  },
  {
    label: 'Heap',
    href: '/heap',
    icon: 'TreePine',
    category: 'Trees and Graphs',
    summary: 'Array-tree synchronization for sift-up and sift-down operations.',
  },
  {
    label: 'Graphs',
    href: '/graphs',
    icon: 'Network',
    category: 'Trees and Graphs',
    summary: 'BFS and DFS traversal states over interactive node-edge canvases.',
  },
]

export const categories = ['Curriculum', 'Linear Data Structures', 'Algorithms', 'Trees and Graphs']
