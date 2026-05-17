import { useEffect, useMemo, useState } from 'react'
import { Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select } from '@/components/ui/select'
import { useDatasetsStore } from '@/stores/datasets.store'
import type { Dataset } from '@/lib/types'
import { buildJoinedDataset, joinDatasets, type JoinKind } from '@/features/transforms/join'

interface JoinDialogProps {
  leftDataset: Dataset
  onCancel: () => void
  onSave: (dataset: Dataset) => void
}

const JOIN_OPTIONS: { value: JoinKind; label: string; description: string }[] = [
  { value: 'inner', label: 'Inner', description: 'Only matching rows' },
  { value: 'left', label: 'Left', description: 'All left rows + matches' },
  { value: 'right', label: 'Right', description: 'All right rows + matches' },
  { value: 'outer', label: 'Outer', description: 'All rows from both sides' },
]

export function JoinDialog({ leftDataset, onCancel, onSave }: JoinDialogProps) {
  const datasets = useDatasetsStore((s) => s.datasets)
  const otherDatasets = useMemo(
    () => datasets.filter((d) => d.id !== leftDataset.id),
    [datasets, leftDataset.id],
  )
  const [rightId, setRightId] = useState(otherDatasets[0]?.id ?? '')
  const right = useMemo(() => otherDatasets.find((d) => d.id === rightId), [otherDatasets, rightId])
  const [leftKey, setLeftKey] = useState(leftDataset.columns[0]?.id ?? '')
  const [rightKey, setRightKey] = useState(right?.columns[0]?.id ?? '')
  const [kind, setKind] = useState<JoinKind>('inner')
  const [name, setName] = useState(`${leftDataset.name} ⋈ ${right?.name ?? '?'}`)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  useEffect(() => {
    setRightKey(right?.columns[0]?.id ?? '')
    setName(`${leftDataset.name} ⋈ ${right?.name ?? '?'}`)
  }, [right, leftDataset.name])

  const preview = useMemo(() => {
    if (!right || !leftKey || !rightKey) return null
    return joinDatasets(leftDataset, right, leftKey, rightKey, kind)
  }, [leftDataset, right, leftKey, rightKey, kind])

  const previewRows = preview?.rows.slice(0, 6) ?? []
  const matchedRatio = preview && leftDataset.rows.length > 0
    ? (preview.rows.length / leftDataset.rows.length).toFixed(2)
    : null

  const handleSave = () => {
    if (!right) return
    const trimmedName = name.trim() || `${leftDataset.name} ⋈ ${right.name}`
    onSave(buildJoinedDataset(leftDataset, right, leftKey, rightKey, kind, trimmedName))
  }

  if (otherDatasets.length === 0) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-2xl">
          <Link2 className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">Nothing to join with</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Load at least one more dataset before joining.
          </p>
          <Button size="sm" variant="outline" className="mt-4" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    )
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
            <Link2 className="h-3 w-3 text-primary" />
            Join datasets
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Join <span className="font-medium text-foreground">{leftDataset.name}</span> with another loaded dataset.
            The result becomes a new dataset.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <FieldLabel>Left dataset</FieldLabel>
              <div className="rounded-md border bg-background px-3 py-2 text-sm">
                <div className="font-medium">{leftDataset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {leftDataset.rowCount.toLocaleString()} rows
                </div>
              </div>
            </div>
            <div>
              <FieldLabel>Left key column</FieldLabel>
              <Select
                value={leftKey}
                onChange={setLeftKey}
                options={leftDataset.columns.map((c) => ({ value: c.id, label: c.name, hint: c.type }))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <FieldLabel>Right dataset</FieldLabel>
              <Select
                value={rightId}
                onChange={setRightId}
                options={otherDatasets.map((d) => ({ value: d.id, label: d.name }))}
              />
            </div>
            <div>
              <FieldLabel>Right key column</FieldLabel>
              <Select
                value={rightKey}
                onChange={setRightKey}
                options={(right?.columns ?? []).map((c) => ({ value: c.id, label: c.name, hint: c.type }))}
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <FieldLabel>Join type</FieldLabel>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {JOIN_OPTIONS.map((opt) => {
              const active = kind === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  className={`rounded-md border p-2 text-left text-xs transition-colors ${
                    active
                      ? 'border-primary/70 bg-primary/10'
                      : 'hover:border-primary/40 hover:bg-card'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground">{opt.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {preview && (
          <div className="border-t bg-background px-5 py-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Preview ({preview.rows.length.toLocaleString()} rows)</span>
              {matchedRatio && <span>match ratio: {matchedRatio}× left</span>}
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
                        const display = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v)
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

        <div className="border-t bg-card/40 px-5 py-3">
          <FieldLabel>New dataset name</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

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
