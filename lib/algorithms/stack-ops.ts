import type { Step } from '@/lib/types'

export type StackValue = string | number

function formatValue(value: StackValue): string {
  return typeof value === 'number' ? String(value) : `"${value}"`
}

export function pushSteps(stack: readonly StackValue[], value: StackValue): Step[] {
  const topIndex = stack.length - 1
  const nextIndex = stack.length
  const steps: Step[] = []

  if (stack.length === 0) {
    steps.push({
      action: 'info',
      indices: [],
      description: 'Stack is empty. The pushed value becomes the first TOP element.',
    })
  } else {
    steps.push({
      action: 'highlight',
      indices: [topIndex],
      description: `Current TOP is at index ${topIndex}.`,
    })
  }

  steps.push({
    action: 'insert',
    indices: [nextIndex],
    description: `Push ${formatValue(value)} onto the stack at index ${nextIndex}.`,
  })

  steps.push({
    action: 'info',
    indices: [nextIndex],
    description: 'Push complete. New value is now TOP (LIFO rule).',
  })

  return steps
}

export function popSteps(stack: readonly StackValue[]): Step[] {
  if (stack.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot pop. Stack is empty.',
      },
    ]
  }

  const topIndex = stack.length - 1
  const popped = stack[topIndex]

  return [
    {
      action: 'highlight',
      indices: [topIndex],
      description: `TOP points to index ${topIndex}.`,
    },
    {
      action: 'delete',
      indices: [topIndex],
      description: `Pop removes ${formatValue(popped)} from TOP.`,
    },
    {
      action: 'info',
      indices: stack.length > 1 ? [topIndex - 1] : [],
      description:
        stack.length > 1
          ? `TOP moves to index ${topIndex - 1}.`
          : 'Stack becomes empty after pop.',
    },
  ]
}

export function peekSteps(stack: readonly StackValue[]): Step[] {
  if (stack.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot peek. Stack is empty.',
      },
    ]
  }

  const topIndex = stack.length - 1
  const topValue = stack[topIndex]

  return [
    {
      action: 'found',
      indices: [topIndex],
      description: `Peek reads TOP value ${formatValue(topValue)} at index ${topIndex}.`,
    },
    {
      action: 'info',
      indices: [topIndex],
      description: 'Peek does not remove the value from the stack.',
    },
  ]
}
