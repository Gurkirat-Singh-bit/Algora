'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DoublyLinkedListVisualizer, type DoublyListMode } from '@/components/linked-list/DoublyLinkedListVisualizer'

const tabItems: Array<{ value: DoublyListMode; label: string }> = [
  { value: 'insert', label: 'Insert' },
  { value: 'delete', label: 'Delete' },
  { value: 'forwardTraverse', label: 'Forward Traverse' },
  { value: 'backwardTraverse', label: 'Backward Traverse' },
]

export default function DoublyLinkedListPage() {
  const [mode, setMode] = useState<DoublyListMode>('insert')

  return (
    <div className="space-y-3">
      <div className="px-4 pt-4 md:px-8">
        <Tabs value={mode} onValueChange={value => setMode(value as DoublyListMode)}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <DoublyLinkedListVisualizer mode={mode} />
    </div>
  )
}
