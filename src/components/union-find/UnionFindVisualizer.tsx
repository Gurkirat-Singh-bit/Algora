'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, Braces } from 'lucide-react'

import {
  createUnionFind,
  runFind,
  runUnion,
  unionFindGroups,
  unionFindPseudoCode,
  type UnionFindMode,
  type UnionFindState,
} from '@/lib/algorithms/union-find-ops'
import type { ComplexityInfo, NodeData, Step } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ControlPanel, type FieldDef } from '@/components/shared/ControlPanel'
import { VisualizerLayout } from '@/components/shared/VisualizerLayout'
import { VizControlsBar } from '@/components/shared/VizControls'
import { VizShell } from '@/components/shared/VizShell'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useStepRunner } from '@/hooks/useStepRunner'

interface Props {
  mode: UnionFindMode
}

const INITIAL_STATE: UnionFindState = {
  parent: [0, 0, 2, 2, 4, 4, 6, 6],
  rank: [1, 0, 1, 0, 1, 0, 1, 0],
}

const meta: Record<
  UnionFindMode,
  { title: string; description: string; complexity: ComplexityInfo[]; action: string }
> = {
  union: {
    title: 'Disjoint Set Union',
    description: 'Merge two components with union by rank while keeping representative trees shallow.',
    complexity: [{
      operation: 'Union',
      time: 'O(α(n)) amortized',
      space: 'O(n)',
      note: 'α(n) is the inverse Ackermann function and grows extremely slowly.',
    }],
    action: 'Union values',
  },
  find: {
    title: 'Disjoint Set Find',
    description: 'Follow parent links to a representative, then compress the path for future queries.',
    complexity: [{
      operation: 'Find',
      time: 'O(α(n)) amortized',
      space: 'O(1)',
    }],
    action: 'Find root',
  },
}

function parseIndex(raw: string, label: string): number {
  const value = Number(raw)
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`)
  return value
}

function stateFor(value: number, step: Step | null): NodeData['state'] {
  if (!step?.indices.includes(value)) return 'default'
  if (step.action === 'compare') return 'comparing'
  if (step.action === 'found') return 'found'
  if (step.action === 'insert') return 'inserting'
  return 'active'
}

function stateColor(state: NodeData['state']): string {
  if (state === 'comparing') return 'var(--dsa-compare)'
  if (state === 'found') return 'var(--dsa-found)'
  if (state === 'inserting') return 'var(--dsa-insert)'
  if (state === 'active') return 'var(--dsa-active)'
  return 'var(--dsa-elevated)'
}

export function UnionFindVisualizer({ mode }: Props) {
  const runner = useStepRunner()
  const [state, setState] = useState<UnionFindState>(INITIAL_STATE)
  const [snapshots, setSnapshots] = useState<UnionFindState[]>([INITIAL_STATE])
  const [status, setStatus] = useState('Run an operation to inspect parent links and set representatives.')
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

  const displayedState = snapshots[runner.currentStep] ?? state
  const groups = useMemo(() => unionFindGroups(displayedState), [displayedState])

  const fields: FieldDef[] = mode === 'union'
    ? [
        { name: 'a', label: 'First value', type: 'number', placeholder: '1' },
        { name: 'b', label: 'Second value', type: 'number', placeholder: '3' },
      ]
    : [{ name: 'value', label: 'Value', type: 'number', placeholder: '3' }]

  const handleRun = (values: Record<string, string>) => {
    try {
      const run = mode === 'union'
        ? runUnion(state, parseIndex(values.a, 'First value'), parseIndex(values.b, 'Second value'))
        : runFind(state, parseIndex(values.value, 'Value'))
      setState(run.nextState)
      setSnapshots(run.snapshots)
      runner.setSteps(run.steps)
      setStatus(mode === 'union'
        ? run.merged
          ? `Sets merged under root ${run.root}.`
          : `Values already share root ${run.root}.`
        : `Representative root: ${run.root}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid disjoint set input.'
      runner.setSteps([{ action: 'info', indices: [], description: message }])
      setStatus(message)
    }
  }

  const resetState = () => {
    const next = {
      parent: [...INITIAL_STATE.parent],
      rank: [...INITIAL_STATE.rank],
    }
    setState(next)
    setSnapshots([next])
    runner.setSteps([])
    setStatus('Restored four example components.')
  }

  const resetSize = (values: Record<string, string>) => {
    try {
      const next = createUnionFind(parseIndex(values.size, 'Size'))
      setState(next)
      setSnapshots([next])
      runner.setSteps([])
      setStatus(`Created ${next.parent.length} singleton sets.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Invalid size.')
    }
  }

  return (
    <VisualizerLayout
      title={presentation.title}
      description={presentation.description}
      complexityData={presentation.complexity}
      controls={(
        <div className="space-y-3">
          <ControlPanel
            fields={fields}
            actions={[
              { label: presentation.action, onClick: handleRun },
              { label: 'Reset example', onClick: resetState, variant: 'outline' },
            ]}
          />
          <ControlPanel
            fields={[{ name: 'size', label: 'New set size', type: 'number', placeholder: '8' }]}
            actions={[{ label: 'Create singletons', onClick: resetSize, variant: 'secondary' }]}
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
        canvasLabel={`Disjoint set forest · ${groups.length} components`}
        currentDescription={runner.currentStepData?.description}
        fallbackMessage={status}
        pseudoCode={unionFindPseudoCode[mode]}
        steps={runner.steps}
        currentStep={runner.currentStep}
        currentLine={runner.currentStepData?.pseudoCodeLine}
        onJump={runner.jumpToStep}
        canvasFooter={`Parent array: [${displayedState.parent.join(', ')}]`}
      >
        <div className="h-full overflow-auto p-3 sm:p-5">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <section aria-labelledby="sets-heading">
              <h2
                id="sets-heading"
                className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft"
              >
                <Braces className="h-3.5 w-3.5" aria-hidden="true" />
                Current components
              </h2>
              <div className="flex flex-wrap gap-2">
                {groups.map(group => (
                  <div
                    key={group[0]}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-dsa-border surface-low px-3 font-mono text-xs"
                  >
                    <span className="text-dsa-primary-container">{`{${group.join(', ')}}`}</span>
                    <span className="text-dsa-muted">root {displayedState.parent[group[0]]}</span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="forest-heading">
              <h2
                id="forest-heading"
                className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-category text-dsa-muted-soft"
              >
                Parent links
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {displayedState.parent.map((parent, value) => {
                  const nodeState = stateFor(value, runner.currentStepData)
                  const root = parent === value
                  return (
                    <div
                      key={value}
                      className={cn(
                        'flex min-h-28 flex-col items-center justify-center rounded-md border surface-low p-3 text-center',
                        nodeState === 'default' ? 'border-dsa-border' : 'border-dsa-border-strong'
                      )}
                    >
                      <div
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-full border font-mono text-sm font-semibold',
                          nodeState === 'default'
                            ? 'border-dsa-border-strong text-dsa-text-strong'
                            : 'border-transparent text-[var(--on-accent)]'
                        )}
                        style={{ background: stateColor(nodeState) }}
                      >
                        {value}
                      </div>
                      {root ? (
                        <span className="mt-2 font-mono text-[10px] uppercase tracking-data text-dsa-primary-container">
                          root · rank {displayedState.rank[value]}
                        </span>
                      ) : (
                        <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-dsa-muted">
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          parent {parent}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </VizShell>
    </VisualizerLayout>
  )
}
