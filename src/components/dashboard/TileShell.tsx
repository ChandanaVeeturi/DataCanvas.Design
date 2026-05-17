import type { ReactNode } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TileShellProps {
  title?: string
  subtitle?: string
  onDelete?: () => void
  className?: string
  contentClassName?: string
  children: ReactNode
  actions?: ReactNode
}

/** A drag handle + delete + header for grid tiles. The drag handle is what
 *  react-grid-layout listens to (selector `.tile-drag-handle`). */
export function TileShell({
  title,
  subtitle,
  onDelete,
  className,
  contentClassName,
  children,
  actions,
}: TileShellProps) {
  return (
    <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      <div className="flex items-center gap-2 border-b px-2.5 py-1.5">
        <button
          type="button"
          className="tile-drag-handle inline-flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent/10 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag tile"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          {title && <h3 className="truncate text-xs font-semibold leading-tight">{title}</h3>}
          {subtitle && (
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {actions}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete tile"
              title="Delete tile"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className={cn('min-h-0 flex-1 overflow-hidden', contentClassName)}>{children}</div>
    </div>
  )
}
