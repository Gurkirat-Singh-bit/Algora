import type { Step } from '@/lib/types'

export type GraphAdjList = Record<number, number[]>

export interface GraphEdgeInput {
  from: number
  to: number
}

export function buildAdjacencyList(nodeCount: number, edges: GraphEdgeInput[]): GraphAdjList {
  const adjacency: GraphAdjList = {}

  for (let node = 0; node < nodeCount; node += 1) {
    adjacency[node] = []
  }

  for (const edge of edges) {
    adjacency[edge.from]?.push(edge.to)
    adjacency[edge.to]?.push(edge.from)
  }

  for (let node = 0; node < nodeCount; node += 1) {
    adjacency[node].sort((a, b) => a - b)
  }

  return adjacency
}

export interface GraphSnapshotInput {
  nodes: { id: number }[]
  edges: { source: number; target: number; weight?: number }[]
  directed: boolean
}

export function buildAdjacencyFromSnapshot(snapshot: GraphSnapshotInput): GraphAdjList {
  const adjacency: GraphAdjList = {}
  for (const node of snapshot.nodes) {
    adjacency[node.id] = []
  }
  for (const edge of snapshot.edges) {
    if (adjacency[edge.source]) adjacency[edge.source].push(edge.target)
    if (!snapshot.directed && adjacency[edge.target]) adjacency[edge.target].push(edge.source)
  }
  for (const key of Object.keys(adjacency)) {
    adjacency[Number(key)].sort((a, b) => a - b)
  }
  return adjacency
}

export function buildAdjacencyMatrix(nodeIds: readonly number[], adjacency: GraphAdjList): number[][] {
  const indexById = new Map(nodeIds.map((id, index) => [id, index]))
  const matrix = Array.from(
    { length: nodeIds.length },
    () => Array.from({ length: nodeIds.length }, () => 0)
  )

  for (const [rowIndex, from] of nodeIds.entries()) {
    const neighbors = adjacency[from] ?? []
    for (const to of neighbors) {
      const columnIndex = indexById.get(to)
      if (columnIndex !== undefined) matrix[rowIndex][columnIndex] = 1
    }
  }

  return matrix
}

export function bfsSteps(adjacency: GraphAdjList, start: number): Step[] {
  const steps: Step[] = []

  if (!(start in adjacency)) {
    return [{ action: 'info', indices: [], description: `Start node ${start} is not in graph.` }]
  }

  const visited = new Set<number>([start])
  const queue: number[] = [start]

  steps.push({
    action: 'insert',
    indices: [start],
    description: `Initialize BFS queue with start node ${start}.`,
    pseudoCodeLine: 0,
  })

  while (queue.length > 0) {
    const current = queue.shift() as number

    steps.push({
      action: 'traverse',
      indices: [current],
      description: `Dequeue node ${current} and visit it.`,
      pseudoCodeLine: 2,
    })

    for (const neighbor of adjacency[current] ?? []) {
      steps.push({
        action: 'compare',
        indices: [current, neighbor],
        description: `Inspect edge ${current} -> ${neighbor}.`,
        pseudoCodeLine: 3,
        edge: [current, neighbor],
      })

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
        steps.push({
          action: 'insert',
          indices: [neighbor],
          description: `Node ${neighbor} is unvisited. Enqueue it.`,
          pseudoCodeLine: 4,
          edge: [current, neighbor],
        })
      }
    }
  }

  steps.push({
    action: 'info',
    indices: Array.from(visited),
    description: `BFS complete. Visited order size: ${visited.size}.`,
    pseudoCodeLine: 1,
  })

  return steps
}

export function dfsSteps(adjacency: GraphAdjList, start: number): Step[] {
  const steps: Step[] = []

  if (!(start in adjacency)) {
    return [{ action: 'info', indices: [], description: `Start node ${start} is not in graph.` }]
  }

  const visited = new Set<number>()
  const stack: number[] = [start]

  steps.push({
    action: 'insert',
    indices: [start],
    description: `Initialize DFS stack with start node ${start}.`,
    pseudoCodeLine: 0,
  })

  while (stack.length > 0) {
    const current = stack.pop() as number

    if (visited.has(current)) {
      continue
    }

    visited.add(current)
    steps.push({
      action: 'traverse',
      indices: [current],
      description: `Pop node ${current} and visit it.`,
      pseudoCodeLine: 2,
    })

    const neighbors = [...(adjacency[current] ?? [])].sort((a, b) => b - a)
    for (const neighbor of neighbors) {
      steps.push({
        action: 'compare',
        indices: [current, neighbor],
        description: `Inspect edge ${current} -> ${neighbor}.`,
        pseudoCodeLine: 3,
        edge: [current, neighbor],
      })

      if (!visited.has(neighbor)) {
        stack.push(neighbor)
        steps.push({
          action: 'insert',
          indices: [neighbor],
          description: `Push unvisited node ${neighbor} to DFS stack.`,
          pseudoCodeLine: 3,
          edge: [current, neighbor],
        })
      }
    }
  }

  steps.push({
    action: 'info',
    indices: Array.from(visited),
    description: `DFS complete. Visited order size: ${visited.size}.`,
    pseudoCodeLine: 1,
  })

  return steps
}
