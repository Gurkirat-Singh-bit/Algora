'use client'

import { Handle, Position, type NodeProps } from 'reactflow'

import type { NodeData } from '@/lib/types'

export interface GraphNodeData {
  label: string
  state: NodeData['state']
  visited: boolean
  selected: boolean
  editMode: boolean
}

function stateColor(state: NodeData['state']): string {
  if (state === 'active') return 'var(--dsa-active)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  return 'var(--dsa-elevated)'
}

export function GraphNode({ data }: NodeProps<GraphNodeData>) {
  const emphasized = data.state !== 'default'
  const border = data.selected || data.visited
    ? '2px solid var(--dsa-primary-container)'
    : emphasized
      ? '1px solid transparent'
      : '1px solid var(--dsa-border-strong)'

  const handleStyle = {
    width: 14,
    height: 14,
    border: '2px solid var(--dsa-card)',
    background: 'var(--dsa-primary-container)',
    opacity: data.editMode ? 1 : 0,
    pointerEvents: data.editMode ? 'auto' as const : 'none' as const,
    transition: 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  }

  return (
    <div
      className="grid h-14 w-14 place-items-center rounded-full font-mono text-[15px] font-semibold tracking-data transition-[background,color,border-color] duration-200"
      style={{
        border,
        background: stateColor(data.state),
        color: emphasized ? 'var(--on-accent)' : 'var(--dsa-text-strong)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        aria-label={`Connect to node ${data.label}`}
        style={handleStyle}
      />
      <span aria-hidden="true">{data.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        aria-label={`Connect from node ${data.label}`}
        style={handleStyle}
      />
    </div>
  )
}
