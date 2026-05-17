import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, Download, FileText, Image as ImageIcon, Share2 } from 'lucide-react'
import type {
  DashboardFilter,
  DashboardSpec,
  Dataset,
  Tile,
  TileLayout,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MenuItem, MenuLabel, MenuSeparator, Popover } from '@/components/ui/popover'
import { applyFilters, clearFilter, toggleFilterValue } from '@/lib/filters'
import {
  captureDashboardTiles,
  downloadDashboardPdf,
  downloadDashboardPng,
} from '@/lib/dashboard-export'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { toast } from '@/stores/toast.store'
import { DashboardGrid } from './DashboardGrid'
import { AddTileMenu } from './AddTileMenu'
import { FilterChips } from './FilterChips'
import { ShareDialog } from './ShareDialog'

interface DashboardEditorProps {
  dataset: Dataset
  dashboard: DashboardSpec
  onBack: () => void
  onCreateNewChart: () => void
}

function defaultLayoutFor(kind: Tile['kind']): Omit<TileLayout, 'i'> {
  switch (kind) {
    case 'chart':
      return { x: 0, y: Infinity, w: 6, h: 8, minW: 3, minH: 4 }
    case 'kpi':
      return { x: 0, y: Infinity, w: 3, h: 3, minW: 2, minH: 2 }
    case 'text':
      return { x: 0, y: Infinity, w: 6, h: 2, minW: 2, minH: 1 }
  }
}

export function DashboardEditor({ dataset, dashboard, onBack, onCreateNewChart }: DashboardEditorProps) {
  const allCharts = useChartsStore((s) => s.charts)
  const charts = useMemo(
    () => allCharts.filter((c) => c.datasetId === dataset.id),
    [allCharts, dataset.id],
  )
  const upsertDashboard = useDashboardsStore((s) => s.upsertDashboard)

  const [filters, setFilters] = useState<DashboardFilter[]>([])
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(dashboard.name)
  const [busy, setBusy] = useState<null | 'png' | 'pdf'>(null)
  const [showShare, setShowShare] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredDataset = useMemo(() => applyFilters(dataset, filters), [dataset, filters])
  const numericColumns = useMemo(
    () => dataset.columns.filter((c) => c.type === 'number'),
    [dataset.columns],
  )

  const persist = (next: Partial<DashboardSpec>) => {
    const updated: DashboardSpec = {
      ...dashboard,
      ...next,
      updatedAt: Date.now(),
    }
    upsertDashboard(updated)
  }

  const addTile = (tile: Tile) => {
    const layout: TileLayout = { i: tile.id, ...defaultLayoutFor(tile.kind) }
    persist({
      tiles: [...dashboard.tiles, tile],
      layout: [...dashboard.layout, layout],
    })
  }

  const updateTile = (tileId: string, tile: Tile) => {
    persist({ tiles: dashboard.tiles.map((t) => (t.id === tileId ? tile : t)) })
  }

  const removeTile = (tileId: string) => {
    persist({
      tiles: dashboard.tiles.filter((t) => t.id !== tileId),
      layout: dashboard.layout.filter((l) => l.i !== tileId),
    })
  }

  const updateLayout = (layout: TileLayout[]) => {
    persist({ layout })
  }

  const handleCrossFilter = (columnId: string, value: string) => {
    setFilters((f) => toggleFilterValue(f, columnId, value))
  }

  const commitName = () => {
    const trimmed = nameDraft.trim() || dashboard.name
    persist({ name: trimmed })
    setEditingName(false)
  }

  const exportPng = async () => {
    if (!gridRef.current) return
    setBusy('png')
    try {
      await downloadDashboardPng(gridRef.current, dashboard.name)
      toast.success('Downloaded PNG', `${dashboard.name}.png`)
    } catch (err) {
      console.error('PNG export failed', err)
      toast.error('PNG export failed', err instanceof Error ? err.message : undefined)
    } finally {
      setBusy(null)
    }
  }

  const exportPdf = async () => {
    if (!gridRef.current) return
    setBusy('pdf')
    try {
      const captures = await captureDashboardTiles(dashboard, charts, gridRef.current)
      await downloadDashboardPdf(dashboard, dataset, captures)
      toast.success('Downloaded PDF report', `${captures.length + 1} pages`)
    } catch (err) {
      console.error('PDF export failed', err)
      toast.error('PDF export failed', err instanceof Error ? err.message : undefined)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboards
          </Button>
          <div className="min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName()
                  if (e.key === 'Escape') {
                    setNameDraft(dashboard.name)
                    setEditingName(false)
                  }
                }}
                className="bg-transparent text-base font-semibold tracking-tight focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(dashboard.name)
                  setEditingName(true)
                }}
                className="truncate text-base font-semibold tracking-tight hover:text-primary"
              >
                {dashboard.name}
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboard.tiles.length} tile{dashboard.tiles.length === 1 ? '' : 's'} · autosaves
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover
            align="end"
            trigger={
              <button
                type="button"
                disabled={busy !== null || dashboard.tiles.length === 0}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent/10 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                {busy === 'png' ? 'Capturing…' : busy === 'pdf' ? 'Building PDF…' : 'Export'}
              </button>
            }
          >
            <MenuLabel>Export dashboard</MenuLabel>
            <MenuItem onSelect={() => void exportPng()}>
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1">PNG image</span>
            </MenuItem>
            <MenuItem onSelect={() => void exportPdf()}>
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="flex-1">PDF report (one tile per page)</span>
            </MenuItem>
            <MenuSeparator />
            <div className="px-2 py-1 text-[10px] leading-snug text-muted-foreground">
              Captures the current filtered state of the dashboard.
            </div>
          </Popover>

          <button
            type="button"
            onClick={() => setShowShare(true)}
            disabled={dashboard.tiles.length === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent/10 disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>

          <AddTileMenu
            charts={charts}
            numericColumns={numericColumns}
            onAddChart={(chartId) =>
              addTile({ id: crypto.randomUUID(), kind: 'chart', chartId })
            }
            onAddKpi={(columnId) =>
              addTile({
                id: crypto.randomUUID(),
                kind: 'kpi',
                title: dataset.columns.find((c) => c.id === columnId)?.name ?? 'KPI',
                columnId,
                aggregate: 'sum',
                format: 'number',
              })
            }
            onAddText={() =>
              addTile({ id: crypto.randomUUID(), kind: 'text', content: '# New section' })
            }
            onCreateNewChart={onCreateNewChart}
          />
        </div>
      </div>

      <div className="border-b bg-card/30 px-6 py-2">
        <FilterChips
          filters={filters}
          dataset={dataset}
          onRemoveValue={(columnId, value) =>
            setFilters((f) => toggleFilterValue(f, columnId, value))
          }
          onClearAll={() =>
            setFilters((f) => {
              let next = f
              for (const filter of f) next = clearFilter(next, filter.columnId)
              return next
            })
          }
        />
      </div>

      <div ref={gridRef} className="min-h-0 flex-1 overflow-auto bg-background">
        <DashboardGrid
          dashboard={dashboard}
          dataset={dataset}
          filteredDataset={filteredDataset}
          charts={charts}
          onLayoutChange={updateLayout}
          onUpdateTile={updateTile}
          onRemoveTile={removeTile}
          onCrossFilter={handleCrossFilter}
        />
      </div>

      {showShare && (
        <ShareDialog
          dashboard={dashboard}
          charts={charts}
          dataset={dataset}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
