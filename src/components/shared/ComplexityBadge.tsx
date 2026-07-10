'use client'
import type { ComplexityInfo } from '@/lib/types'

interface Props {
  data: ComplexityInfo[]
}

export function ComplexityBadge({ data }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {data.map(item => (
        <div
          key={item.operation}
          className="flex flex-col rounded-md border border-dsa-border bg-dsa-card/60 px-3 py-2"
        >
          <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
            {item.operation}
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-sm text-dsa-text-strong">{item.time}</span>
            <span className="font-mono text-[11px] text-dsa-muted">space {item.space}</span>
          </div>
          {item.note && <p className="mt-1 max-w-xs text-[11px] leading-4 text-dsa-muted">{item.note}</p>}
        </div>
      ))}
    </div>
  )
}
