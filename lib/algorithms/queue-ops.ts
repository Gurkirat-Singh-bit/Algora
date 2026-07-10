import type { Step } from '@/lib/types'

export type QueueValue = string | number

export interface CircularQueueState<T extends QueueValue = QueueValue> {
  slots: Array<T | null>
  front: number
  rear: number
  size: number
}

function formatValue(value: QueueValue): string {
  return typeof value === 'number' ? String(value) : `"${value}"`
}

function uniqueIndices(indices: number[]): number[] {
  return [...new Set(indices.filter(index => index >= 0))]
}

export function enqueueSteps(queue: readonly QueueValue[], value: QueueValue): Step[] {
  const insertIndex = queue.length
  const currentRear = queue.length - 1
  const steps: Step[] = []

  if (queue.length === 0) {
    steps.push({
      action: 'info',
      indices: [],
      description: 'Queue is empty. The new value will become both Front and Rear.',
    })
  } else {
    steps.push({
      action: 'highlight',
      indices: [0, currentRear],
      description: `Front is index 0 and Rear is index ${currentRear}.`,
    })
  }

  steps.push({
    action: 'insert',
    indices: [insertIndex],
    description: `Enqueue ${formatValue(value)} at Rear index ${insertIndex}.`,
  })

  steps.push({
    action: 'info',
    indices: uniqueIndices([0, insertIndex]),
    description: 'Enqueue complete. Queue still follows FIFO ordering.',
  })

  return steps
}

export function dequeueSteps(queue: readonly QueueValue[]): Step[] {
  if (queue.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot dequeue. Queue is empty.',
      },
    ]
  }

  const removed = queue[0]

  return [
    {
      action: 'highlight',
      indices: [0],
      description: `Front points to ${formatValue(removed)} at index 0.`,
    },
    {
      action: 'delete',
      indices: [0],
      description: `Dequeue removes ${formatValue(removed)} from the Front.`,
    },
    {
      action: 'info',
      indices: queue.length > 1 ? [0] : [],
      description:
        queue.length > 1
          ? 'All remaining elements shift one position toward the Front.'
          : 'Queue becomes empty after dequeue.',
    },
  ]
}

export function circularEnqueueSteps(state: CircularQueueState, value: QueueValue): Step[] {
  const capacity = state.slots.length

  if (capacity === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot enqueue. Circular queue capacity is zero.',
      },
    ]
  }

  if (state.size >= capacity) {
    return [
      {
        action: 'info',
        indices: uniqueIndices([state.front, state.rear]),
        description: `Cannot enqueue. Circular queue is full (${state.size}/${capacity}).`,
      },
    ]
  }

  const insertIndex = state.size === 0 ? 0 : (state.rear + 1) % capacity
  const nextFront = state.size === 0 ? 0 : state.front
  const wrapHappened = state.size > 0 && insertIndex <= state.rear

  return [
    state.size === 0
      ? {
          action: 'info',
          indices: [],
          description: 'Queue is empty. Front and Rear will both initialize to index 0.',
        }
      : {
          action: 'highlight',
          indices: uniqueIndices([state.front, state.rear]),
          description: `Front is ${state.front} and Rear is ${state.rear}.`,
        },
    {
      action: 'insert',
      indices: [insertIndex],
      description: `Enqueue ${formatValue(value)} into slot ${insertIndex}.`,
    },
    {
      action: 'info',
      indices: uniqueIndices([nextFront, insertIndex]),
      description: wrapHappened
        ? `Rear wraps around to index ${insertIndex}; Front remains at index ${nextFront}.`
        : `Rear moves to index ${insertIndex}; Front remains at index ${nextFront}.`,
    },
  ]
}

