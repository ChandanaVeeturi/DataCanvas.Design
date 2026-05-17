import type { CellValue, Column, ColumnType, DataRow, Dataset } from '@/lib/types'

export type GroupAggregator = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median'

export interface GroupValueSpec {
  columnId: string
  aggregator: GroupAggregator
}

function toNumber(v: CellValue): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'boolean') return v ? 1 : 0
  if (v instanceof Date) return v.getTime()
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function aggregate(values: number[], agg: GroupAggregator): number {
  if (values.length === 0) return 0
  switch (agg) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'count':
      return values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    case 'median': {
      const s = [...values].sort((a, b) => a - b)
      const mid = Math.floor(s.length / 2)
      return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid]
    }
  }
}

export interface GroupByResult {
  columns: Column[]
  rows: DataRow[]
}

export function groupBy(
  source: Dataset,
  groupColumnIds: string[],
  values: GroupValueSpec[],
): GroupByResult {
  // Special case: with no group columns we collapse to a single summary row.
  type Bucket = { keyValues: CellValue[]; rows: DataRow[] }
  const buckets = new Map<string, Bucket>()

  for (const row of source.rows) {
    const keyValues = groupColumnIds.map((id) => row[id] ?? null)
    const key = keyValues
      .map((v) => (v instanceof Date ? v.toISOString() : v === null ? '\0null' : String(v)))
      .join('')
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { keyValues, rows: [] }
      buckets.set(key, bucket)
    }
    bucket.rows.push(row)
  }

  const groupCols: Column[] = groupColumnIds.map((id) => {
    const c = source.columns.find((c) => c.id === id)!
    return { id: c.id, name: c.name, type: c.type }
  })

  const valueCols: Column[] = values.map((v) => {
    const c = source.columns.find((c) => c.id === v.columnId)!
    const newId = `${v.aggregator}_${c.id}`
    const newName = `${v.aggregator}(${c.name})`
    const type: ColumnType = 'number'
    return { id: newId, name: newName, type }
  })

  const countCol: Column[] =
    values.length === 0 ? [{ id: 'row_count', name: 'row_count', type: 'number' }] : []

  const rows: DataRow[] = []
  for (const bucket of buckets.values()) {
    const row: DataRow = {}
    groupColumnIds.forEach((id, i) => {
      row[id] = bucket.keyValues[i]
    })
    if (values.length === 0) {
      row.row_count = bucket.rows.length
    } else {
      for (let i = 0; i < values.length; i++) {
        const spec = values[i]
        const newCol = valueCols[i]
        const nums = bucket.rows
          .map((r) => toNumber(r[spec.columnId]))
          .filter((n): n is number => n !== null)
        if (spec.aggregator === 'count') {
          row[newCol.id] = bucket.rows.filter((r) => {
            const v = r[spec.columnId]
            return v !== null && v !== undefined && v !== ''
          }).length
        } else {
          row[newCol.id] = aggregate(nums, spec.aggregator)
        }
      }
    }
    rows.push(row)
  }

  // Sort by the first group column ascending for predictability.
  if (groupColumnIds.length > 0) {
    const firstId = groupColumnIds[0]
    rows.sort((a, b) => {
      const av = a[firstId]
      const bv = b[firstId]
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (typeof av === 'number' && typeof bv === 'number') return av - bv
      if (av instanceof Date && bv instanceof Date) return av.getTime() - bv.getTime()
      return String(av).localeCompare(String(bv))
    })
  }

  return { columns: [...groupCols, ...valueCols, ...countCol], rows }
}

export function buildGroupedDataset(
  source: Dataset,
  groupColumnIds: string[],
  values: GroupValueSpec[],
  name: string,
): Dataset {
  const { columns, rows } = groupBy(source, groupColumnIds, values)
  return {
    id: crypto.randomUUID(),
    name,
    sourceFile: `${source.sourceFile} (grouped)`,
    createdAt: Date.now(),
    rowCount: rows.length,
    columns,
    rows,
  }
}
