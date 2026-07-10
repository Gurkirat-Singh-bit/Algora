'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CircularLinkedListVisualizer, type CircularListMode } from '@/components/linked-list/CircularLinkedListVisualizer'

const tabItems: Array<{ value: CircularListMode; label: string }> = [
  { value: 'insert', label: 'Insert' },
  { value: 'delete', label: 'Delete' },
  { value: 'traverse', label: 'Traverse' },
]

export default function CircularLinkedListPage() {
  const [mode, setMode] = useState<CircularListMode>('insert')

  return (
    <div className="space-y-3">
      <div className="px-4 pt-4 md:px-8">
        <Tabs value={mode} onValueChange={value => setMode(value as CircularListMode)}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <CircularLinkedListVisualizer mode={mode} />
    </div>
  )
}
