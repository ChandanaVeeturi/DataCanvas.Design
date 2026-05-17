import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { Aggregator, Column, Dataset, KpiTileSpec } from '@/lib/types'
import { TileShell } from './TileShell'
import { Popover, MenuItem, MenuLabel } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface KpiTileRendererProps {
  tile: KpiTileSpec
  dataset: Dataset
  filteredDataset: Dataset
  onChange: (patch: Partial<KpiTileSpec>) => void
  onDelete: () => void
}

const AGGREGATORS: Aggregator[] = ['sum', 'avg', 'count', 'min', 'max', 'median']
const FORMATS: KpiTileSpec['format'][] = ['number', 'currency', 'percent']

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'boolean') return v ? 1 : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function computeKpi(rows: Dataset['rows'], columnId: string, agg: Aggregator): number | null {
  const values = rows
    .map((r) => toNumber(r[columnId]))
    .filter((v): v is number => v !== null)
  if (agg === 'count') return rows.filter((r) => r[columnId] !== null && r[columnId] !== '').length
  if (values.length === 0) return null
  switch (agg) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid]
    }
    default:
      return null
  }
}

function formatNumber(n: number, fmt: KpiTileSpec['format']) {
  if (fmt === 'currency') return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  if (fmt === 'percent') return (n * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'
  if (Math.abs(n) >= 10_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function compareDelta(filtered: number | null, total: number | null) {
  if (filtered === null || total === null || total === 0) return null
  return (filtered - total) / Math.abs(total)
}

export function KpiTileRenderer({ tile, dataset, filteredDataset, onChange, onDelete }: KpiTileRendererProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(tile.title)

  const numericColumns = dataset.columns.filter((c: Column) => c.type === 'number')
  const col = dataset.columns.find((c) => c.id === tile.columnId)

  const filteredValue = computeKpi(filteredDataset.rows, tile.columnId, tile.aggregate)
  const totalValue = computeKpi(dataset.rows, tile.columnId, tile.aggregate)
  const delta = compareDelta(filteredValue, totalValue)
  const filteredVsTotal = dataset.rows.length !== filteredDataset.rows.length

  return (
    <TileShell
      title={tile.title}
      subtitle={`${tile.aggregate} · ${col?.name ?? '(no column)'}`}
      onDelete={onDelete}
      actions={
        <Popover
          align="end"
          trigger={
            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              aria-label="Edit KPI"
              title="Edit KPI"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          }
        >
          <MenuLabel>Title</MenuLabel>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                onChange({ title: titleDraft || tile.title })
                setEditingTitle(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onChange({ title: titleDraft || tile.title })
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              className="mb-1 w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <MenuItem onSelect={() => { setTitleDraft(tile.title); setEditingTitle(true) }}>{tile.title}</MenuItem>
          )}

          <MenuLabel>Column</MenuLabel>
          <div className="max-h-40 overflow-auto">
            {numericColumns.map((c) => (
              <MenuItem key={c.id} onSelect={() => onChange({ columnId: c.id })}>
                <span className={cn('flex-1 truncate', c.id === tile.columnId && 'font-medium text-foreground')}>
                  {c.name}
                </span>
              </MenuItem>
            ))}
          </div>

          <MenuLabel>Aggregate</MenuLabel>
          {AGGREGATORS.map((a) => (
            <MenuItem key={a} onSelect={() => onChange({ aggregate: a })}>
              <span className={cn('flex-1 capitalize', a === tile.aggregate && 'font-medium text-foreground')}>
                {a}
              </span>
            </MenuItem>
          ))}

          <MenuLabel>Format</MenuLabel>
          {FORMATS.map((f) => (
            <MenuItem key={f} onSelect={() => onChange({ format: f })}>
              <span className={cn('flex-1 capitalize', f === tile.format && 'font-medium text-foreground')}>
                {f}
              </span>
            </MenuItem>
          ))}
        </Popover>
      }
    >
      <div className="flex h-full flex-col items-start justify-center gap-1 px-4 py-3">
        <div className="text-3xl font-semibold tabular-nums tracking-tight">
          {filteredValue === null ? <span className="text-muted-foreground">—</span> : formatNumber(filteredValue, tile.format)}
        </div>
        {filteredVsTotal && delta !== null && (
          <div
            className={cn(
              'text-xs tabular-nums',
              delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {delta > 0 ? '+' : ''}
            {(delta * 100).toFixed(1)}% vs unfiltered
          </div>
        )}
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {filteredDataset.rows.length.toLocaleString()} rows
        </div>
      </div>
    </TileShell>
  )
}
