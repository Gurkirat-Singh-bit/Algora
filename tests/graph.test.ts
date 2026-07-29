import { describe, expect, test } from 'bun:test'

import {
  bfsSteps,
  buildAdjacencyFromSnapshot,
  buildAdjacencyMatrix,
  dfsSteps,
} from '@/lib/algorithms/graph-ops'
import { graphEdgeId, parseGraphSnapshot } from '@/lib/graph'

describe('graph data', () => {
  test('builds a matrix for non-contiguous node IDs', () => {
    const nodeIds = [2, 7, 11]
    const adjacency = {
      2: [7],
      7: [2, 11],
      11: [7],
    }

    expect(buildAdjacencyMatrix(nodeIds, adjacency)).toEqual([
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ])
  })

  test('preserves edge direction in adjacency data', () => {
    const adjacency = buildAdjacencyFromSnapshot({
      nodes: [{ id: 3 }, { id: 9 }],
      edges: [{ source: 3, target: 9 }],
      directed: true,
    })

    expect(adjacency).toEqual({ 3: [9], 9: [] })
  })

  test('normalizes imported edge IDs and weights', () => {
    const parsed = parseGraphSnapshot({
      nodes: [
        { id: 4, x: 10, y: 20 },
        { id: 1, x: 30, y: 40 },
      ],
      edges: [{ id: 'untrusted', source: 4, target: 1 }],
      directed: false,
      weighted: true,
    })

    expect(parsed.edges).toEqual([{ id: '1-4', source: 4, target: 1, weight: 1 }])
    expect(graphEdgeId(4, 1, false)).toBe('1-4')
  })

  test('rejects imports with duplicate IDs or missing endpoints', () => {
    expect(() => parseGraphSnapshot({
      nodes: [
        { id: 1, x: 0, y: 0 },
        { id: 1, x: 1, y: 1 },
      ],
      edges: [],
      directed: false,
      weighted: false,
    })).toThrow('duplicated')

    expect(() => parseGraphSnapshot({
      nodes: [{ id: 1, x: 0, y: 0 }],
      edges: [{ source: 1, target: 2 }],
      directed: false,
      weighted: false,
    })).toThrow('missing node')
  })
})

describe('graph traversal traces', () => {
  const adjacency = {
    0: [1, 2],
    1: [0, 3],
    2: [0],
    3: [1],
  }

  test('BFS emits visit order, pseudocode lines, and discovery edges', () => {
    const steps = bfsSteps(adjacency, 0)
    const order = steps
      .filter(step => step.action === 'traverse')
      .map(step => step.indices[0])
    const discoveryEdges = steps
      .filter(step => step.action === 'insert' && step.edge)
      .map(step => step.edge)

    expect(order).toEqual([0, 1, 2, 3])
    expect(discoveryEdges).toEqual([[0, 1], [0, 2], [1, 3]])
    expect(steps.every(step => step.pseudoCodeLine !== undefined)).toBe(true)
  })

  test('DFS visits every reachable node once', () => {
    const steps = dfsSteps(adjacency, 0)
    const order = steps
      .filter(step => step.action === 'traverse')
      .map(step => step.indices[0])

    expect(order[0]).toBe(0)
    expect(new Set(order)).toEqual(new Set([0, 1, 2, 3]))
    expect(order).toHaveLength(4)
  })
})
