import { useEffect, useMemo } from 'react'
import { BarChart2, Calendar, Hash, ListChecks, X } from 'lucide-react'
import type { Column, DataRow } from '@/lib/types'
import { summarizeColumn, type ColumnSummary } from '@/features/stats/summary'
import { cn } from '@/lib/utils'

interface StatsPanelProps {
  column: Column | null
  rows: DataRow[]
  totalRows: number
  onClose: () => void
}

export function StatsPanel({ column, rows, totalRows, onClose }: StatsPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const summary = useMemo(() => (column ? summarizeColumn(rows, column) : null), [column, rows])

  if (!column || !summary) return null

  return (
    <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l bg-card shadow-2xl animate-fade-in">
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {summary.kind === 'numeric' && <Hash className="h-3 w-3" />}
            {summary.kind === 'categorical' && <ListChecks className="h-3 w-3" />}
            {summary.kind === 'date' && <Calendar className="h-3 w-3" />}
            {summary.kind === 'boolean' && <BarChart2 className="h-3 w-3" />}
            {column.type}
          </div>
          <h3 className="mt-0.5 truncate text-base font-semibold">{column.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {summary.count.toLocaleString()} values · {summary.missing.toLocaleString()} missing ·{' '}
            {(summary.missing / totalRows * 100).toFixed(1)}% null
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close stats"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {summary.kind === 'numeric' && <NumericView summary={summary} />}
        {summary.kind === 'categorical' && <CategoricalView summary={summary} />}
        {summary.kind === 'date' && <DateView summary={summary} />}
        {summary.kind === 'boolean' && <BooleanView summary={summary} />}
      </div>
    </div>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('rounded-md border bg-background p-3', className)}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 10_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 3 })
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function NumericView({ summary }: { summary: Extract<ColumnSummary, { kind: 'numeric' }> }) {
  const maxBin = Math.max(...summary.histogram.map((b) => b.count), 1)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Count" value={summary.count.toLocaleString()} />
        <Stat label="Unique" value={summary.unique.toLocaleString()} />
        <Stat label="Sum" value={fmt(summary.sum)} />
        <Stat label="Mean" value={fmt(summary.mean)} />
        <Stat label="Median" value={fmt(summary.median)} />
        <Stat label="Std dev" value={fmt(summary.stdev)} />
        <Stat label="Min" value={fmt(summary.min)} />
        <Stat label="Max" value={fmt(summary.max)} />
        <Stat label="Q1" value={fmt(summary.q1)} />
        <Stat label="Q3" value={fmt(summary.q3)} />
        <Stat label="IQR" value={fmt(summary.iqr)} className="col-span-2" />
      </div>

      <div>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Distribution
        </div>
        <div className="flex h-28 items-end gap-0.5 rounded-md border bg-background p-2">
          {summary.histogram.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/70 transition-colors hover:bg-primary"
              style={{ height: `${(b.count / maxBin) * 100}%` }}
              title={`${b.range[0].toFixed(2)} – ${b.range[1].toFixed(2)} · ${b.count}`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>{fmt(summary.min)}</span>
          <span>{fmt(summary.max)}</span>
        </div>
      </div>
    </div>
  )
}

function CategoricalView({ summary }: { summary: Extract<ColumnSummary, { kind: 'categorical' }> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Count" value={summary.count.toLocaleString()} />
        <Stat label="Unique" value={summary.unique.toLocaleString()} />
      </div>
      <div>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Top values
        </div>
        <ul className="space-y-1.5">
          {summary.top.map((row) => (
            <li key={row.value} className="rounded-md border bg-background p-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium">{row.value}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {row.count.toLocaleString()} · {(row.pct * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-muted">
                <div
                  className="h-1 rounded-full bg-primary"
                  style={{ width: `${row.pct * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {summary.unique > summary.top.length && (
          <p className="mt-2 text-xs text-muted-foreground">
            + {(summary.unique - summary.top.length).toLocaleString()} more values
          </p>
        )}
      </div>
    </div>
  )
}

function DateView({ summary }: { summary: Extract<ColumnSummary, { kind: 'date' }> }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Count" value={summary.count.toLocaleString()} />
        <Stat label="Unique" value={summary.unique.toLocaleString()} />
        <Stat label="Earliest" value={summary.min.toISOString().slice(0, 10)} />
        <Stat label="Latest" value={summary.max.toISOString().slice(0, 10)} />
        <Stat label="Span" value={`${summary.spanDays.toFixed(0)} days`} className="col-span-2" />
      </div>
    </div>
  )
}

function BooleanView({ summary }: { summary: Extract<ColumnSummary, { kind: 'boolean' }> }) {
  const total = summary.trueCount + summary.falseCount
  const truePct = total ? summary.trueCount / total : 0
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="True" value={`${summary.trueCount.toLocaleString()} · ${(truePct * 100).toFixed(1)}%`} />
        <Stat label="False" value={`${summary.falseCount.toLocaleString()} · ${((1 - truePct) * 100).toFixed(1)}%`} />
      </div>
      <div className="flex h-3 overflow-hidden rounded-full border bg-background">
        <div className="bg-primary" style={{ width: `${truePct * 100}%` }} />
        <div className="bg-muted" style={{ width: `${(1 - truePct) * 100}%` }} />
      </div>
    </div>
  )
}
