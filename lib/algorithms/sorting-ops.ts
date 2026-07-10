import type { ComplexityInfo, Step } from '@/lib/types'

export type SortingMethod = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'

export interface SortingRun {
  steps: Step[]
  snapshots: number[][]
  pseudoCode: string[]
  complexity: ComplexityInfo[]
  title: string
  description: string
}

interface SortingMethodMeta {
  title: string
  description: string
  pseudoCode: string[]
  complexity: ComplexityInfo[]
}

const methodMeta: Record<SortingMethod, SortingMethodMeta> = {
  bubble: {
    title: 'Bubble Sort',
    description: 'Repeatedly swap adjacent out-of-order values until the largest bubble to the end.',
    pseudoCode: [
      'for i = 0 to n-1:',
      '  swapped = false',
      '  for j = 0 to n-i-2:',
      '    if arr[j] > arr[j+1]: swap(arr[j], arr[j+1])',
      '  if not swapped: break',
    ],
    complexity: [
      { operation: 'Bubble Sort', time: 'O(n^2)', space: 'O(1)', best: 'O(n)', worst: 'O(n^2)' },
    ],
  },
  selection: {
    title: 'Selection Sort',
    description: 'Select the minimum from the unsorted suffix and place it at the current index.',
    pseudoCode: [
      'for i = 0 to n-1:',
      '  minIndex = i',
      '  for j = i+1 to n-1:',
      '    if arr[j] < arr[minIndex]: minIndex = j',
      '  swap(arr[i], arr[minIndex])',
    ],
    complexity: [
      { operation: 'Selection Sort', time: 'O(n^2)', space: 'O(1)' },
    ],
  },
  insertion: {
    title: 'Insertion Sort',
    description: 'Grow a sorted prefix by inserting each value into its correct position.',
    pseudoCode: [
      'for i = 1 to n-1:',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j+1] = arr[j]; j--',
      '  arr[j+1] = key',
    ],
    complexity: [
      { operation: 'Insertion Sort', time: 'O(n^2)', space: 'O(1)', best: 'O(n)', worst: 'O(n^2)' },
    ],
  },
  merge: {
    title: 'Merge Sort',
    description: 'Split recursively and merge sorted halves back together.',
    pseudoCode: [
      'mergeSort(l, r):',
      '  if l >= r: return',
      '  mid = floor((l + r) / 2)',
      '  mergeSort(l, mid); mergeSort(mid+1, r)',
      '  merge two sorted halves',
    ],
    complexity: [
      { operation: 'Merge Sort', time: 'O(n log n)', space: 'O(n)' },
    ],
  },
  quick: {
    title: 'Quick Sort',
    description: 'Partition around a pivot and recursively sort both partitions.',
    pseudoCode: [
      'quickSort(l, r):',
      '  if l >= r: return',
      '  pivot = arr[r], i = l',
      '  for j = l to r-1: if arr[j] <= pivot swap(arr[i], arr[j]), i++',
      '  swap(arr[i], arr[r])',
      '  quickSort(l, i-1); quickSort(i+1, r)',
    ],
    complexity: [
      { operation: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', worst: 'O(n^2)' },
    ],
  },
}

function clone(values: number[]): number[] {
  return [...values]
}

function runBubbleSort(input: number[]): Pick<SortingRun, 'steps' | 'snapshots'> {
  const arr = clone(input)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(arr)]

  for (let i = 0; i < arr.length; i += 1) {
    let swapped = false
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      steps.push({
        action: 'compare',
        indices: [j, j + 1],
        description: `Compare ${arr[j]} and ${arr[j + 1]}.`,
        pseudoCodeLine: 2,
      })

      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        steps.push({
          action: 'swap',
          indices: [j, j + 1],
          description: `Swap indices ${j} and ${j + 1}.`,
          pseudoCodeLine: 3,
        })
        snapshots.push(clone(arr))
      }
    }

    if (!swapped) {
      steps.push({
        action: 'info',
        indices: [],
        description: 'No swaps in this pass, array is sorted.',
        pseudoCodeLine: 4,
      })
      break
    }
  }

  steps.push({
    action: 'found',
    indices: arr.map((_, index) => index),
    description: 'Sorting complete.',
  })
  snapshots.push(clone(arr))

  return { steps, snapshots }
}

function runSelectionSort(input: number[]): Pick<SortingRun, 'steps' | 'snapshots'> {
  const arr = clone(input)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(arr)]

  for (let i = 0; i < arr.length; i += 1) {
    let minIndex = i
    steps.push({
      action: 'highlight',
      indices: [i],
      description: `Start pass at index ${i}.`,
      pseudoCodeLine: 0,
    })

    for (let j = i + 1; j < arr.length; j += 1) {
      steps.push({
        action: 'compare',
        indices: [minIndex, j],
        description: `Compare current min ${arr[minIndex]} with ${arr[j]}.`,
        pseudoCodeLine: 2,
      })
      if (arr[j] < arr[minIndex]) {
        minIndex = j
        steps.push({
          action: 'highlight',
          indices: [minIndex],
          description: `New minimum found at index ${minIndex}.`,
          pseudoCodeLine: 3,
        })
      }
    }

    if (minIndex !== i) {
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
      steps.push({
        action: 'swap',
        indices: [i, minIndex],
        description: `Place minimum at index ${i}.`,
        pseudoCodeLine: 4,
      })
      snapshots.push(clone(arr))
    }
  }

  steps.push({ action: 'found', indices: arr.map((_, i) => i), description: 'Sorting complete.' })
  snapshots.push(clone(arr))
  return { steps, snapshots }
}

