'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { QueueValue } from '@/lib/algorithms/queue-ops'
import type { NodeData, Step } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  deque: readonly QueueValue[]
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

export function DequeVisualizer({ deque, currentStepData }: Props) {
  if (deque.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="rounded-md border border-dashed border-dsa-border-strong px-8 py-6 text-sm text-dsa-muted">
          Deque is empty
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center overflow-x-auto p-8 md:p-10">
      <div className="flex items-end gap-2.5">
        <AnimatePresence>
          {deque.map((value, index) => {
            const state = resolveState(currentStepData, index)
            const isFront = index === 0
            const isRear = index === deque.length - 1
            return (
              <motion.div
                key={`${index}-${String(value)}`}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-5">
                  {(isFront || isRear) && (
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-primary-container">
                      {isFront && isRear ? 'F/R' : isFront ? 'FRONT' : 'REAR'}
                    </span>
                  )}
                </div>
                <motion.div
                  layout
                  animate={{ backgroundColor: bgFor(state) }}
                  transition={{ duration: 0.22 }}
                  className={cn(
                    'flex h-20 min-w-[72px] items-center justify-center rounded-md border font-mono text-2xl font-semibold tabular-nums tracking-data',
                    state === 'default'
                      ? 'border-dsa-border-strong text-dsa-text-strong'
                      : 'border-transparent text-[var(--on-accent)]'
                  )}
                >
                  {String(value)}
                </motion.div>
                <span className="font-mono text-[11px] tabular-nums text-dsa-muted-soft">{index}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
