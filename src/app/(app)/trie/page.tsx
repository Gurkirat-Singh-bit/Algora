'use client'

import { useState } from 'react'

import { TrieVisualizer } from '@/components/trie/TrieVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TrieMode } from '@/lib/algorithms/trie-ops'

const modes: Array<{ value: TrieMode; label: string }> = [
  { value: 'insert', label: 'Insert' },
  { value: 'search', label: 'Search' },
  { value: 'delete', label: 'Delete' },
]

export default function TriePage() {
  const [activeMode, setActiveMode] = useState<TrieMode>('insert')

  return (
    <Tabs
      value={activeMode}
      onValueChange={value => setActiveMode(value as TrieMode)}
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
          {activeMode === mode.value && <TrieVisualizer mode={mode.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
