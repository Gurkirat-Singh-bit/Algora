'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { StackValue } from '@/lib/algorithms/stack-ops'
import type { NodeData, Step } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  stack: readonly StackValue[]
  currentStepData: Step | null
}

function resolveState(step: Step | null, index: number): NodeData['state'] {
  if (!step || !step.indices.includes(index)) return 'default'
  switch (step.action) {
    case 'insert': return 'inserting'
    case 'delete': return 'deleting'
    case 'compare': return 'comparing'
    case 'found': return 'found'
    case 'highlight':
    case 'traverse':
    case 'swap':
    case 'info':
      return 'active'
    default:
      return 'default'
  }
}

function bgFor(state: NodeData['state']): string {
  switch (state) {
    case 'comparing': return 'var(--dsa-compare)'
    case 'found': return 'var(--dsa-found)'
    case 'inserting': return 'var(--dsa-insert)'
    case 'deleting': return 'var(--dsa-delete)'
    case 'active': return 'var(--dsa-active)'
    default: return 'var(--dsa-elevated)'
  }
}

export function StackVisualizer({ stack, currentStepData }: Props) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex w-full max-w-md flex-col items-stretch gap-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">
          <span>TOP</span>
          <span>idx</span>
        </div>

        {stack.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-md border border-dashed border-dsa-border-strong text-sm text-dsa-muted">
            Stack is empty
          </div>
        ) : (
          <ol className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {[...stack].reverse().map((value, displayIndex) => {
                const originalIndex = stack.length - 1 - displayIndex
                const isTop = originalIndex === stack.length - 1
                const state = resolveState(currentStepData, originalIndex)
                return (
                  <motion.li
                    key={`${originalIndex}-${String(value)}`}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        'w-12 text-right font-mono text-[10px] uppercase tracking-category',
                        isTop ? 'text-dsa-primary-container' : 'text-transparent'
                      )}
                    >
                      {isTop ? 'TOP' : ''}
                    </span>
                    <motion.div
                      layout
                      animate={{ backgroundColor: bgFor(state) }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'flex h-14 flex-1 items-center justify-center rounded-md border font-mono text-xl font-semibold tabular-nums tracking-data',
                        state === 'default'
                          ? 'border-dsa-border-strong text-dsa-text-strong'
                          : 'border-transparent text-[var(--on-accent)]'
                      )}
                    >
                      {String(value)}
                    </motion.div>
                    <span className="w-8 font-mono text-[11px] tabular-nums text-dsa-muted-soft">
                      {originalIndex}
                    </span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ol>
        )}

        <div className="font-mono text-[10px] uppercase tracking-category text-dsa-muted-soft">
          BASE · size {stack.length}
        </div>
      </div>
    </div>
  )
}
