'use client'

import { useState } from 'react'

import { HashTableVisualizer } from '@/components/hash-table/HashTableVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { HashTableMode } from '@/lib/algorithms/hash-table-ops'

const modes: Array<{ value: HashTableMode; label: string }> = [
  { value: 'insert', label: 'Insert' },
  { value: 'search', label: 'Search' },
  { value: 'delete', label: 'Delete' },
]

export default function HashTablePage() {
  const [activeMode, setActiveMode] = useState<HashTableMode>('insert')

  return (
    <Tabs
      value={activeMode}
      onValueChange={value => setActiveMode(value as HashTableMode)}
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
          {activeMode === mode.value && <HashTableVisualizer mode={mode.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
