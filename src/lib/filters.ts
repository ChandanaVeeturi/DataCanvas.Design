import type { DashboardFilter, Dataset } from '@/lib/types'

export function applyFilters(dataset: Dataset, filters: DashboardFilter[]): Dataset {
  if (filters.length === 0) return dataset
  const active = filters.filter((f) => f.values.length > 0)
  if (active.length === 0) return dataset
  const rows = dataset.rows.filter((row) =>
    active.every((f) => {
      const v = row[f.columnId]
      if (v === null || v === undefined) return false
      const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v)
      return f.values.includes(s)
    }),
  )
  return { ...dataset, rows, rowCount: rows.length }
}

export function toggleFilterValue(
  filters: DashboardFilter[],
  columnId: string,
  value: string,
): DashboardFilter[] {
  const existing = filters.find((f) => f.columnId === columnId)
  if (!existing) return [...filters, { columnId, values: [value] }]
  const present = existing.values.includes(value)
  const nextValues = present
    ? existing.values.filter((v) => v !== value)
    : [...existing.values, value]
  if (nextValues.length === 0) {
    return filters.filter((f) => f.columnId !== columnId)
  }
  return filters.map((f) => (f.columnId === columnId ? { ...f, values: nextValues } : f))
}

export function clearFilter(filters: DashboardFilter[], columnId: string): DashboardFilter[] {
  return filters.filter((f) => f.columnId !== columnId)
}
