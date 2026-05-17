import { useEffect, useMemo, useState } from 'react'
import { Check, Group, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select } from '@/components/ui/select'
import type { Dataset } from '@/lib/types'
import { buildGroupedDataset, groupBy, type GroupAggregator, type GroupValueSpec } from '@/features/transforms/groupBy'

const AGG_OPTIONS: { value: GroupAggregator; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'median', label: 'Median' },
]

interface GroupByDialogProps {
  dataset: Dataset
  onCancel: () => void
  onSave: (dataset: Dataset) => void
}

export function GroupByDialog({ dataset, onCancel, onSave }: GroupByDialogProps) {
  const [name, setName] = useState(`${dataset.name} (grouped)`)
  const [groupCols, setGroupCols] = useState<string[]>([])
  const [values, setValues] = useState<GroupValueSpec[]>([])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const numericCols = useMemo(() => dataset.columns.filter((c) => c.type === 'number'), [dataset.columns])
  const categoricalCols = useMemo(
    () =>
      dataset.columns.filter(
        (c) => c.type === 'categorical' || c.type === 'string' || c.type === 'boolean' || c.type === 'date',
      ),
    [dataset.columns],
  )

  const preview = useMemo(() => {
    if (groupCols.length === 0 && values.length === 0) return null
    return groupBy(dataset, groupCols, values)
  }, [dataset, groupCols, values])

  const previewRows = preview?.rows.slice(0, 6) ?? []

  const toggleGroup = (id: string) => {
    setGroupCols((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  }

  const addValue = () => {
    if (numericCols.length === 0) return
    setValues((v) => [...v, { columnId: numericCols[0].id, aggregator: 'sum' }])
  }

  const updateValue = (idx: number, patch: Partial<GroupValueSpec>) => {
    setValues((v) => v.map((spec, i) => (i === idx ? { ...spec, ...patch } : spec)))
  }

  const removeValue = (idx: number) => setValues((v) => v.filter((_, i) => i !== idx))

  const handleSave = () => {
    const trimmed = name.trim() || `${dataset.name} (grouped)`
    onSave(buildGroupedDataset(dataset, groupCols, values, trimmed))
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-card shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Group className="h-3 w-3 text-primary" />
            Group & aggregate
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick columns to group by and value columns to aggregate. The result becomes a new dataset.
          </p>
        </div>

        <div className="grid gap-5 px-5 py-4 md:grid-cols-2">
          <div>
            <FieldLabel>Group by</FieldLabel>
            <div className="max-h-44 overflow-auto rounded-md border bg-background">
              {categoricalCols.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No groupable columns.</div>
              ) : (
                categoricalCols.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleGroup(c.id)}
                    className="flex w-full items-center justify-between gap-2 border-b px-3 py-1.5 text-left text-sm last:border-b-0 hover:bg-accent/5"
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.type}
                      {groupCols.includes(c.id) && <Check className="h-3.5 w-3.5 text-primary" />}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <FieldLabel className="mb-0">Aggregate values</FieldLabel>
              <button
                type="button"
                onClick={addValue}
                disabled={numericCols.length === 0}
                className="inline-flex items-center gap-1 rounded text-xs text-primary hover:underline disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {values.length === 0 && (
                <div className="rounded-md border border-dashed bg-background px-3 py-2 text-xs text-muted-foreground">
                  No aggregators yet. Without any, the result will just count rows per group.
                </div>
              )}
              {values.map((v, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Select
                    value={v.aggregator}
                    onChange={(value) => updateValue(i, { aggregator: value as GroupAggregator })}
                    options={AGG_OPTIONS}
                    className="w-28 shrink-0"
                  />
                  <Select
                    value={v.columnId}
                    onChange={(value) => updateValue(i, { columnId: value })}
                    options={numericCols.map((c) => ({ value: c.id, label: c.name }))}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeValue(i)}
                    aria-label="Remove"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t bg-card/40 px-5 py-3">
          <FieldLabel>New dataset name</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {preview && previewRows.length > 0 && (
          <div className="border-t bg-background px-5 py-3">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Preview ({preview.rows.length.toLocaleString()} rows total)
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    {preview.columns.map((c) => (
                      <th key={c.id} className="border-b px-2 py-1 text-left font-medium">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      {preview.columns.map((c) => {
                        const v = row[c.id]
                        const display = v === null || v === undefined
                          ? ''
                          : v instanceof Date
                          ? v.toISOString().slice(0, 10)
                          : typeof v === 'number'
                          ? Number.isInteger(v) ? v.toString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 })
                          : String(v)
                        return (
                          <td key={c.id} className="px-2 py-1 font-mono tabular-nums">
                            {display}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t bg-card/40 px-5 py-3">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!preview || preview.rows.length === 0}>
            Save as new dataset
          </Button>
        </div>
      </div>
    </div>
  )
}