function runInsertionSort(input: number[]): Pick<SortingRun, 'steps' | 'snapshots'> {
  const arr = clone(input)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(arr)]

  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i]
    let j = i - 1

    steps.push({
      action: 'highlight',
      indices: [i],
      description: `Insert value ${key} into sorted prefix.`,
      pseudoCodeLine: 1,
    })

    while (j >= 0 && arr[j] > key) {
      steps.push({
        action: 'compare',
        indices: [j, j + 1],
        description: `Shift ${arr[j]} right to make room for ${key}.`,
        pseudoCodeLine: 3,
      })
      arr[j + 1] = arr[j]
      j -= 1
      snapshots.push(clone(arr))
    }

    arr[j + 1] = key
    steps.push({
      action: 'insert',
      indices: [j + 1],
      description: `Place ${key} at index ${j + 1}.`,
      pseudoCodeLine: 5,
    })
    snapshots.push(clone(arr))
  }

  steps.push({ action: 'found', indices: arr.map((_, i) => i), description: 'Sorting complete.' })
  snapshots.push(clone(arr))
  return { steps, snapshots }
}

function runMergeSort(input: number[]): Pick<SortingRun, 'steps' | 'snapshots'> {
  const arr = clone(input)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(arr)]

  const merge = (left: number, mid: number, right: number): void => {
    const leftPart = arr.slice(left, mid + 1)
    const rightPart = arr.slice(mid + 1, right + 1)

    let i = 0
    let j = 0
    let k = left

    while (i < leftPart.length && j < rightPart.length) {
      steps.push({
        action: 'compare',
        indices: [left + i, mid + 1 + j],
        description: `Compare ${leftPart[i]} and ${rightPart[j]} while merging.`,
        pseudoCodeLine: 4,
      })

      if (leftPart[i] <= rightPart[j]) {
        arr[k] = leftPart[i]
        i += 1
      } else {
        arr[k] = rightPart[j]
        j += 1
      }

      steps.push({
        action: 'insert',
        indices: [k],
        description: `Write ${arr[k]} at index ${k}.`,
        pseudoCodeLine: 4,
      })
      snapshots.push(clone(arr))
      k += 1
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i]
      steps.push({ action: 'insert', indices: [k], description: `Copy remaining ${arr[k]}.`, pseudoCodeLine: 4 })
      snapshots.push(clone(arr))
      i += 1
      k += 1
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j]
      steps.push({ action: 'insert', indices: [k], description: `Copy remaining ${arr[k]}.`, pseudoCodeLine: 4 })
      snapshots.push(clone(arr))
      j += 1
      k += 1
    }
  }

  const mergeSort = (left: number, right: number): void => {
    if (left >= right) {
      return
    }
    const mid = Math.floor((left + right) / 2)
    steps.push({
      action: 'highlight',
      indices: [left, mid, right],
      description: `Split range ${left}-${right} at ${mid}.`,
      pseudoCodeLine: 2,
    })
    mergeSort(left, mid)
    mergeSort(mid + 1, right)
    merge(left, mid, right)
  }

  mergeSort(0, arr.length - 1)
  steps.push({ action: 'found', indices: arr.map((_, i) => i), description: 'Sorting complete.' })
  snapshots.push(clone(arr))
  return { steps, snapshots }
}

function runQuickSort(input: number[]): Pick<SortingRun, 'steps' | 'snapshots'> {
  const arr = clone(input)
  const steps: Step[] = []
  const snapshots: number[][] = [clone(arr)]

  const partition = (left: number, right: number): number => {
    const pivot = arr[right]
    let i = left

    steps.push({
      action: 'highlight',
      indices: [right],
      description: `Use ${pivot} as pivot.`,
      pseudoCodeLine: 2,
    })

    for (let j = left; j < right; j += 1) {
      steps.push({
        action: 'compare',
        indices: [j, right],
        description: `Compare ${arr[j]} with pivot ${pivot}.`,
        pseudoCodeLine: 3,
      })

      if (arr[j] <= pivot) {
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            action: 'swap',
            indices: [i, j],
            description: `Move ${arr[i]} into left partition.`,
            pseudoCodeLine: 3,
          })
          snapshots.push(clone(arr))
        }
        i += 1
      }
    }

    ;[arr[i], arr[right]] = [arr[right], arr[i]]
    steps.push({
      action: 'swap',
      indices: [i, right],
      description: `Place pivot at index ${i}.`,
      pseudoCodeLine: 4,
    })
    snapshots.push(clone(arr))
    return i
  }

  const quickSort = (left: number, right: number): void => {
    if (left >= right) {
      return
    }

    const pivotIndex = partition(left, right)
    quickSort(left, pivotIndex - 1)
    quickSort(pivotIndex + 1, right)
  }

  quickSort(0, arr.length - 1)
  steps.push({ action: 'found', indices: arr.map((_, i) => i), description: 'Sorting complete.' })
  snapshots.push(clone(arr))
  return { steps, snapshots }
}

export function runSortingOperation(method: SortingMethod, input: number[]): SortingRun {
  const values = clone(input)
  const meta = methodMeta[method]

  if (values.length <= 1) {
    return {
      title: meta.title,
      description: meta.description,
      complexity: meta.complexity,
      pseudoCode: meta.pseudoCode,
      steps: [
        {
          action: 'info',
          indices: values.length === 1 ? [0] : [],
          description: 'Array is already sorted.',
        },
      ],
      snapshots: [clone(values)],
    }
  }

  const run =
    method === 'bubble'
      ? runBubbleSort(values)
      : method === 'selection'
        ? runSelectionSort(values)
        : method === 'insertion'
          ? runInsertionSort(values)
          : method === 'merge'
            ? runMergeSort(values)
            : runQuickSort(values)

  return {
    title: meta.title,
    description: meta.description,
    complexity: meta.complexity,
    pseudoCode: meta.pseudoCode,
    steps: run.steps,
    snapshots: run.snapshots,
  }
}
