'use client'
import { cn } from '@/lib/utils'

interface Props {
  lines: string[]
  highlightLine?: number
}

export function CodeHighlight({ lines, highlightLine }: Props) {
  return (
    <div className="overflow-hidden rounded-md border border-dsa-border surface-floor">
      <div className="flex items-center justify-between border-b border-dsa-border px-3 py-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
          Pseudocode
        </span>
        {highlightLine !== undefined && (
          <span className="font-mono text-[10px] tabular-nums text-dsa-muted-soft">
            L{highlightLine + 1}
          </span>
        )}
      </div>
      <pre className="overflow-x-auto p-2 font-mono text-[12px] leading-6">
        {lines.map((line, i) => {
          const active = i === highlightLine
          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-3 rounded-sm px-2 py-0.5 transition-colors',
                active ? 'bg-dsa-primary-container/14 text-dsa-text-strong' : 'text-dsa-text/75'
              )}
            >
              <span className="select-none w-5 shrink-0 text-right text-dsa-muted-soft tabular-nums">
                {i + 1}
              </span>
              <span className="whitespace-pre">{line}</span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}
