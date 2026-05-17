import { useState } from 'react'
import { CheckCircle2, FileSpreadsheet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ParsedSheet } from '@/features/datasets/parse'

interface SheetPickerProps {
  fileName: string
  sheets: ParsedSheet[]
  onPick: (sheetName: string) => void
  onCancel: () => void
}

export function SheetPicker({ fileName, sheets, onPick, onCancel }: SheetPickerProps) {
  const [selected, setSelected] = useState(sheets[0]?.name ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border bg-card shadow-xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="border-b px-5 py-4">
          <h3 className="text-base font-semibold">Pick a sheet</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{fileName}</p>
        </div>
        <ul className="max-h-72 overflow-auto p-2">
          {sheets.map((s) => {
            const active = s.name === selected
            return (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => setSelected(s.name)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground/80">
                    {s.rowCount.toLocaleString()} rows · {s.columnCount} cols
                    {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onPick(selected)} disabled={!selected}>
            Open sheet
          </Button>
        </div>
      </div>
    </div>
  )
}