export function circularDequeueSteps(state: CircularQueueState): Step[] {
  if (state.size === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot dequeue. Circular queue is empty.',
      },
    ]
  }

  const capacity = state.slots.length
  const removeIndex = state.front
  const removedValue = state.slots[removeIndex]

  if (state.size === 1) {
    return [
      {
        action: 'highlight',
        indices: [removeIndex],
        description: `Front and Rear both point to index ${removeIndex}.`,
      },
      {
        action: 'delete',
        indices: [removeIndex],
        description: `Dequeue removes ${formatValue(removedValue ?? '-')} from slot ${removeIndex}.`,
      },
      {
        action: 'info',
        indices: [],
        description: 'Queue becomes empty. Front and Rear reset.',
      },
    ]
  }

  const nextFront = (state.front + 1) % capacity
  const wrapHappened = nextFront < state.front

  return [
    {
      action: 'highlight',
      indices: uniqueIndices([state.front, state.rear]),
      description: `Front is at ${state.front} and Rear is at ${state.rear}.`,
    },
    {
      action: 'delete',
      indices: [removeIndex],
      description: `Dequeue removes ${formatValue(removedValue ?? '-')} from slot ${removeIndex}.`,
    },
    {
      action: 'info',
      indices: uniqueIndices([nextFront, state.rear]),
      description: wrapHappened
        ? `Front wraps to index ${nextFront}; Rear stays at index ${state.rear}.`
        : `Front moves to index ${nextFront}; Rear stays at index ${state.rear}.`,
    },
  ]
}

export function dequeInsertFrontSteps(deque: readonly QueueValue[], value: QueueValue): Step[] {
  const steps: Step[] = []

  if (deque.length === 0) {
    steps.push({
      action: 'info',
      indices: [],
      description: 'Deque is empty. New value will become both Front and Rear.',
    })
  } else {
    steps.push({
      action: 'highlight',
      indices: uniqueIndices([0, deque.length - 1]),
      description: `Current Front is index 0 and Rear is index ${deque.length - 1}.`,
    })
  }

  steps.push({
    action: 'insert',
    indices: [0],
    description: `Insert ${formatValue(value)} at the Front end.`,
  })

  steps.push({
    action: 'info',
    indices: uniqueIndices([0, deque.length]),
    description: 'Front insertion complete. Deque supports updates from both ends.',
  })

  return steps
}

export function dequeInsertRearSteps(deque: readonly QueueValue[], value: QueueValue): Step[] {
  const insertIndex = deque.length
  const steps: Step[] = []

  if (deque.length === 0) {
    steps.push({
      action: 'info',
      indices: [],
      description: 'Deque is empty. New value will become both Front and Rear.',
    })
  } else {
    steps.push({
      action: 'highlight',
      indices: uniqueIndices([0, deque.length - 1]),
      description: `Current Front is index 0 and Rear is index ${deque.length - 1}.`,
    })
  }

  steps.push({
    action: 'insert',
    indices: [insertIndex],
    description: `Insert ${formatValue(value)} at the Rear end (index ${insertIndex}).`,
  })

  steps.push({
    action: 'info',
    indices: uniqueIndices([0, insertIndex]),
    description: 'Rear insertion complete. Deque supports updates from both ends.',
  })

  return steps
}

export function dequeDeleteFrontSteps(deque: readonly QueueValue[]): Step[] {
  if (deque.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot delete front. Deque is empty.',
      },
    ]
  }

  return [
    {
      action: 'highlight',
      indices: [0],
      description: `Front points to ${formatValue(deque[0])} at index 0.`,
    },
    {
      action: 'delete',
      indices: [0],
      description: `Delete ${formatValue(deque[0])} from the Front end.`,
    },
    {
      action: 'info',
      indices: deque.length > 1 ? [0] : [],
      description:
        deque.length > 1
          ? 'Front shifts to the next element at index 0.'
          : 'Deque becomes empty after deleting from Front.',
    },
  ]
}

export function dequeDeleteRearSteps(deque: readonly QueueValue[]): Step[] {
  if (deque.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Cannot delete rear. Deque is empty.',
      },
    ]
  }

  const rearIndex = deque.length - 1
  const rearValue = deque[rearIndex]

  return [
    {
      action: 'highlight',
      indices: [rearIndex],
      description: `Rear points to ${formatValue(rearValue)} at index ${rearIndex}.`,
    },
    {
      action: 'delete',
      indices: [rearIndex],
      description: `Delete ${formatValue(rearValue)} from the Rear end.`,
    },
    {
      action: 'info',
      indices: deque.length > 1 ? [rearIndex - 1] : [],
      description:
        deque.length > 1
          ? `Rear moves to index ${rearIndex - 1}.`
          : 'Deque becomes empty after deleting from Rear.',
    },
  ]
}
