'use client'

import { useState } from 'react'

import { type SearchingMethod } from '@/lib/algorithms/searching-ops'
import { SearchingVisualizer } from '@/components/searching/SearchingVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const searchingTabs: { value: SearchingMethod; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'binary', label: 'Binary' },
]

export default function SearchingPage() {
  const [activeTab, setActiveTab] = useState<SearchingMethod>('linear')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as SearchingMethod)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {searchingTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {searchingTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <SearchingVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}