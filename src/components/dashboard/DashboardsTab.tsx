import { useMemo } from 'react'
import { LayoutDashboard, Plus, Trash2 } from 'lucide-react'
import type { Dataset } from '@/lib/types'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardsTabProps {
  dataset: Dataset
  onOpen: (dashboardId: string) => void
  onNew: () => void
}

export function DashboardsTab({ dataset, onOpen, onNew }: DashboardsTabProps) {
  const allDashboards = useDashboardsStore((s) => s.dashboards)
  const dashboards = useMemo(
    () => allDashboards.filter((d) => d.datasetId === dataset.id),
    [allDashboards, dataset.id],
  )
  const removeDashboard = useDashboardsStore((s) => s.removeDashboard)

  if (dashboards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-base font-semibold">No dashboards yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Snap multiple charts onto a single canvas. Add KPI tiles for quick
            stats, click any chart element to cross-filter every tile.
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" />
          New dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card/40 px-6 py-3">
        <div>
          <h3 className="text-sm font-semibold">
            {dashboards.length} dashboard{dashboards.length === 1 ? '' : 's'}
          </h3>
          <p className="text-xs text-muted-foreground">
            Click to open, drag tiles to rearrange, autosaves locally.
          </p>
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" />
          New dashboard
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-4 overflow-auto p-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((d) => (
          <Card
            key={d.id}
            className="group cursor-pointer transition-colors hover:border-primary/40"
            onClick={() => onOpen(d.id)}
          >
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeDashboard(d.id)
                  }}
                  aria-label="Delete dashboard"
                  className="opacity-0 transition-opacity inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <h4 className="truncate text-sm font-semibold">{d.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.tiles.length} tile{d.tiles.length === 1 ? '' : 's'} · updated{' '}
                  {timeAgo(d.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
