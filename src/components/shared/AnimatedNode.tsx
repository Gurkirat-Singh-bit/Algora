'use client'
import { motion } from 'framer-motion'
import type { NodeData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  value: string | number
  state?: NodeData['state']
  size?: 'sm' | 'md' | 'lg' | 'xl'
  index?: number
  showIndex?: boolean
  className?: string
}

const sizeMap: Record<NonNullable<Props['size']>, { box: string; text: string; idx: string }> = {
  sm: { box: 'h-12 w-12', text: 'text-base', idx: 'text-[10px]' },
  md: { box: 'h-16 w-16', text: 'text-xl', idx: 'text-[11px]' },
  lg: { box: 'h-20 w-20', text: 'text-2xl', idx: 'text-xs' },
  xl: { box: 'h-24 w-24', text: 'text-3xl', idx: 'text-xs' },
}

function backgroundFor(state: NodeData['state']): string {
  switch (state) {
    case 'active':
      return 'var(--dsa-active)'
    case 'comparing':
      return 'var(--dsa-compare)'
    case 'found':
      return 'var(--dsa-found)'
    case 'inserting':
      return 'var(--dsa-insert)'
    case 'deleting':
      return 'var(--dsa-delete)'
    default:
      return 'var(--dsa-elevated)'
  }
}

function borderFor(state: NodeData['state']): string {
  if (state === 'default') return 'var(--dsa-border-strong)'
  return 'transparent'
}

function textFor(state: NodeData['state']): string {
  if (state === 'default') return 'var(--dsa-text-strong)'
  return 'var(--on-accent)'
}

export function AnimatedNode({ value, state = 'default', size = 'lg', index, showIndex = false, className }: Props) {
  const dim = sizeMap[size]
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        layout
        className={cn(
          dim.box,
          'flex items-center justify-center rounded-md font-mono font-semibold tabular-nums border',
          className
        )}
        animate={{
          backgroundColor: backgroundFor(state),
          color: textFor(state),
          borderColor: borderFor(state),
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={cn(dim.text, 'tracking-data')}>{value}</span>
      </motion.div>
      {showIndex && index !== undefined && (
        <span className={cn(dim.idx, 'font-mono text-dsa-muted-soft tabular-nums')}>{index}</span>
      )}
    </div>
  )
}
