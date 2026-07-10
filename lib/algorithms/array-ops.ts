import type { Step } from '@/lib/types'

export const insertPseudoCode = [
  'if index < 0 or index > array.length: return error',
  'for i = array.length - 1 down to index:',
  '  array[i + 1] = array[i]',
  'array[index] = value',
  'return array',
]

export const deletePseudoCode = [
  'if index < 0 or index >= array.length: return error',
  'target = array[index]',
  'for i = index to array.length - 2:',
  '  array[i] = array[i + 1]',
  'remove last element',
  'return array',
]

export const traversePseudoCode = [
  'for i = 0 to array.length - 1:',
  '  visit array[i]',
  'end',
]

export const linearSearchPseudoCode = [
  'for i = 0 to array.length - 1:',
  '  if array[i] == target: return i',
  'return -1',
]

export const binarySearchPseudoCode = [
  'low = 0, high = array.length - 1',
  'while low <= high:',
  '  mid = floor((low + high) / 2)',
  '  if array[mid] == target: return mid',
  '  if array[mid] < target: low = mid + 1',
  '  else: high = mid - 1',
  'return -1',
]

function formatArray(values: number[]): string {
  return `[${values.join(', ')}]`
}

export function insertStep(array: number[], index: number, value: number): Step[] {
  const steps: Step[] = [
    {
      action: 'info',
      indices: [],
      description: `Validate insertion index ${index} for array length ${array.length}.`,
      pseudoCodeLine: 0,
    },
  ]

  if (index < 0 || index > array.length) {
    steps.push({
      action: 'info',
      indices: [],
      description: `Index ${index} is out of bounds. Valid range is 0 to ${array.length}.`,
      pseudoCodeLine: 0,
    })
    return steps
  }

  for (let i = array.length - 1; i >= index; i -= 1) {
    steps.push({
      action: 'compare',
      indices: [i, i + 1],
      description: `Shift value ${array[i]} from index ${i} to index ${i + 1}.`,
      pseudoCodeLine: 2,
    })
  }

  const result = [...array]
  result.splice(index, 0, value)

  steps.push({
    action: 'insert',
    indices: [index],
    description: `Insert value ${value} at index ${index}.`,
    pseudoCodeLine: 3,
  })

  steps.push({
    action: 'info',
    indices: [],
    description: `Insertion complete. Result: ${formatArray(result)}.`,
    pseudoCodeLine: 4,
  })

  return steps
}

export function deleteStep(array: number[], index: number): Step[] {
  const steps: Step[] = [
    {
      action: 'info',
      indices: [],
      description: `Validate deletion index ${index} for array length ${array.length}.`,
      pseudoCodeLine: 0,
    },
  ]

  if (index < 0 || index >= array.length) {
    steps.push({
      action: 'info',
      indices: [],
      description: `Index ${index} is out of bounds. Valid range is 0 to ${Math.max(array.length - 1, 0)}.`,
      pseudoCodeLine: 0,
    })
    return steps
  }

  const deletedValue = array[index]
  steps.push({
    action: 'delete',
    indices: [index],
    description: `Delete value ${deletedValue} at index ${index}.`,
    pseudoCodeLine: 1,
  })

  for (let i = index; i < array.length - 1; i += 1) {
    steps.push({
      action: 'compare',
      indices: [i, i + 1],
      description: `Shift value ${array[i + 1]} from index ${i + 1} to index ${i}.`,
      pseudoCodeLine: 3,
    })
  }

  const result = [...array]
  result.splice(index, 1)

  steps.push({
    action: 'highlight',
    indices: [Math.max(result.length, 0)],
    description: 'Remove trailing duplicate slot after shifting.',
    pseudoCodeLine: 4,
  })

  steps.push({
    action: 'info',
    indices: [],
    description: `Deletion complete. Result: ${formatArray(result)}.`,
    pseudoCodeLine: 5,
  })

  return steps
}

export function traverseSteps(array: number[]): Step[] {
  if (array.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: 'Array is empty. Nothing to traverse.',
        pseudoCodeLine: 2,
      },
    ]
  }

  const steps: Step[] = []
  for (let i = 0; i < array.length; i += 1) {
    steps.push({
      action: 'traverse',
      indices: [i],
      description: `Visit index ${i}; value is ${array[i]}.`,
      pseudoCodeLine: 1,
    })
  }

  steps.push({
    action: 'info',
    indices: [],
    description: `Traversal complete for ${array.length} element(s).`,
    pseudoCodeLine: 2,
  })

  return steps
}

export function linearSearchSteps(array: number[], target: number): Step[] {
  if (array.length === 0) {
    return [
      {
        action: 'info',
        indices: [],
        description: `Array is empty. Target ${target} cannot be found.`,
        pseudoCodeLine: 2,
      },
    ]
  }

  const steps: Step[] = []
  for (let i = 0; i < array.length; i += 1) {
    steps.push({
      action: 'compare',
      indices: [i],
      description: `Compare target ${target} with array[${i}] = ${array[i]}.`,
      pseudoCodeLine: 0,
    })

    if (array[i] === target) {
      steps.push({
        action: 'found',
        indices: [i],
        description: `Target ${target} found at index ${i}.`,
        pseudoCodeLine: 1,
      })
      return steps
    }
  }

  steps.push({
    action: 'info',
    indices: [],
    description: `Target ${target} was not found in ${formatArray(array)}.`,
    pseudoCodeLine: 2,
  })

  return steps
}

export function binarySearchSteps(array: number[], target: number): Step[] {
  const steps: Step[] = [
    {
      action: 'info',
      indices: [],
      description: `Initialize pointers: low = 0, high = ${array.length - 1}.`,
      pseudoCodeLine: 0,
    },
  ]

  let low = 0
  let high = array.length - 1

  while (low <= high) {
    steps.push({
      action: 'highlight',
      indices: [low, high],
      description: `Current search range is index ${low} to ${high}.`,
      pseudoCodeLine: 1,
    })

    const mid = Math.floor((low + high) / 2)

    steps.push({
      action: 'compare',
      indices: [low, mid, high],
      description: `low=${low}, mid=${mid}, high=${high}. Compare target ${target} with value ${array[mid]}.`,
      pseudoCodeLine: 2,
    })

    if (array[mid] === target) {
      steps.push({
        action: 'found',
        indices: [mid],
        description: `Target ${target} found at index ${mid}.`,
        pseudoCodeLine: 3,
      })
      return steps
    }

    if (array[mid] < target) {
      steps.push({
        action: 'info',
        indices: [mid],
        description: `${array[mid]} is less than ${target}. Move low to ${mid + 1}.`,
        pseudoCodeLine: 4,
      })
      low = mid + 1
    } else {
      steps.push({
        action: 'info',
        indices: [mid],
        description: `${array[mid]} is greater than ${target}. Move high to ${mid - 1}.`,
        pseudoCodeLine: 5,
      })
      high = mid - 1
    }
  }

  steps.push({
    action: 'info',
    indices: [],
    description: `Target ${target} was not found in ${formatArray(array)}.`,
    pseudoCodeLine: 6,
  })

  return steps
}