import type { Step } from '@/lib/types'

export type UnionFindMode = 'union' | 'find'

export interface UnionFindState {
  parent: number[]
  rank: number[]
}

export interface UnionFindRun {
  steps: Step[]
  snapshots: UnionFindState[]
  nextState: UnionFindState
  root?: number
  merged?: boolean
}

export const unionFindPseudoCode: Record<UnionFindMode, string[]> = {
  union: [
    'rootA = find(a), rootB = find(b)',
    'if rootA == rootB: return',
    'attach lower-rank root below higher-rank root',
    'if ranks equal: increment new root rank',
  ],
  find: [
    'root = value',
    'while root != parent[root]: root = parent[root]',
    'while value != root:',
    '  parent[value] = root',
    'return root',
  ],
}

export function createUnionFind(size: number): UnionFindState {
  if (!Number.isInteger(size) || size < 2 || size > 16) {
    throw new Error('Disjoint set size must be an integer from 2 to 16.')
  }
  return {
    parent: Array.from({ length: size }, (_, index) => index),
    rank: Array.from({ length: size }, () => 0),
  }
}

function cloneState(state: UnionFindState): UnionFindState {
  return { parent: [...state.parent], rank: [...state.rank] }
}

function validateState(state: UnionFindState): void {
  if (state.parent.length < 2 || state.parent.length !== state.rank.length) {
    throw new Error('Disjoint set state is invalid.')
  }
  for (const parent of state.parent) {
    if (!Number.isInteger(parent) || parent < 0 || parent >= state.parent.length) {
      throw new Error('Disjoint set contains an invalid parent.')
    }
  }
}

function validateValue(state: UnionFindState, value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value >= state.parent.length) {
    throw new Error(`${label} must be from 0 to ${state.parent.length - 1}.`)
  }
}

function rootWithoutCompression(state: UnionFindState, value: number): number {
  let current = value
  const seen = new Set<number>()
  while (state.parent[current] !== current) {
    if (seen.has(current)) throw new Error('Disjoint set contains a parent cycle.')
    seen.add(current)
    current = state.parent[current]
  }
  return current
}

export function unionFindGroups(state: UnionFindState): number[][] {
  validateState(state)
  const byRoot = new Map<number, number[]>()
  for (let value = 0; value < state.parent.length; value += 1) {
    const root = rootWithoutCompression(state, value)
    const group = byRoot.get(root) ?? []
    group.push(value)
    byRoot.set(root, group)
  }
  return Array.from(byRoot.values()).sort((a, b) => a[0] - b[0])
}

export function runFind(state: UnionFindState, value: number): UnionFindRun {
  validateState(state)
  validateValue(state, value, 'Value')
  const working = cloneState(state)
  const steps: Step[] = []
  const snapshots: UnionFindState[] = []
  const push = (step: Step): void => {
    steps.push(step)
    snapshots.push(cloneState(working))
  }

  let root = value
  const path: number[] = []
  push({
    action: 'highlight',
    indices: [value],
    description: `Start find at value ${value}.`,
    pseudoCodeLine: 0,
  })

  const seen = new Set<number>()
  while (working.parent[root] !== root) {
    if (seen.has(root)) throw new Error('Disjoint set contains a parent cycle.')
    seen.add(root)
    path.push(root)
    push({
      action: 'traverse',
      indices: [root, working.parent[root]],
      description: `${root} points to parent ${working.parent[root]}.`,
      pseudoCodeLine: 1,
      edge: [root, working.parent[root]],
    })
    root = working.parent[root]
  }

  push({
    action: 'found',
    indices: [root],
    description: `Root ${root} represents the set containing ${value}.`,
    pseudoCodeLine: 1,
  })

  for (const node of path) {
    if (working.parent[node] === root) continue
    working.parent[node] = root
    push({
      action: 'insert',
      indices: [node, root],
      description: `Compress the path by pointing ${node} directly to ${root}.`,
      pseudoCodeLine: 3,
      edge: [node, root],
    })
  }

  push({
    action: 'info',
    indices: [root],
    description: `Find complete. Root of ${value} is ${root}.`,
    pseudoCodeLine: 4,
  })

  return { steps, snapshots, nextState: working, root }
}

export function runUnion(state: UnionFindState, a: number, b: number): UnionFindRun {
  validateState(state)
  validateValue(state, a, 'First value')
  validateValue(state, b, 'Second value')
  const working = cloneState(state)
  const steps: Step[] = []
  const snapshots: UnionFindState[] = []
  const push = (step: Step): void => {
    steps.push(step)
    snapshots.push(cloneState(working))
  }

  const rootA = rootWithoutCompression(working, a)
  const rootB = rootWithoutCompression(working, b)
  push({
    action: 'compare',
    indices: [rootA, rootB],
    description: `Compare roots: root(${a}) = ${rootA}, root(${b}) = ${rootB}.`,
    pseudoCodeLine: 0,
  })

  if (rootA === rootB) {
    push({
      action: 'info',
      indices: [rootA],
      description: `${a} and ${b} already belong to the same set.`,
      pseudoCodeLine: 1,
    })
    return { steps, snapshots, nextState: working, root: rootA, merged: false }
  }

  let parentRoot = rootA
  let childRoot = rootB
  if (working.rank[rootA] < working.rank[rootB]) {
    parentRoot = rootB
    childRoot = rootA
  }

  working.parent[childRoot] = parentRoot
  push({
    action: 'insert',
    indices: [childRoot, parentRoot],
    description: `Attach root ${childRoot} below root ${parentRoot}.`,
    pseudoCodeLine: 2,
    edge: [childRoot, parentRoot],
  })

  if (working.rank[rootA] === working.rank[rootB]) {
    working.rank[parentRoot] += 1
    push({
      action: 'highlight',
      indices: [parentRoot],
      description: `Equal ranks: increase rank of root ${parentRoot} to ${working.rank[parentRoot]}.`,
      pseudoCodeLine: 3,
    })
  }

  push({
    action: 'info',
    indices: [parentRoot],
    description: `Union complete. ${a} and ${b} now share root ${parentRoot}.`,
    pseudoCodeLine: 3,
  })

  return { steps, snapshots, nextState: working, root: parentRoot, merged: true }
}
