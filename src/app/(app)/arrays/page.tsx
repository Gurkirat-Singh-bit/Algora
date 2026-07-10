'use client'

import { useMemo, useState } from 'react'

import { ArrayVisualizer, type ArrayMode } from '@/components/arrays/ArrayVisualizer'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ArrayGroup = 'operations' | 'search'

const arrayTabs: { value: ArrayMode; label: string; group: ArrayGroup }[] = [
  { value: 'insert', label: 'Insert', group: 'operations' },
  { value: 'delete', label: 'Delete', group: 'operations' },
  { value: 'traverse', label: 'Traverse', group: 'operations' },
  { value: 'linear', label: 'Linear Search', group: 'search' },
  { value: 'binary', label: 'Binary Search', group: 'search' },
]

const groupMeta: { value: ArrayGroup; label: string }[] = [
  { value: 'operations', label: 'Array Operations' },
  { value: 'search', label: 'Search Algorithms' },
]

export default function ArraysPage() {
  const [activeGroup, setActiveGroup] = useState<ArrayGroup>('operations')
  const [activeTab, setActiveTab] = useState<ArrayMode>('insert')

  const groupTabs = useMemo(() => {
    return arrayTabs.filter(tab => tab.group === activeGroup)
  }, [activeGroup])

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as ArrayMode)} className="gap-3 pt-3">
      <div className="space-y-2 px-4 md:px-8">
        <div className="flex flex-wrap gap-2">
          {groupMeta.map(group => {
            const active = group.value === activeGroup
            return (
              <Button
                key={group.value}
                variant={active ? 'default' : 'outline'}
                onClick={() => {
                  setActiveGroup(group.value)
                  const firstGroupTab = arrayTabs.find(tab => tab.group === group.value)
                  if (firstGroupTab) {
                    setActiveTab(firstGroupTab.value)
                  }
                }}
                className="h-9"
              >
                {group.label}
              </Button>
            )
          })}
        </div>

        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {groupTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {arrayTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <ArrayVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}