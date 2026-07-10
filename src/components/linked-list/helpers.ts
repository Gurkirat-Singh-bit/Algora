import dagre from '@dagrejs/dagre'
import { MarkerType, Position, type Edge, type Node } from 'reactflow'
import type { NodeData, Step } from '@/lib/types'

export interface LinkedListNodeViewData {
  label: string
  isSentinel?: boolean
}

export const FLOW_NODE_WIDTH = 110
export const FLOW_NODE_HEIGHT = 64

function bgFor(state: NodeData['state']): string {
  switch (state) {
    case 'active': return 'var(--dsa-active)'
    case 'comparing': return 'var(--dsa-compare)'
    case 'inserting': return 'var(--dsa-insert)'
    case 'deleting': return 'var(--dsa-delete)'
    case 'found': return 'var(--dsa-found)'
    default: return 'var(--dsa-elevated)'
  }
}

function fgFor(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

export function parseNumberList(rawValue: string): number[] {
  return rawValue
    .split(/[\s,]+/)
    .map(token => Number.parseFloat(token))
    .filter(value => Number.isFinite(value))
}

export function parseOptionalInteger(rawValue: string): number | undefined {
  const value = Number.parseInt(rawValue, 10)
  if (Number.isNaN(value)) return undefined
  return value
}

export function mapStepToNodeState(index: number, step: Step | null): NodeData['state'] {
  if (!step || !step.indices.includes(index)) return 'default'
  if (step.action === 'insert') return 'inserting'
  if (step.action === 'delete') return 'deleting'
  if (step.action === 'compare') return 'comparing'
  if (step.action === 'found') return 'found'
  return 'active'
}

export function buildFlowNode(
  nodeId: string,
  label: string,
  state: NodeData['state'],
  position: { x: number; y: number },
  isSentinel = false
): Node<LinkedListNodeViewData> {
  return {
    id: nodeId,
    data: { label, isSentinel },
    position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    selectable: false,
    draggable: false,
    style: {
      width: FLOW_NODE_WIDTH,
      height: FLOW_NODE_HEIGHT,
      borderRadius: 8,
      border: isSentinel
        ? '1px dashed var(--dsa-border-strong)'
        : state === 'default'
          ? '1px solid var(--dsa-border-strong)'
          : '1px solid transparent',
      color: isSentinel ? 'var(--dsa-muted)' : fgFor(state),
      fontFamily: 'var(--font-mono-stack)',
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: '0.04em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isSentinel ? 'var(--dsa-surface)' : bgFor(state),
      transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
    },
  }
}

export function baseEdgeStyle(isActive: boolean): { style: Edge['style']; markerEnd: Edge['markerEnd'] } {
  const color = isActive ? 'var(--dsa-primary-container)' : 'var(--dsa-outline)'
  return {
    style: {
      stroke: color,
      strokeWidth: isActive ? 2.4 : 1.6,
      opacity: isActive ? 1 : 0.7,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color,
      width: 18,
      height: 18,
    },
  }
}

export function applyDagreLayout<TData>(
  nodes: Node<TData>[],
  edges: Edge[],
  rankDirection: 'LR' | 'TB' = 'LR'
): Node<TData>[] {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: rankDirection, ranksep: 100, nodesep: 80, marginx: 40, marginy: 32 })

  nodes.forEach(node => {
    graph.setNode(node.id, { width: FLOW_NODE_WIDTH, height: FLOW_NODE_HEIGHT })
  })
  edges.forEach(edge => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  return nodes.map(node => {
    const position = graph.node(node.id)
    if (!position) return node
    return {
      ...node,
      position: {
        x: position.x - FLOW_NODE_WIDTH / 2,
        y: position.y - FLOW_NODE_HEIGHT / 2,
      },
    }
  })
}

export function infoOnlyStep(message: string): Step[] {
  return [{ action: 'info', indices: [], description: message }]
}
