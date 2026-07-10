import type { Step } from '@/lib/types'

export interface TreeNode {
  value: number
  index: number
  left: TreeNode | null
  right: TreeNode | null
}

export const inorderPseudoCode = [
  'inorder(node):',
  '  if node is null: return',
  '  inorder(node.left)',
  '  visit(node)',
  '  inorder(node.right)',
]

export const preorderPseudoCode = [
  'preorder(node):',
  '  if node is null: return',
  '  visit(node)',
  '  preorder(node.left)',
  '  preorder(node.right)',
]

export const postorderPseudoCode = [
  'postorder(node):',
  '  if node is null: return',
  '  postorder(node.left)',
  '  postorder(node.right)',
  '  visit(node)',
]

export function buildTreeFromArray(values: Array<number | null>): TreeNode | null {
  const build = (index: number): TreeNode | null => {
    if (index >= values.length) {
      return null
    }

    const value = values[index]
    if (value === null || value === undefined) {
      return null
    }

    return {
      value,
      index,
      left: build(index * 2 + 1),
      right: build(index * 2 + 2),
    }
  }

  return build(0)
}

export function inorderSteps(root: TreeNode | null): Step[] {
  if (!root) {
    return [{ action: 'info', indices: [], description: 'Tree is empty.' }]
  }

  const steps: Step[] = []

  const visit = (node: TreeNode | null): void => {
    if (!node) {
      return
    }

    visit(node.left)
    steps.push({
      action: 'traverse',
      indices: [node.index],
      description: `Visit ${node.value} (inorder).`,
      pseudoCodeLine: 3,
    })
    visit(node.right)
  }

  visit(root)
  steps.push({ action: 'info', indices: [], description: 'Inorder traversal complete.' })
  return steps
}

export function preorderSteps(root: TreeNode | null): Step[] {
  if (!root) {
    return [{ action: 'info', indices: [], description: 'Tree is empty.' }]
  }

  const steps: Step[] = []

  const visit = (node: TreeNode | null): void => {
    if (!node) {
      return
    }

    steps.push({
      action: 'traverse',
      indices: [node.index],
      description: `Visit ${node.value} (preorder).`,
      pseudoCodeLine: 2,
    })
    visit(node.left)
    visit(node.right)
  }

  visit(root)
  steps.push({ action: 'info', indices: [], description: 'Preorder traversal complete.' })
  return steps
}

export function postorderSteps(root: TreeNode | null): Step[] {
  if (!root) {
    return [{ action: 'info', indices: [], description: 'Tree is empty.' }]
  }

  const steps: Step[] = []

  const visit = (node: TreeNode | null): void => {
    if (!node) {
      return
    }

    visit(node.left)
    visit(node.right)
    steps.push({
      action: 'traverse',
      indices: [node.index],
      description: `Visit ${node.value} (postorder).`,
      pseudoCodeLine: 4,
    })
  }

  visit(root)
  steps.push({ action: 'info', indices: [], description: 'Postorder traversal complete.' })
  return steps
}
