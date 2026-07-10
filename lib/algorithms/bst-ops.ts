import type { Step } from '@/lib/types'

export interface BstNode {
  value: number
  left: BstNode | null
  right: BstNode | null
}

export const bstInsertPseudoCode = [
  'insert(node, value):',
  '  if node is null: create node(value)',
  '  if value < node.value: go left',
  '  else if value > node.value: go right',
  '  return node',
]

export const bstSearchPseudoCode = [
  'search(node, target):',
  '  if node is null: return not found',
  '  if target == node.value: return found',
  '  if target < node.value: search left',
  '  else: search right',
]

export const bstDeletePseudoCode = [
  'delete(node, target):',
  '  find target node',
  '  if leaf: remove node',
  '  if one child: replace node with child',
  '  if two children: copy inorder successor then delete successor',
]

function insertNode(root: BstNode | null, value: number): BstNode {
  if (!root) {
    return { value, left: null, right: null }
  }

  if (value < root.value) {
    root.left = insertNode(root.left, value)
  } else if (value > root.value) {
    root.right = insertNode(root.right, value)
  }

  return root
}

export function buildBstFromValues(values: number[]): BstNode | null {
  let root: BstNode | null = null
  for (const value of values) {
    root = insertNode(root, value)
  }
  return root
}

export function bstInsertSteps(values: number[], value: number): Step[] {
  const root = buildBstFromValues(values)
  const steps: Step[] = []

  if (!root) {
    return [
      { action: 'insert', indices: [value], description: `Tree is empty. Insert ${value} as root.`, pseudoCodeLine: 1 },
      { action: 'info', indices: [value], description: 'Insertion complete.' },
    ]
  }

  let current: BstNode | null = root
  while (current) {
    steps.push({
      action: 'compare',
      indices: [current.value],
      description: `Compare ${value} with ${current.value}.`,
      pseudoCodeLine: 1,
    })

    if (value === current.value) {
      steps.push({
        action: 'info',
        indices: [current.value],
        description: `${value} already exists. BST keeps unique values.`,
        pseudoCodeLine: 4,
      })
      return steps
    }

    if (value < current.value) {
      if (!current.left) {
        steps.push({
          action: 'insert',
          indices: [current.value, value],
          description: `${value} < ${current.value}, insert ${value} as left child.`,
          pseudoCodeLine: 2,
        })
        break
      }
      current = current.left
    } else {
      if (!current.right) {
        steps.push({
          action: 'insert',
          indices: [current.value, value],
          description: `${value} > ${current.value}, insert ${value} as right child.`,
          pseudoCodeLine: 3,
        })
        break
      }
      current = current.right
    }
  }

  steps.push({ action: 'info', indices: [value], description: 'Insertion complete.' })
  return steps
}

export function bstSearchSteps(values: number[], target: number): Step[] {
  const root = buildBstFromValues(values)
  if (!root) {
    return [{ action: 'info', indices: [], description: 'Tree is empty.', pseudoCodeLine: 1 }]
  }

  const steps: Step[] = []
  let current: BstNode | null = root

  while (current) {
    steps.push({
      action: 'compare',
      indices: [current.value],
      description: `Compare target ${target} with ${current.value}.`,
      pseudoCodeLine: 1,
    })

    if (target === current.value) {
      steps.push({
        action: 'found',
        indices: [current.value],
        description: `Target ${target} found.`,
        pseudoCodeLine: 2,
      })
      return steps
    }

    if (target < current.value) {
      steps.push({
        action: 'highlight',
        indices: [current.value],
        description: `${target} < ${current.value}, move left.`,
        pseudoCodeLine: 3,
      })
      current = current.left
    } else {
      steps.push({
        action: 'highlight',
        indices: [current.value],
        description: `${target} > ${current.value}, move right.`,
        pseudoCodeLine: 4,
      })
      current = current.right
    }
  }

  steps.push({ action: 'info', indices: [], description: `Target ${target} not found.`, pseudoCodeLine: 1 })
  return steps
}

export function bstDeleteSteps(values: number[], target: number): Step[] {
  const root = buildBstFromValues(values)
  if (!root) {
    return [{ action: 'info', indices: [], description: 'Tree is empty.', pseudoCodeLine: 1 }]
  }

  const steps: Step[] = []
  let current: BstNode | null = root

  while (current) {
    steps.push({
      action: 'compare',
      indices: [current.value],
      description: `Locate ${target}: compare with ${current.value}.`,
      pseudoCodeLine: 1,
    })

    if (target === current.value) {
      break
    }

    current = target < current.value ? current.left : current.right
  }

  if (!current) {
    steps.push({ action: 'info', indices: [], description: `${target} is not in the tree.`, pseudoCodeLine: 1 })
    return steps
  }

  if (!current.left && !current.right) {
    steps.push({
      action: 'delete',
      indices: [current.value],
      description: `Node ${current.value} is a leaf. Remove it directly.`,
      pseudoCodeLine: 2,
    })
  } else if (!current.left || !current.right) {
    steps.push({
      action: 'delete',
      indices: [current.value],
      description: `Node ${current.value} has one child. Replace it with its child.`,
      pseudoCodeLine: 3,
    })
  } else {
    let successor = current.right
    while (successor?.left) {
      steps.push({
        action: 'traverse',
        indices: [successor.value],
        description: `Move left to find inorder successor from ${successor.value}.`,
        pseudoCodeLine: 4,
      })
      successor = successor.left
    }

    steps.push({
      action: 'highlight',
      indices: successor ? [current.value, successor.value] : [current.value],
      description: `Replace ${current.value} with successor ${successor?.value ?? 'N/A'}.`,
      pseudoCodeLine: 4,
    })
    steps.push({
      action: 'delete',
      indices: successor ? [successor.value] : [current.value],
      description: 'Delete successor node from right subtree.',
      pseudoCodeLine: 4,
    })
  }

  steps.push({ action: 'info', indices: [target], description: `Deletion flow for ${target} complete.` })
  return steps
}

export function insertIntoValues(values: number[], value: number): number[] {
  if (values.includes(value)) {
    return values
  }
  return [...values, value]
}

export function removeFromValues(values: number[], value: number): number[] {
  const index = values.indexOf(value)
  if (index < 0) {
    return values
  }

  const next = [...values]
  next.splice(index, 1)
  return next
}
