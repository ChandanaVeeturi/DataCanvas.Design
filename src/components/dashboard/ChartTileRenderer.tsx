import { AlertCircle } from 'lucide-react'
import type { ChartSpec, ChartTileSpec, Dataset } from '@/lib/types'
import { ChartRenderer } from '@/components/charts/ChartRenderer'
import { TileShell } from './TileShell'

interface ChartTileRendererProps {
  tile: ChartTileSpec
  chart: ChartSpec | undefined
  dataset: Dataset
  filteredDataset: Dataset
  onDelete: () => void
  onCrossFilter: (columnId: string, value: string) => void
}

export function ChartTileRenderer({
  chart,
  dataset,
  filteredDataset,
  onDelete,
  onCrossFilter,
}: ChartTileRendererProps) {
  if (!chart) {
    return (
      <TileShell title="Missing chart" subtitle="chart" onDelete={onDelete}>
        <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            This chart was deleted. Remove the tile.
          </div>
        </div>
      </TileShell>
    )
  }

  // Charts respect cross-filters by default, but heatmap/scatter don't have a
  // single "X category" cleanly. We still pass clicks; the dashboard decides if
  // the column makes sense.
  const xColId = chart.encoding.x

  return (
    <TileShell
      title={chart.title}
      subtitle={`${chart.type}${chart.aggregate !== 'none' ? ` · ${chart.aggregate}` : ''}`}
      onDelete={onDelete}
    >
      <div className="h-full p-2">
        <ChartRenderer
          spec={chart}
          dataset={filteredDataset}
          className="h-full"
          onElementClick={({ name }) => {
            if (!xColId) return
            // Only categorical/string/boolean dims make sense for cross-filter for now.
            const col = dataset.columns.find((c) => c.id === xColId)
            if (!col) return
            if (col.type === 'number' || col.type === 'date') return
            onCrossFilter(xColId, name)
          }}
        />
      </div>
    </TileShell>
  )
}
