import { Filter, X } from 'lucide-react'
import type { DashboardFilter, Dataset } from '@/lib/types'

interface FilterChipsProps {
  filters: DashboardFilter[]
  dataset: Dataset
  onRemoveValue: (columnId: string, value: string) => void
  onClearAll: () => void
}

export function FilterChips({ filters, dataset, onRemoveValue, onClearAll }: FilterChipsProps) {
  const total = filters.reduce((acc, f) => acc + f.values.length, 0)
  if (total === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-3 w-3" />
        Click any chart element to cross-filter the dashboard.
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Filter className="h-3.5 w-3.5 text-primary" />
      {filters.flatMap((f) => {
        const col = dataset.columns.find((c) => c.id === f.columnId)
        const label = col?.name ?? f.columnId
        return f.values.map((value) => (
          <button
            key={`${f.columnId}::${value}`}
            type="button"
            onClick={() => onRemoveValue(f.columnId, value)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs text-foreground hover:bg-primary/20"
          >
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))
      })}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
