import { useMemo, type RefObject } from 'react'
import { GridLayout, useContainerWidth, type Layout } from 'react-grid-layout'
import type {
  ChartSpec,
  ChartTileSpec,
  DashboardSpec,
  Dataset,
  KpiTileSpec,
  TextTileSpec,
  Tile,
  TileLayout,
} from '@/lib/types'
import { ChartTileRenderer } from './ChartTileRenderer'
import { KpiTileRenderer } from './KpiTileRenderer'
import { TextTileRenderer } from './TextTileRenderer'

interface DashboardGridProps {
  dashboard: DashboardSpec
  dataset: Dataset
  filteredDataset: Dataset
  charts: ChartSpec[]
  onLayoutChange: (layout: TileLayout[]) => void
  onUpdateTile: (tileId: string, tile: Tile) => void
  onRemoveTile: (tileId: string) => void
  onCrossFilter: (columnId: string, value: string) => void
}

export function DashboardGrid({
  dashboard,
  dataset,
  filteredDataset,
  charts,
  onLayoutChange,
  onUpdateTile,
  onRemoveTile,
  onCrossFilter,
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: false })
  // The hook returns RefObject<HTMLDivElement | null>; React 18 RefObject is
  // generically strict, so widen for the div ref prop.
  const divRef = containerRef as RefObject<HTMLDivElement>

  const layout = useMemo<Layout>(
    () => dashboard.layout.map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH })),
    [dashboard.layout],
  )

  if (dashboard.tiles.length === 0) {
    return (
      <div ref={divRef} className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
        <div className="max-w-sm">
          <p className="font-medium text-foreground">Empty dashboard</p>
          <p className="mt-1">
            Use the <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">+ Add tile</span> menu to
            drop in existing charts, KPI tiles, or notes. Drag to rearrange, drag corners to resize.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={divRef} className="h-full">
      {mounted && width > 0 && (
        <GridLayout
          width={width}
          layout={layout}
          gridConfig={{
            cols: 12,
            rowHeight: 40,
            margin: [12, 12],
            containerPadding: [16, 16],
            maxRows: Infinity,
          }}
          dragConfig={{ enabled: true, bounded: false, handle: '.tile-drag-handle', threshold: 3 }}
          resizeConfig={{ enabled: true, handles: ['se'] }}
          onLayoutChange={(next) => {
            const stripped: TileLayout[] = next.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
            // Avoid persisting transient no-op changes.
            const same =
              stripped.length === dashboard.layout.length &&
              stripped.every((l) => {
                const prev = dashboard.layout.find((p) => p.i === l.i)
                return prev && prev.x === l.x && prev.y === l.y && prev.w === l.w && prev.h === l.h
              })
            if (!same) onLayoutChange(stripped)
          }}
        >
          {dashboard.tiles.map((tile) => (
            <div key={tile.id} data-tile-id={tile.id}>
              {renderTile(tile, { dataset, filteredDataset, charts, onUpdateTile, onRemoveTile, onCrossFilter })}
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}

function renderTile(
  tile: Tile,
  ctx: {
    dataset: Dataset
    filteredDataset: Dataset
    charts: ChartSpec[]
    onUpdateTile: (tileId: string, tile: Tile) => void
    onRemoveTile: (tileId: string) => void
    onCrossFilter: (columnId: string, value: string) => void
  },
) {
  if (tile.kind === 'chart') {
    const chart = ctx.charts.find((c) => c.id === tile.chartId)
    return (
      <ChartTileRenderer
        tile={tile as ChartTileSpec}
        chart={chart}
        dataset={ctx.dataset}
        filteredDataset={ctx.filteredDataset}
        onDelete={() => ctx.onRemoveTile(tile.id)}
        onCrossFilter={ctx.onCrossFilter}
      />
    )
  }
  if (tile.kind === 'kpi') {
    return (
      <KpiTileRenderer
        tile={tile as KpiTileSpec}
        dataset={ctx.dataset}
        filteredDataset={ctx.filteredDataset}
        onChange={(patch) => ctx.onUpdateTile(tile.id, { ...tile, ...patch } as Tile)}
        onDelete={() => ctx.onRemoveTile(tile.id)}
      />
    )
  }
  return (
    <TextTileRenderer
      tile={tile as TextTileSpec}
      onChange={(patch) => ctx.onUpdateTile(tile.id, { ...tile, ...patch } as Tile)}
      onDelete={() => ctx.onRemoveTile(tile.id)}
    />
  )
}
