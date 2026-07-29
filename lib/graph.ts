export const MAX_GRAPH_NODES = 50
export const MAX_GRAPH_EDGES = 200

export interface GraphNodeRecord {
  id: number
  x: number
  y: number
  label?: string
}

export interface GraphEdgeRecord {
  id: string
  source: number
  target: number
  weight?: number
}

export interface GraphSnapshot {
  nodes: GraphNodeRecord[]
  edges: GraphEdgeRecord[]
  directed: boolean
  weighted: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`)
  }
  return value
}

function requireNodeId(value: unknown, label: string): number {
  const id = requireFiniteNumber(value, label)
  if (!Number.isSafeInteger(id) || id < 0 || id > 9999) {
    throw new Error(`${label} must be an integer from 0 to 9999.`)
  }
  return id
}

export function graphEdgeId(source: number, target: number, directed: boolean): string {
  if (directed) return `${source}->${target}`
  return source < target ? `${source}-${target}` : `${target}-${source}`
}

export function parseGraphSnapshot(value: unknown): GraphSnapshot {
  if (!isRecord(value)) throw new Error('Graph data must be an object.')
  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    throw new Error('Graph data must contain node and edge arrays.')
  }
  if (typeof value.directed !== 'boolean' || typeof value.weighted !== 'boolean') {
    throw new Error('Graph data must define directed and weighted modes.')
  }
  const directed = value.directed
  const weighted = value.weighted
  if (value.nodes.length > MAX_GRAPH_NODES) {
    throw new Error(`Graphs support at most ${MAX_GRAPH_NODES} nodes.`)
  }
  if (value.edges.length > MAX_GRAPH_EDGES) {
    throw new Error(`Graphs support at most ${MAX_GRAPH_EDGES} edges.`)
  }

  const nodeIds = new Set<number>()
  const nodes = value.nodes.map((rawNode, index): GraphNodeRecord => {
    if (!isRecord(rawNode)) throw new Error(`Node ${index + 1} must be an object.`)
    const id = requireNodeId(rawNode.id, `Node ${index + 1} ID`)
    if (nodeIds.has(id)) throw new Error(`Node ID ${id} is duplicated.`)
    nodeIds.add(id)

    const x = requireFiniteNumber(rawNode.x, `Node ${id} x position`)
    const y = requireFiniteNumber(rawNode.y, `Node ${id} y position`)
    const label = rawNode.label
    if (label !== undefined && (typeof label !== 'string' || label.trim().length > 24)) {
      throw new Error(`Node ${id} label must be at most 24 characters.`)
    }

    return {
      id,
      x,
      y,
      ...(typeof label === 'string' && label.trim() ? { label: label.trim() } : {}),
    }
  })

  const edgeIds = new Set<string>()
  const edges = value.edges.map((rawEdge, index): GraphEdgeRecord => {
    if (!isRecord(rawEdge)) throw new Error(`Edge ${index + 1} must be an object.`)
    const source = requireNodeId(rawEdge.source, `Edge ${index + 1} source`)
    const target = requireNodeId(rawEdge.target, `Edge ${index + 1} target`)
    if (source === target) throw new Error(`Edge ${index + 1} cannot connect a node to itself.`)
    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      throw new Error(`Edge ${source} to ${target} references a missing node.`)
    }

    const id = graphEdgeId(source, target, directed)
    if (edgeIds.has(id)) throw new Error(`Edge ${source} to ${target} is duplicated.`)
    edgeIds.add(id)

    const weight = rawEdge.weight
    if (weight !== undefined && (typeof weight !== 'number' || !Number.isFinite(weight))) {
      throw new Error(`Edge ${source} to ${target} has an invalid weight.`)
    }

    return {
      id,
      source,
      target,
      ...(weighted ? { weight: weight ?? 1 } : {}),
    }
  })

  return {
    nodes,
    edges,
    directed,
    weighted,
  }
}
