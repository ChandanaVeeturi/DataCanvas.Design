import type { ChartType } from '@/lib/types'
import { CHART_TYPES } from '@/lib/chartMeta'
import { cn } from '@/lib/utils'

interface ChartTypePickerProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

export { CHART_TYPES }

export function ChartTypePicker({ value, onChange }: ChartTypePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {CHART_TYPES.map((meta) => {
        const active = meta.type === value
        return (
          <button
            key={meta.type}
            type="button"
            onClick={() => onChange(meta.type)}
            className={cn(
              'group flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-card hover:text-foreground',
            )}
          >
            <div className="h-8 w-12">{meta.preview}</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium">{meta.label}</span>
              <span className="text-[10px] opacity-70">{meta.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
