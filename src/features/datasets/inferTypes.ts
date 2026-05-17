import type { CellValue, Column, ColumnType, DataRow } from '@/lib/types'

const NUMERIC_RE = /^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i
const BOOL_TRUE = new Set(['true', 'yes', 'y', 't', '1'])
const BOOL_FALSE = new Set(['false', 'no', 'n', 'f', '0'])

const SAMPLE_SIZE = 200

function isProbablyDate(s: string): boolean {
  if (s.length < 6 || s.length > 35) return false
  // ISO-ish or common date formats
  if (!/[-/]/.test(s) && !/\d{4}/.test(s)) return false
  const t = Date.parse(s)
  return Number.isFinite(t)
}

function detectColumnType(samples: CellValue[]): ColumnType {
  const non = samples.filter((v) => v !== null && v !== undefined && v !== '')
  if (non.length === 0) return 'string'

  let numericHits = 0
  let dateHits = 0
  let boolHits = 0
  const distinct = new Set<string>()

  for (const v of non) {
    if (typeof v === 'number') {
      numericHits++
      continue
    }
    if (typeof v === 'boolean') {
      boolHits++
      continue
    }
    if (v instanceof Date) {
      dateHits++
      continue
    }
    const s = String(v).trim()
    distinct.add(s)
    if (NUMERIC_RE.test(s)) numericHits++
    else if (BOOL_TRUE.has(s.toLowerCase()) || BOOL_FALSE.has(s.toLowerCase())) boolHits++
    else if (isProbablyDate(s)) dateHits++
  }

  const total = non.length
  const score = (n: number) => n / total

  if (score(boolHits) >= 0.9 && distinct.size <= 2) return 'boolean'
  if (score(numericHits) >= 0.9) return 'number'
  if (score(dateHits) >= 0.85) return 'date'
  // Low-cardinality string -> categorical
  if (distinct.size > 0 && distinct.size / total <= 0.2 && distinct.size <= 50) {
    return 'categorical'
  }
  return 'string'
}

export function coerceValue(raw: CellValue, type: ColumnType): CellValue {
  if (raw === null || raw === undefined || raw === '') return null
  switch (type) {
    case 'number': {
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
      if (typeof raw === 'boolean') return raw ? 1 : 0
      if (raw instanceof Date) return raw.getTime()
      const s = String(raw).trim().replace(/,/g, '')
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }
    case 'boolean': {
      if (typeof raw === 'boolean') return raw
      if (typeof raw === 'number') return raw !== 0
      const s = String(raw).trim().toLowerCase()
      if (BOOL_TRUE.has(s)) return true
      if (BOOL_FALSE.has(s)) return false
      return null
    }
    case 'date': {
      if (raw instanceof Date) return Number.isFinite(raw.getTime()) ? raw : null
      if (typeof raw === 'number') {
        // Heuristic: small numbers are likely Excel serial dates; large numbers are JS timestamps.
        if (raw > 1_000_000_000_000) return new Date(raw)
        if (raw > 25_000 && raw < 60_000) {
          // Excel serial date -> JS Date (Excel epoch 1899-12-30)
          return new Date((raw - 25569) * 86_400_000)
        }
        return new Date(raw)
      }
      const t = Date.parse(String(raw))
      return Number.isFinite(t) ? new Date(t) : null
    }
    case 'categorical':
    case 'string':
      if (raw instanceof Date) return raw.toISOString()
      return String(raw)
    default:
      return raw
  }
}

export interface InferenceResult {
  columns: Column[]
  rows: DataRow[]
}

export function inferTypesAndCoerce(
  columnIds: string[],
  rawRows: DataRow[],
): InferenceResult {
  const sample = rawRows.slice(0, SAMPLE_SIZE)
  const columns: Column[] = columnIds.map((id) => {
    const samples = sample.map((r) => r[id])
    const type = detectColumnType(samples)
    return { id, name: id, type }
  })

  const rows: DataRow[] = rawRows.map((row) => {
    const out: DataRow = {}
    for (const col of columns) {
      out[col.id] = coerceValue(row[col.id] ?? null, col.type)
    }
    return out
  })

  return { columns, rows }
}

export function recoerceColumn(rows: DataRow[], columnId: string, type: ColumnType): DataRow[] {
  return rows.map((r) => ({ ...r, [columnId]: coerceValue(r[columnId] ?? null, type) }))
}
