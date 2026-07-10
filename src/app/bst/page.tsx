'use client'

import { useState } from 'react'

import { BSTVisualizer, type BSTMode } from '@/components/tree/BSTVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const bstTabs: Array<{ value: BSTMode; label: string }> = [
  { value: 'insert', label: 'Insert' },
  { value: 'search', label: 'Search' },
  { value: 'delete', label: 'Delete' },
]

export default function BSTPage() {
  const [activeTab, setActiveTab] = useState<BSTMode>('insert')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as BSTMode)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {bstTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {bstTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <BSTVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
