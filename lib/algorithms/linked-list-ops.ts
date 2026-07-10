import type { Step } from '@/lib/types'

export type PositionMode = 'head' | 'tail' | 'index'

export interface PositionInput {
  mode: PositionMode
  index?: number
}

function makeStep(
  action: Step['action'],
  indices: number[],
  description: string,
  pseudoCodeLine?: number
): Step {
  return { action, indices, description, pseudoCodeLine }
}

function info(description: string, pseudoCodeLine?: number): Step {
  return makeStep('info', [], description, pseudoCodeLine)
}

function clampIndex(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function toWholeNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.trunc(value)
}

export function resolveInsertIndex(length: number, position: PositionInput): number {
  const safeLength = Math.max(0, length)

  if (position.mode === 'head') {
    return 0
  }

  if (position.mode === 'tail') {
    return safeLength
  }

  const requestedIndex = toWholeNumber(position.index, safeLength)
  return clampIndex(requestedIndex, 0, safeLength)
}

export function resolveDeleteIndex(length: number, position: PositionInput): number | null {
  const safeLength = Math.max(0, length)

  if (safeLength === 0) {
    return null
  }

  if (position.mode === 'head') {
    return 0
  }

  if (position.mode === 'tail') {
    return safeLength - 1
  }

  const requestedIndex = toWholeNumber(position.index, safeLength - 1)
  return clampIndex(requestedIndex, 0, safeLength - 1)
}

export function insertAt(values: number[], value: number, index: number): number[] {
  const safeIndex = clampIndex(index, 0, values.length)
  return [...values.slice(0, safeIndex), value, ...values.slice(safeIndex)]
}

export function deleteAt(values: number[], index: number): number[] {
  if (index < 0 || index >= values.length) {
    return [...values]
  }

  return [...values.slice(0, index), ...values.slice(index + 1)]
}

export function singlyCreateSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [info('Initialized an empty singly linked list: head points to NULL.', 0)]
  }

  const steps: Step[] = []

  values.forEach((value, index) => {
    if (index === 0) {
      steps.push(makeStep('insert', [0], `Create head node with value ${value}.`, 1))
      return
    }

    steps.push(makeStep('highlight', [index - 1], `Current tail is node at index ${index - 1}.`, 2))
    steps.push(makeStep('insert', [index], `Create node ${value} and append it after the current tail.`, 3))
  })

  steps.push(info('Creation complete. Last node points to NULL.', 4))
  return steps
}

export function singlyInsertSteps(values: number[], value: number, position: PositionInput): Step[] {
  const targetIndex = resolveInsertIndex(values.length, position)
  const steps: Step[] = []

  if (values.length === 0) {
    steps.push(info('List is empty. The new node becomes the head.', 0))
    steps.push(makeStep('insert', [0], `Insert ${value} as the first node.`, 1))
    steps.push(info('Insertion complete. Node points to NULL.', 4))
    return steps
  }

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index], `Traverse node ${index} while searching insertion point.`, 2))
  }

  if (targetIndex === 0) {
    steps.push(makeStep('insert', [0], `Insert ${value} at the head.`, 3))
    steps.push(info('New head points to the previous head.', 4))
    return steps
  }

  if (targetIndex === values.length) {
    steps.push(makeStep('insert', [targetIndex], `Insert ${value} at the tail.`, 3))
    steps.push(info('Tail updated. New tail points to NULL.', 4))
    return steps
  }

  steps.push(makeStep('insert', [targetIndex], `Insert ${value} at index ${targetIndex}.`, 3))
  steps.push(info('Relinked predecessor and successor around the new node.', 4))
  return steps
}

export function singlyDeleteSteps(values: number[], position: PositionInput): Step[] {
  const targetIndex = resolveDeleteIndex(values.length, position)

  if (targetIndex === null) {
    return [info('Delete skipped: list is empty.', 0)]
  }

  const steps: Step[] = []

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index], `Traverse node ${index} to find the node before deletion target.`, 1))
  }

  const visualIndex = values.length === 1 ? -1 : targetIndex === 0 ? 0 : targetIndex - 1
  const deleteIndices = visualIndex >= 0 ? [visualIndex] : []

  steps.push(
    makeStep(
      'delete',
      deleteIndices,
      `Delete node at index ${targetIndex} with value ${values[targetIndex]}.`,
      2
    )
  )

  if (values.length === 1) {
    steps.push(info('List is now empty. Head points to NULL.', 4))
    return steps
  }

  if (targetIndex === 0) {
    steps.push(info('Head moved to the next node.', 3))
  } else {
    steps.push(info('Bypass deleted node by updating predecessor.next.', 3))
  }

  steps.push(info('Deletion complete. Tail still points to NULL.', 4))
  return steps
}

export function singlyTraverseSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [info('Traverse complete: list is empty.', 0)]
  }

  const steps: Step[] = []

  values.forEach((value, index) => {
    steps.push(makeStep('traverse', [index], `Visit node ${index} with value ${value}.`, 1))
  })

  steps.push(info('Traversal complete. Reached NULL after the tail.', 2))
  return steps
}

