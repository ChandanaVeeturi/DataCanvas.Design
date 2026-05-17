import type { CellValue, Column, DataRow } from '@/lib/types'

export interface NumericSummary {
  kind: 'numeric'
  count: number
  missing: number
  unique: number
  sum: number
  mean: number
  median: number
  min: number
  max: number
  stdev: number
  variance: number
  q1: number
  q3: number
  iqr: number
  histogram: { range: [number, number]; count: number }[]
}

export interface CategoricalSummary {
  kind: 'categorical'
  count: number
  missing: number
  unique: number
  top: { value: string; count: number; pct: number }[]
}

export interface DateSummary {
  kind: 'date'
  count: number
  missing: number
  unique: number
  min: Date
  max: Date
  spanDays: number
}

export interface BooleanSummary {
  kind: 'boolean'
  count: number
  missing: number
  trueCount: number
  falseCount: number
}

export type ColumnSummary =
  | NumericSummary
  | CategoricalSummary
  | DateSummary
  | BooleanSummary

function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function toNumberSafe(v: CellValue): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'boolean') return v ? 1 : 0
  if (v instanceof Date) return v.getTime()
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function summarizeNumeric(values: number[], totalRows: number): NumericSummary {
  if (values.length === 0) {
    return {
      kind: 'numeric',
      count: 0,
      missing: totalRows,
      unique: 0,
      sum: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdev: 0,
      variance: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      histogram: [],
    }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = sum / sorted.length
  const variance = sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / sorted.length
  const stdev = Math.sqrt(variance)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const median = quantile(sorted, 0.5)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const unique = new Set(sorted).size

  // Mini histogram for visualization (12 bins).
  const binCount = Math.min(12, Math.max(4, Math.round(Math.sqrt(sorted.length))))
  const width = (max - min) / binCount || 1
  const histogram = Array.from({ length: binCount }, (_, i) => ({
    range: [min + i * width, min + (i + 1) * width] as [number, number],
    count: 0,
  }))
  for (const v of sorted) {
    const idx = Math.min(binCount - 1, Math.floor((v - min) / width))
    histogram[idx].count++
  }

  return {
    kind: 'numeric',
    count: sorted.length,
    missing: totalRows - sorted.length,
    unique,
    sum,
    mean,
    median,
    min,
    max,
    stdev,
    variance,
    q1,
    q3,
    iqr: q3 - q1,
    histogram,
  }
}

function summarizeCategorical(values: string[], totalRows: number): CategoricalSummary {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({ value, count, pct: count / values.length }))
  return {
    kind: 'categorical',
    count: values.length,
    missing: totalRows - values.length,
    unique: counts.size,
    top,
  }
}

function summarizeDate(values: Date[], totalRows: number): DateSummary {
  const ts = values.map((d) => d.getTime()).sort((a, b) => a - b)
  const min = new Date(ts[0])
  const max = new Date(ts[ts.length - 1])
  const spanDays = (max.getTime() - min.getTime()) / 86_400_000
  const unique = new Set(ts).size
  return {
    kind: 'date',
    count: values.length,
    missing: totalRows - values.length,
    unique,
    min,
    max,
    spanDays,
  }
}

function summarizeBoolean(values: boolean[], totalRows: number): BooleanSummary {
  const trueCount = values.filter((v) => v).length
  return {
    kind: 'boolean',
    count: values.length,
    missing: totalRows - values.length,
    trueCount,
    falseCount: values.length - trueCount,
  }
}

export function summarizeColumn(rows: DataRow[], column: Column): ColumnSummary {
  if (column.type === 'number') {
    const values: number[] = []
    for (const r of rows) {
      const n = toNumberSafe(r[column.id])
      if (n !== null) values.push(n)
    }
    return summarizeNumeric(values, rows.length)
  }
  if (column.type === 'date') {
    const values: Date[] = []
    for (const r of rows) {
      const v = r[column.id]
      if (v instanceof Date) values.push(v)
      else if (typeof v === 'string' && v) {
        const t = Date.parse(v)
        if (Number.isFinite(t)) values.push(new Date(t))
      }
    }
    return summarizeDate(values, rows.length)
  }
  if (column.type === 'boolean') {
    const values: boolean[] = []
    for (const r of rows) {
      const v = r[column.id]
      if (typeof v === 'boolean') values.push(v)
    }
    return summarizeBoolean(values, rows.length)
  }
  // string / categorical
  const values: string[] = []
  for (const r of rows) {
    const v = r[column.id]
    if (v === null || v === undefined || v === '') continue
    values.push(v instanceof Date ? v.toISOString() : String(v))
  }
  return summarizeCategorical(values, rows.length)
}
