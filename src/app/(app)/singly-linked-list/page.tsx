'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SinglyLinkedListVisualizer, type SinglyListMode } from '@/components/linked-list/SinglyLinkedListVisualizer'

const tabItems: Array<{ value: SinglyListMode; label: string }> = [
  { value: 'create', label: 'Create' },
  { value: 'insert', label: 'Insert' },
  { value: 'delete', label: 'Delete' },
  { value: 'traverse', label: 'Traverse' },
]

export default function SinglyLinkedListPage() {
  const [mode, setMode] = useState<SinglyListMode>('create')

  return (
    <div className="space-y-3">
      <div className="px-4 pt-4 md:px-8">
        <Tabs value={mode} onValueChange={value => setMode(value as SinglyListMode)}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <SinglyLinkedListVisualizer mode={mode} />
    </div>
  )
}
