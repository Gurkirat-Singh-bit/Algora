'use client'
import { ComplexityBadge } from './ComplexityBadge'
import { ExportButton } from './ExportButton'
import type { ComplexityInfo } from '@/lib/types'

interface Props {
  title: string
  description?: string
  complexityData?: ComplexityInfo[]
  children: React.ReactNode
  controls?: React.ReactNode
  headerExtra?: React.ReactNode
  exportTargetSelector?: string
}

export function VisualizerLayout({
  title,
  description,
  complexityData,
  children,
  controls,
  headerExtra,
  exportTargetSelector,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="surface-floor z-20 shrink-0 border-b border-dsa-border lg:sticky lg:top-0">
        <div className="px-5 pb-5 pt-6 md:px-8 md:pb-6 md:pt-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-display text-2xl font-semibold text-dsa-text-strong md:text-[28px]">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 max-w-[65ch] text-[14px] leading-6 text-dsa-muted">{description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerExtra}
              <ExportButton
                targetSelector={exportTargetSelector}
                filename={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`}
              />
            </div>
          </div>
          {complexityData && complexityData.length > 0 && (
            <div className="mt-4">
              <ComplexityBadge data={complexityData} />
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-10 pt-5 md:px-8 md:pt-6">
        {controls && <div className="flex flex-col gap-3">{controls}</div>}

        <div
          data-canvas
          className="relative min-h-[24rem] flex-1 overflow-hidden rounded-lg border border-dsa-border surface-floor"
        >
          {children}
        </div>
      </main>
    </div>
  )
}
