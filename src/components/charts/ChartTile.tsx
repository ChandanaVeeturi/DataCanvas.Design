import { Copy, Download, Pencil, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import type { ChartSpec, Dataset } from '@/lib/types'
import { ChartRenderer } from './ChartRenderer'
import { useECharts } from './useECharts'

interface ChartTileProps {
  spec: ChartSpec
  dataset: Dataset
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onDownload: () => void
}

export function ChartTile({ spec, dataset, onEdit, onDuplicate, onDelete, onDownload }: ChartTileProps) {
  const { register, unregister } = useECharts()
  useEffect(() => () => unregister(spec.id), [spec.id, unregister])

  return (
    <div className="group flex h-72 flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{spec.title}</h3>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {spec.type}
            {spec.aggregate !== 'none' ? ` · ${spec.aggregate}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconBtn onClick={onDownload} label="Download PNG"><Download className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn onClick={onDuplicate} label="Duplicate"><Copy className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn onClick={onEdit} label="Edit"><Pencil className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn onClick={onDelete} label="Delete" destructive><Trash2 className="h-3.5 w-3.5" /></IconBtn>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-2">
        <ChartRenderer
          spec={spec}
          dataset={dataset}
          className="h-full"
          onReady={(inst) => register(spec.id, inst)}
        />
      </div>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  destructive,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/10 ${
        destructive ? 'hover:text-destructive' : 'hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
