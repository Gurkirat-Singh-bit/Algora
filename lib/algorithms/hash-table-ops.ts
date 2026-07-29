import type { Step } from '@/lib/types'

export type HashTableMode = 'insert' | 'search' | 'delete'
export type HashTableSnapshot = number[][]

export interface HashTableRun {
  steps: Step[]
  snapshots: HashTableSnapshot[]
  nextTable: HashTableSnapshot
  bucket: number
}

export const hashTablePseudoCode: Record<HashTableMode, string[]> = {
  insert: [
    'bucket = modulo(key, capacity)',
    'for each value in buckets[bucket]:',
    '  if value == key: return already present',
    'append key to buckets[bucket]',
  ],
  search: [
    'bucket = modulo(key, capacity)',
    'for each value in buckets[bucket]:',
    '  if value == key: return found',
    'return not found',
  ],
  delete: [
    'bucket = modulo(key, capacity)',
    'for each value in buckets[bucket]:',
    '  if value == key: remove value',
    'return not found',
  ],
}

function cloneTable(table: HashTableSnapshot): HashTableSnapshot {
  return table.map(bucket => [...bucket])
}

export function hashIndex(value: number, capacity: number): number {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new Error('Hash table capacity must be a positive integer.')
  }
  return ((value % capacity) + capacity) % capacity
}

export function createHashTable(
  values: readonly number[] = [],
  capacity = 7
): HashTableSnapshot {
  const table = Array.from({ length: capacity }, () => [] as number[])
  for (const value of values) {
    if (!Number.isInteger(value)) continue
    const bucket = hashIndex(value, capacity)
    if (!table[bucket].includes(value)) table[bucket].push(value)
  }
  return table
}

function createRun(
  source: HashTableSnapshot,
  value: number,
  mode: HashTableMode
): HashTableRun {
  if (!Number.isInteger(value)) throw new Error('Hash table keys must be integers.')
  if (source.length === 0) throw new Error('Hash table must contain at least one bucket.')

  const table = cloneTable(source)
  const bucket = hashIndex(value, table.length)
  const steps: Step[] = []
  const snapshots: HashTableSnapshot[] = []
  const push = (step: Step): void => {
    steps.push(step)
    snapshots.push(cloneTable(table))
  }

  push({
    action: 'highlight',
    indices: [bucket],
    description: `Hash ${value} to bucket ${bucket} using modulo ${table.length}.`,
    pseudoCodeLine: 0,
  })

  const chain = table[bucket]
  const existingIndex = chain.indexOf(value)
  for (let index = 0; index < chain.length; index += 1) {
    push({
      action: 'compare',
      indices: [bucket, index],
      description: `Compare key ${value} with chain value ${chain[index]}.`,
      pseudoCodeLine: 1,
    })
    if (chain[index] === value) break
  }

  if (mode === 'insert') {
    if (existingIndex >= 0) {
      push({
        action: 'info',
        indices: [bucket, existingIndex],
        description: `Key ${value} already exists in bucket ${bucket}.`,
        pseudoCodeLine: 2,
      })
    } else {
      chain.push(value)
      push({
        action: 'insert',
        indices: [bucket, chain.length - 1],
        description: `Append ${value} to the chain at bucket ${bucket}.`,
        pseudoCodeLine: 3,
      })
    }
  } else if (mode === 'search') {
    push(existingIndex >= 0
      ? {
          action: 'found',
          indices: [bucket, existingIndex],
          description: `Found key ${value} in bucket ${bucket}.`,
          pseudoCodeLine: 2,
        }
      : {
          action: 'info',
          indices: [bucket],
          description: `Key ${value} is not in bucket ${bucket}.`,
          pseudoCodeLine: 3,
        })
  } else if (existingIndex >= 0) {
    push({
      action: 'delete',
      indices: [bucket, existingIndex],
      description: `Remove key ${value} from bucket ${bucket}.`,
      pseudoCodeLine: 2,
    })
    chain.splice(existingIndex, 1)
    push({
      action: 'info',
      indices: [bucket],
      description: `Deletion complete. Bucket ${bucket} now has ${chain.length} key(s).`,
      pseudoCodeLine: 2,
    })
  } else {
    push({
      action: 'info',
      indices: [bucket],
      description: `Key ${value} is not present, so nothing is deleted.`,
      pseudoCodeLine: 3,
    })
  }

  return { steps, snapshots, nextTable: table, bucket }
}

export function runHashTableOperation(
  table: HashTableSnapshot,
  value: number,
  mode: HashTableMode
): HashTableRun {
  return createRun(table, value, mode)
}
