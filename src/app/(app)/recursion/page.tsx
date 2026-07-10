'use client'

import { useState } from 'react'

import { FactorialVisualizer } from '@/components/recursion/FactorialVisualizer'
import { FibonacciVisualizer } from '@/components/recursion/FibonacciVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type RecursionTab = 'factorial' | 'fibonacci'

const recursionTabs: Array<{ value: RecursionTab; label: string }> = [
  { value: 'factorial', label: 'Factorial' },
  { value: 'fibonacci', label: 'Fibonacci' },
]

export default function RecursionPage() {
  const [activeTab, setActiveTab] = useState<RecursionTab>('factorial')

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as RecursionTab)} className="gap-3 pt-3">
      <div className="px-4 md:px-8">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-dsa-surface/85 p-1">
          {recursionTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="factorial" className="mt-0">
        {activeTab === 'factorial' && <FactorialVisualizer />}
      </TabsContent>

      <TabsContent value="fibonacci" className="mt-0">
        {activeTab === 'fibonacci' && <FibonacciVisualizer />}
      </TabsContent>
    </Tabs>
  )
}
