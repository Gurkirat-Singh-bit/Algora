'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Hash } from 'lucide-react'

import {
  createHashTable,
  hashTablePseudoCode,
  runHashTableOperation,
  type HashTableMode,
  type HashTableSnapshot,
} from '@/lib/algorithms/hash-table-ops'
import type { ComplexityInfo, NodeData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ControlPanel } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizControlsBar } from '@/components/shared/VizControls'
import { VizShell } from '@/components/shared/VizShell'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useStepRunner } from '@/hooks/useStepRunner'

interface Props {
  mode: HashTableMode
}

const INITIAL_KEYS = [18, 41, 22, 44, 59, 32]
const INITIAL_TABLE = createHashTable(INITIAL_KEYS)

const meta: Record<
  HashTableMode,
  { title: string; description: string; complexity: ComplexityInfo[]; action: string }
> = {
  insert: {
    title: 'Hash Table Insert',
    description: 'Map an integer key to a bucket, then resolve collisions with separate chaining.',
    complexity: [{
      operation: 'Insert',
      time: 'O(1) average',
      space: 'O(n)',
      worst: 'O(n)',
      note: 'A long collision chain produces the worst case.',
    }],
    action: 'Insert key',
  },
  search: {
    title: 'Hash Table Search',
    description: 'Hash the key once, then inspect only the selected collision chain.',
    complexity: [{
      operation: 'Search',
      time: 'O(1) average',
      space: 'O(1)',
      worst: 'O(n)',
    }],
    action: 'Search key',
  },
  delete: {
    title: 'Hash Table Delete',
    description: 'Locate a key inside its bucket chain and unlink it without shifting other buckets.',
    complexity: [{
      operation: 'Delete',
      time: 'O(1) average',
      space: 'O(1)',
      worst: 'O(n)',
    }],
    action: 'Delete key',
  },
}

function stateFor(
  bucketIndex: number,
  chainIndex: number,
  step: ReturnType<typeof useStepRunner>['currentStepData']
): NodeData['state'] {
  if (!step || step.indices[0] !== bucketIndex || step.indices[1] !== chainIndex) {
    return 'default'
  }
  if (step.action === 'compare') return 'comparing'
  if (step.action === 'found') return 'found'
  if (step.action === 'insert') return 'inserting'
  if (step.action === 'delete') return 'deleting'
  return 'active'
}

function cellColor(state: NodeData['state']): string {
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  if (state === 'deleting') return 'var(--dsa-delete)'
  return 'var(--dsa-elevated)'
}

export function HashTableVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [table, setTable] = useState<HashTableSnapshot>(INITIAL_TABLE)
  const [snapshots, setSnapshots] = useState<HashTableSnapshot[]>([INITIAL_TABLE])
  const [status, setStatus] = useState('Run an operation to inspect hashing and collisions.')
  const presentation = meta[mode]

  useKeyboardControls({
    isPlaying: runner.isPlaying,
    hasSteps: runner.steps.length > 0,
    isComplete: runner.isComplete,
    play: runner.play,
    pause: runner.pause,
    stepForward: runner.stepForward,
    stepBackward: runner.stepBackward,
    reset: runner.reset,
    setSpeed: runner.setSpeed,
  })

  const displayedTable = useMemo(
    () => snapshots[runner.currentStep] ?? table,
    [runner.currentStep, snapshots, table]
  )

  const handleRun = (values: Record<string, string>) => {
    const value = Number(values.key)
    if (!Number.isInteger(value)) {
      const message = 'Provide an integer key.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
      return
    }

    const run = runHashTableOperation(table, value, mode)
    setTable(run.nextTable)
    setSnapshots(run.snapshots)
    runner.setSteps(run.steps)
    setStatus(`${presentation.action} ${value} at bucket ${run.bucket}.`)
  }

  const resetTable = () => {
    const next = createHashTable(INITIAL_KEYS)
    setTable(next)
    setSnapshots([next])
    runner.setSteps([])
    setStatus('Restored the example hash table.')
  }

  return (
    <VisualizerLayout
      title={presentation.title}
      description={presentation.description}
      complexityData={presentation.complexity}
      controls={(
        <div className="space-y-3">
          <ControlPanel
            fields={[{ name: 'key', label: 'Integer key', type: 'number', placeholder: '25' }]}
            actions={[
              { label: presentation.action, onClick: handleRun },
              { label: 'Reset table', onClick: resetTable, variant: 'outline' },
            ]}
          />
          <VizControlsBar
            isPlaying={runner.isPlaying}
            isComplete={runner.isComplete}
            hasSteps={runner.steps.length > 0}
            speed={runner.speed}
            currentStep={runner.currentStep}
            totalSteps={runner.steps.length}
            status={status}
            onPlay={runner.play}
            onPause={runner.pause}
            onStepForward={runner.stepForward}
            onStepBackward={runner.stepBackward}
            onReset={runner.reset}
            onSpeedChange={runner.setSpeed}
          />
        </div>
      )}
    >
      <VizShell
        canvasLabel={`Separate chaining · ${displayedTable.length} buckets`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={hashTablePseudoCode[mode]}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter="Hash function: ((key modulo capacity) + capacity) modulo capacity"
      >
        <div className="h-full overflow-auto p-3 sm:p-5">
          <div className="mx-auto max-w-3xl divide-y divide-dsa-border overflow-hidden rounded-md border border-dsa-border surface-low">
            {displayedTable.map((chain, bucketIndex) => {
              const bucketActive = runner.currentStepData?.indices[0] === bucketIndex
              return (
                <div
                  key={bucketIndex}
                  className={cn(
                    'grid min-h-16 grid-cols-[3rem_minmax(0,1fr)] items-center transition-colors sm:grid-cols-[4rem_minmax(0,1fr)]',
                    bucketActive && 'bg-dsa-primary-container/8'
                  )}
                >
                  <div className="grid h-full place-items-center border-r border-dsa-border font-mono text-sm font-semibold text-dsa-primary-container">
                    <span className="inline-flex items-center gap-1">
                      <Hash className="h-3 w-3" aria-hidden="true" />
                      {bucketIndex}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-3 py-2">
                    {chain.length === 0 ? (
                      <span className="font-mono text-xs text-dsa-muted-soft">empty</span>
                    ) : chain.map((value, chainIndex) => {
                      const state = stateFor(bucketIndex, chainIndex, runner.currentStepData)
                      return (
                        <div key={value} className="flex shrink-0 items-center gap-2">
                          {chainIndex > 0 && (
                            <ArrowRight className="h-3.5 w-3.5 text-dsa-muted-soft" aria-hidden="true" />
                          )}
                          <div
                            className={cn(
                              'grid h-11 min-w-12 place-items-center rounded-md border px-3 font-mono text-sm font-semibold transition-colors',
                              state === 'default'
                                ? 'border-dsa-border-strong text-dsa-text-strong'
                                : 'border-transparent text-[var(--on-accent)]'
                            )}
                            style={{ background: cellColor(state) }}
                          >
                            {value}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </VizShell>
    </VisualizerLayout>
  )
}
