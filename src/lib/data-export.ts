import type { CellValue, Column, Dataset } from './types'

function formatCell(v: CellValue): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'number') return String(v)
  return String(v)
}

function escapeCsv(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCsv(dataset: Dataset, delimiter = ','): string {
  const visible = dataset.columns.filter((c) => !c.hidden)
  const header = visible.map((c) => escapeCsv(c.name, delimiter)).join(delimiter)
  const lines = dataset.rows.map((row) =>
    visible.map((c) => escapeCsv(formatCell(row[c.id] ?? null), delimiter)).join(delimiter),
  )
  return `${header}\n${lines.join('\n')}\n`
}

export function toJson(dataset: Dataset): string {
  const visible = dataset.columns.filter((c) => !c.hidden)
  const out = dataset.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    for (const c of visible) {
      const v = row[c.id]
      obj[c.name] = v instanceof Date ? v.toISOString() : v
    }
    return obj
  })
  return JSON.stringify(out, null, 2)
}

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'dataset'
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke after a tick so Safari can complete the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(dataset: Dataset, filename = `${safeFilename(dataset.name)}.csv`) {
  triggerDownload(new Blob([toCsv(dataset, ',')], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function downloadTsv(dataset: Dataset, filename = `${safeFilename(dataset.name)}.tsv`) {
  triggerDownload(new Blob([toCsv(dataset, '\t')], { type: 'text/tab-separated-values;charset=utf-8;' }), filename)
}

export function downloadJson(dataset: Dataset, filename = `${safeFilename(dataset.name)}.json`) {
  triggerDownload(new Blob([toJson(dataset)], { type: 'application/json;charset=utf-8;' }), filename)
}

/** Dynamically imported so xlsx stays out of the main bundle. */
export async function downloadXlsx(dataset: Dataset, filename = `${safeFilename(dataset.name)}.xlsx`) {
  const XLSX = await import('xlsx')
  const visible = dataset.columns.filter((c: Column) => !c.hidden)
  const aoa: unknown[][] = [visible.map((c) => c.name)]
  for (const row of dataset.rows) {
    aoa.push(
      visible.map((c) => {
        const v = row[c.id]
        if (v === null || v === undefined) return ''
        if (v instanceof Date) return v
        return v
      }),
    )
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, dataset.name.slice(0, 31) || 'Sheet1')
  XLSX.writeFile(wb, filename)
}
