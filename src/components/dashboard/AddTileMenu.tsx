import { BarChart3, FileText, Hash, Plus } from 'lucide-react'
import type { ChartSpec, Column } from '@/lib/types'
import { MenuItem, MenuLabel, MenuSeparator, Popover } from '@/components/ui/popover'

interface AddTileMenuProps {
  charts: ChartSpec[]
  numericColumns: Column[]
  onAddChart: (chartId: string) => void
  onAddKpi: (columnId: string) => void
  onAddText: () => void
  onCreateNewChart: () => void
}

export function AddTileMenu({
  charts,
  numericColumns,
  onAddChart,
  onAddKpi,
  onAddText,
  onCreateNewChart,
}: AddTileMenuProps) {
  return (
    <Popover
      align="end"
      trigger={
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add tile
        </button>
      }
    >
      <MenuLabel>Charts</MenuLabel>
      {charts.length === 0 ? (
        <div className="px-2 py-1 text-xs text-muted-foreground">
          No charts saved yet.
        </div>
      ) : (
        <div className="max-h-40 overflow-auto">
          {charts.map((c) => (
            <MenuItem key={c.id} onSelect={() => onAddChart(c.id)}>
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1 truncate">{c.title}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.type}
              </span>
            </MenuItem>
          ))}
        </div>
      )}
      <MenuItem onSelect={onCreateNewChart}>
        <Plus className="h-3.5 w-3.5" />
        <span className="flex-1">Build new chart…</span>
      </MenuItem>

      <MenuSeparator />
      <MenuLabel>KPI tile</MenuLabel>
      {numericColumns.length === 0 ? (
        <div className="px-2 py-1 text-xs text-muted-foreground">
          No numeric columns in this dataset.
        </div>
      ) : (
        <div className="max-h-40 overflow-auto">
          {numericColumns.map((col) => (
            <MenuItem key={col.id} onSelect={() => onAddKpi(col.id)}>
              <Hash className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1 truncate">{col.name}</span>
            </MenuItem>
          ))}
        </div>
      )}

      <MenuSeparator />
      <MenuItem onSelect={onAddText}>
        <FileText className="h-3.5 w-3.5" />
        Text / note tile
      </MenuItem>
    </Popover>
  )
}
