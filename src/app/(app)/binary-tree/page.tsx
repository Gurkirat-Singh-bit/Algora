'use client'

import { useState } from 'react'

import { BinaryTreeVisualizer, type BinaryTreeMode } from '@/components/tree/BinaryTreeVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const treeTabs: Array<{ value: BinaryTreeMode; label: string }> = [
  { value: 'inorder', label: 'Inorder' },
  { value: 'preorder', label: 'Preorder' },
  { value: 'postorder', label: 'Postorder' },
]

export default function BinaryTreePage() {
  const [activeTab, setActiveTab] = useState<BinaryTreeMode>('inorder')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as BinaryTreeMode)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {treeTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {treeTabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {activeTab === tab.value && <BinaryTreeVisualizer mode={tab.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
