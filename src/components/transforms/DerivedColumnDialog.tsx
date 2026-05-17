import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, FunctionSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Column, DataRow, Dataset } from '@/lib/types'
import { applyDerivedColumn, compileFormula, makeIdentifierMap } from '@/features/transforms/derived'

interface DerivedColumnDialogProps {
  dataset: Dataset
  onCancel: () => void
  onSave: (newColumn: Column, nextRows: DataRow[]) => void
}

const EXAMPLES = [
  '= price * quantity',
  '= if(age >= 18, "adult", "minor")',
  '= upper(name)',
  '= year(order_date)',
  '= revenue / quantity',
]

export function DerivedColumnDialog({ dataset, onCancel, onSave }: DerivedColumnDialogProps) {
  const [name, setName] = useState('new_column')
  const [formula, setFormula] = useState('= ')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const { identifierByName, hintLines } = useMemo(
    () => makeIdentifierMap(dataset.columns),
    [dataset.columns],
  )

  const compiled = useMemo(
    () => compileFormula(formula, identifierByName),
    [formula, identifierByName],
  )

  const previewRows = useMemo(() => dataset.rows.slice(0, 6), [dataset.rows])
  const previewValues = useMemo(() => {
    if (!compiled.ok) return null
    return previewRows.map((row) => compiled.compiled.evaluate(row))
  }, [compiled, previewRows])

  const handleSave = () => {
    if (!compiled.ok) return
    const trimmedName = name.trim() || 'new_column'
    const newId = ensureUniqueId(trimmedName, dataset.columns)
    const inferredType = compiled.compiled.inferType(dataset.rows)
    const nextRows = applyDerivedColumn(dataset.rows, newId, compiled.compiled)
    onSave({ id: newId, name: trimmedName, type: inferredType }, nextRows)
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
            <FunctionSquare className="h-3 w-3 text-primary" />
            New derived column
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reference any column by its name. Use operators (<code className="font-mono">+ - * / ^ %</code>),
            comparisons (<code className="font-mono">{'< > = !=, =='}</code>), and helpers like{' '}
            <code className="font-mono">if(cond, a, b)</code>,{' '}
            <code className="font-mono">upper / lower / trim</code>,{' '}
            <code className="font-mono">year / month / day</code>,{' '}
            <code className="font-mono">min / max / round / abs / sqrt</code>.
          </p>
        </div>

        <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_240px]">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Column name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Formula
              </label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                rows={3}
                spellCheck={false}
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {!compiled.ok && formula.trim() !== '=' && formula.trim() !== '' && (
                <div className="mt-1 flex items-start gap-1.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{compiled.error.message}</span>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setFormula(ex)}
                    className="rounded-full border bg-secondary/50 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview
              </div>
              <div className="overflow-hidden rounded-md border bg-background">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium">#</th>
                      <th className="px-2 py-1 text-left font-medium">{name || 'new column'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((_, i) => {
                      const v = previewValues?.[i]
                      const display =
                        v === null || v === undefined
                          ? 'null'
                          : v instanceof Date
                          ? v.toISOString().slice(0, 10)
                          : String(v)
                      return (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1 text-muted-foreground tabular-nums">{i + 1}</td>
                          <td className="px-2 py-1 font-mono text-foreground">{display}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="rounded-md border bg-background p-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Available identifiers
            </div>
            <ul className="mt-2 max-h-72 space-y-0.5 overflow-auto text-xs">
              {hintLines.map((line) => (
                <li key={line} className="truncate font-mono text-muted-foreground">
                  {line}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-card/40 px-5 py-3">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!compiled.ok || !name.trim()}>
            Add column
          </Button>
        </div>
      </div>
    </div>
  )
}

function ensureUniqueId(base: string, existing: Column[]): string {
  const taken = new Set(existing.map((c) => c.id))
  let candidate = base
  let i = 2
  while (taken.has(candidate)) {
    candidate = `${base}_${i++}`
  }
  return candidate
}
