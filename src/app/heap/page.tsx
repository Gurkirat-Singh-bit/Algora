'use client'

import { useState } from 'react'

import { HeapVisualizer } from '@/components/heap/HeapVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { HeapType } from '@/lib/algorithms/heap-ops'

const heapTabs: Array<{ value: HeapType; label: string }> = [
  { value: 'min', label: 'Min Heap' },
  { value: 'max', label: 'Max Heap' },
]

export default function HeapPage() {
  const [activeTab, setActiveTab] = useState<HeapType>('min')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as HeapType)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {heapTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {heapTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <HeapVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