export function doublyInsertSteps(values: number[], value: number, position: PositionInput): Step[] {
  const targetIndex = resolveInsertIndex(values.length, position)
  const steps: Step[] = []

  if (values.length === 0) {
    steps.push(info('List is empty. New node becomes both head and tail.', 0))
    steps.push(makeStep('insert', [0], `Insert ${value} as the first node.`, 1))
    steps.push(info('Both prev and next pointers are NULL.', 4))
    return steps
  }

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index], `Traverse forward through node ${index}.`, 2))
  }

  steps.push(makeStep('insert', [targetIndex], `Insert ${value} at index ${targetIndex}.`, 3))

  if (targetIndex === 0) {
    steps.push(info('Update newHead.next and oldHead.prev.', 4))
  } else if (targetIndex === values.length) {
    steps.push(info('Update oldTail.next and newTail.prev.', 4))
  } else {
    steps.push(info('Reconnect predecessor and successor in both directions.', 4))
  }

  return steps
}

export function doublyDeleteSteps(values: number[], position: PositionInput): Step[] {
  const targetIndex = resolveDeleteIndex(values.length, position)

  if (targetIndex === null) {
    return [info('Delete skipped: list is empty.', 0)]
  }

  const steps: Step[] = []

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index], `Traverse forward to node ${index}.`, 1))
  }

  const visualIndex = values.length === 1 ? -1 : targetIndex === 0 ? 0 : targetIndex - 1
  const deleteIndices = visualIndex >= 0 ? [visualIndex] : []

  steps.push(
    makeStep(
      'delete',
      deleteIndices,
      `Delete node at index ${targetIndex} with value ${values[targetIndex]}.`,
      2
    )
  )

  if (values.length === 1) {
    steps.push(info('List is now empty. Head and tail are NULL.', 4))
    return steps
  }

  if (targetIndex === 0) {
    steps.push(info('Move head to next node and clear head.prev.', 3))
  } else if (targetIndex === values.length - 1) {
    steps.push(info('Move tail to previous node and clear tail.next.', 3))
  } else {
    steps.push(info('Connect predecessor and successor in both directions.', 3))
  }

  steps.push(info('Deletion complete.', 4))
  return steps
}

export function doublyForwardTraverseSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [info('Forward traversal complete: list is empty.', 0)]
  }

  const steps: Step[] = []

  values.forEach((value, index) => {
    steps.push(makeStep('traverse', [index], `Visit node ${index} (value ${value}) moving forward.`, 1))
  })

  steps.push(info('Reached NULL after tail in forward traversal.', 2))
  return steps
}

export function doublyBackwardTraverseSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [info('Backward traversal complete: list is empty.', 0)]
  }

  const steps: Step[] = []

  for (let index = values.length - 1; index >= 0; index -= 1) {
    steps.push(makeStep('traverse', [index], `Visit node ${index} (value ${values[index]}) moving backward.`, 1))
  }

  steps.push(info('Reached NULL before head in backward traversal.', 2))
  return steps
}

export function circularInsertSteps(values: number[], value: number, position: PositionInput): Step[] {
  const targetIndex = resolveInsertIndex(values.length, position)
  const steps: Step[] = []

  if (values.length === 0) {
    steps.push(makeStep('insert', [0], `Insert ${value} as the first node.`, 1))
    steps.push(info('Head points to itself to maintain the circle.', 4))
    return steps
  }

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index % values.length], `Traverse node ${index % values.length}.`, 2))
  }

  steps.push(makeStep('insert', [targetIndex], `Insert ${value} at circular index ${targetIndex}.`, 3))

  if (targetIndex === 0) {
    steps.push(info('New head inserted. Tail now links to the new head.', 4))
  } else if (targetIndex === values.length) {
    steps.push(info('New tail inserted. It links back to head.', 4))
  } else {
    steps.push(info('Insertion complete while preserving circular linkage.', 4))
  }

  return steps
}

export function circularDeleteSteps(values: number[], position: PositionInput): Step[] {
  const targetIndex = resolveDeleteIndex(values.length, position)

  if (targetIndex === null) {
    return [info('Delete skipped: list is empty.', 0)]
  }

  const steps: Step[] = []

  for (let index = 0; index < targetIndex; index += 1) {
    steps.push(makeStep('traverse', [index], `Traverse to node ${index} in the cycle.`, 1))
  }

  const visualIndex = values.length === 1 ? -1 : targetIndex === 0 ? 0 : targetIndex - 1
  const deleteIndices = visualIndex >= 0 ? [visualIndex] : []

  steps.push(
    makeStep(
      'delete',
      deleteIndices,
      `Delete circular node at index ${targetIndex} with value ${values[targetIndex]}.`,
      2
    )
  )

  if (values.length === 1) {
    steps.push(info('List is now empty after removing the only node.', 4))
    return steps
  }

  if (targetIndex === 0) {
    steps.push(info('Head moved forward. Tail updated to point to new head.', 3))
  } else {
    steps.push(info('Predecessor now points to successor to preserve the cycle.', 3))
  }

  steps.push(info('Deletion complete. Circular link remains intact.', 4))
  return steps
}

export function circularTraverseSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [info('Traversal complete: list is empty.', 0)]
  }

  const steps: Step[] = []

  values.forEach((value, index) => {
    steps.push(makeStep('traverse', [index], `Visit circular node ${index} with value ${value}.`, 1))
  })

  steps.push(makeStep('found', [0], 'Returned to head; stop traversal to avoid an infinite loop.', 2))
  return steps
}
