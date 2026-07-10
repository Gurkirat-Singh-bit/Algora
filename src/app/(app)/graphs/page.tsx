'use client'

import { useState } from 'react'

import { GraphVisualizer, type GraphTraversalMode } from '@/components/graphs/GraphVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const graphTabs: Array<{ value: GraphTraversalMode; label: string }> = [
  { value: 'bfs', label: 'BFS' },
  { value: 'dfs', label: 'DFS' },
]

export default function GraphsPage() {
  const [activeTab, setActiveTab] = useState<GraphTraversalMode>('bfs')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as GraphTraversalMode)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {graphTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {graphTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <GraphVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
