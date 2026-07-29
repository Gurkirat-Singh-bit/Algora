'use client'

import { motion } from 'framer-motion'
import type { CircularQueueState, QueueValue } from '@/lib/algorithms/queue-ops'
import type { NodeData, Step } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  state: CircularQueueState<QueueValue>
  currentStepData: Step | null
}

function resolveState(step: Step | null, index: number): NodeData['state'] {
  if (!step || !step.indices.includes(index)) return 'default'
  switch (step.action) {
    case 'insert': return 'inserting'
    case 'delete': return 'deleting'
    case 'compare': return 'comparing'
    case 'found': return 'found'
    default: return 'active'
  }
}

function bgFor(s: NodeData['state']): string {
  switch (s) {
    case 'comparing': return 'var(--dsa-compare)'
    case 'found': return 'var(--dsa-found)'
    case 'inserting': return 'var(--dsa-insert)'
    case 'deleting': return 'var(--dsa-delete)'
    case 'active': return 'var(--dsa-active)'
    default: return 'var(--dsa-elevated)'
  }
}

export function CircularQueueVisualizer({ state, currentStepData }: Props) {
  const capacity = state.slots.length
  if (capacity === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="rounded-md border border-dashed border-dsa-border-strong px-6 py-6 text-sm text-dsa-muted">
          Capacity is zero
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="relative aspect-square w-full max-w-md">
        <div className="absolute inset-[18%] rounded-full border border-dashed border-dsa-border-strong" />
        {state.slots.map((value, index) => {
          const angle = (2 * Math.PI * index) / capacity - Math.PI / 2
          const left = 50 + Math.cos(angle) * 38
          const top = 50 + Math.sin(angle) * 38
          const isFront = state.front === index
          const isRear = state.rear === index
          const label = isFront && isRear ? 'F/R' : isFront ? 'FRONT' : isRear ? 'REAR' : ''
          const itemState = resolveState(currentStepData, index)
          const empty = value === null
          return (
            <div
              key={index}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="h-4 font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-primary-container">
                  {label}
                </span>
                <motion.div
                  layout
                  animate={{ backgroundColor: bgFor(itemState) }}
                  transition={{ duration: 0.22 }}
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-md border font-mono text-base font-semibold tabular-nums tracking-data',
                    itemState === 'default'
                      ? 'border-dsa-border-strong text-dsa-text-strong'
                      : 'border-transparent text-[var(--on-accent)]',
                    empty && 'opacity-55'
                  )}
                >
                  {empty ? 'Empty' : String(value)}
                </motion.div>
                <span className="font-mono text-[10px] tabular-nums text-dsa-muted-soft">{index}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
