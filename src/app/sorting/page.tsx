'use client'

import { useState } from 'react'

import { SortingVisualizer } from '@/components/sorting/SortingVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SortingMethod } from '@/lib/algorithms/sorting-ops'

const sortingTabs: Array<{ value: SortingMethod; label: string }> = [
  { value: 'bubble', label: 'Bubble' },
  { value: 'selection', label: 'Selection' },
  { value: 'insertion', label: 'Insertion' },
  { value: 'merge', label: 'Merge' },
  { value: 'quick', label: 'Quick' },
]

export default function SortingPage() {
  const [activeTab, setActiveTab] = useState<SortingMethod>('bubble')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as SortingMethod)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {sortingTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {sortingTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <SortingVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
