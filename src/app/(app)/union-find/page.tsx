'use client'

import { useState } from 'react'

import { UnionFindVisualizer } from '@/components/union-find/UnionFindVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UnionFindMode } from '@/lib/algorithms/union-find-ops'

const modes: Array<{ value: UnionFindMode; label: string }> = [
  { value: 'union', label: 'Union' },
  { value: 'find', label: 'Find + compress' },
]

export default function UnionFindPage() {
  const [activeMode, setActiveMode] = useState<UnionFindMode>('union')

  return (
    <Tabs
      value={activeMode}
      onValueChange={value => setActiveMode(value as UnionFindMode)}
      className="gap-3 pt-3"
    >
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {modes.map(mode => (
            <TabsTrigger key={mode.value} value={mode.value} className="shrink-0">
              {mode.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {modes.map(mode => (
        <TabsContent key={mode.value} value={mode.value} className="mt-0">
          {activeMode === mode.value && <UnionFindVisualizer mode={mode.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
