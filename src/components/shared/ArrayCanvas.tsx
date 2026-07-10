'use client'

import { motion } from 'framer-motion'
import type { NodeData } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface ArrayPointer {
  index: number
  label: string
  tone?: 'primary' | 'compare' | 'found'
}

interface Props {
  values: number[]
  states: NodeData['state'][]
  pointers?: ArrayPointer[]
  size?: 'md' | 'lg'
  emptyLabel?: string
}

const sizeMap = {
  md: { cell: 'h-16 min-w-[60px] text-xl', idx: 'text-[10px]' },
  lg: { cell: 'h-20 min-w-[72px] text-2xl', idx: 'text-[11px]' },
}

function bgFor(state: NodeData['state']): string {
  switch (state) {
    case 'active': return 'var(--dsa-active)'
    case 'comparing': return 'var(--dsa-compare)'
    case 'found': return 'var(--dsa-found)'
    case 'inserting': return 'var(--dsa-insert)'
    case 'deleting': return 'var(--dsa-delete)'
    default: return 'var(--dsa-elevated)'
  }
}

function fgFor(state: NodeData['state']): string {
  return state === 'default' ? 'var(--dsa-text-strong)' : 'var(--on-accent)'
}

const tonePalette: Record<NonNullable<ArrayPointer['tone']>, string> = {
  primary: 'bg-dsa-primary-container text-[var(--on-accent)]',
  compare: 'bg-dsa-compare text-[var(--on-accent)]',
  found: 'bg-dsa-found text-[var(--on-accent)]',
}

export function ArrayCanvas({ values, states, pointers = [], size = 'lg', emptyLabel = 'Provide an array to visualize.' }: Props) {
  const dim = sizeMap[size]

  if (values.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <p className="text-sm text-dsa-muted">{emptyLabel}</p>
      </div>
    )
  }

  const groupedPointers: Record<number, ArrayPointer[]> = {}
  for (const p of pointers) {
    const list = groupedPointers[p.index] ?? []
    list.push(p)
    groupedPointers[p.index] = list
  }

  return (
    <div className="flex h-full items-center justify-center overflow-x-auto p-6 md:p-10">
      <div className="flex items-end gap-2.5 md:gap-3">
        {values.map((value, index) => {
          const state = states[index] ?? 'default'
          const cellPointers = groupedPointers[index] ?? []
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="flex h-7 flex-col items-center gap-1">
                {cellPointers.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-1">
                    {cellPointers.map(p => (
                      <span
                        key={p.label}
                        className={cn(
                          'inline-flex items-center rounded px-1.5 py-px font-mono text-[10px] font-semibold tracking-data',
                          tonePalette[p.tone ?? 'primary']
                        )}
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="h-4" />
                )}
                <span
                  className={cn(
                    'h-2 w-px',
                    cellPointers.length > 0 ? 'bg-dsa-primary-container' : 'bg-transparent'
                  )}
                />
              </div>

              <motion.div
                layout
                className={cn(
                  dim.cell,
                  'flex items-center justify-center rounded-md font-mono font-semibold tabular-nums tracking-data border',
                  state === 'default' ? 'border-dsa-border-strong' : 'border-transparent'
                )}
                animate={{
                  backgroundColor: bgFor(state),
                  color: fgFor(state),
                }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {value}
              </motion.div>

              <span className={cn(dim.idx, 'font-mono text-dsa-muted-soft tabular-nums')}>{index}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
