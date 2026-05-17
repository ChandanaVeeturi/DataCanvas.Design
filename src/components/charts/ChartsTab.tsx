import { useMemo } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useChartsStore } from '@/stores/charts.store'
import type { Dataset } from '@/lib/types'
import { ChartTile } from './ChartTile'
import { Button } from '@/components/ui/button'
import { useECharts } from './useECharts'

interface ChartsTabProps {
  dataset: Dataset
  onNew: () => void
  onEdit: (chartId: string) => void
}

export function ChartsTab({ dataset, onNew, onEdit }: ChartsTabProps) {
  const allCharts = useChartsStore((s) => s.charts)
  const charts = useMemo(
    () => allCharts.filter((c) => c.datasetId === dataset.id),
    [allCharts, dataset.id],
  )
  const removeChart = useChartsStore((s) => s.removeChart)
  const duplicateChart = useChartsStore((s) => s.duplicateChart)
  const { downloadChartAsPng } = useECharts()

  if (charts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-base font-semibold">No charts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a chart type, map columns to encodings, and build your first
            visualization. Add as many as you want — they all share this dataset.
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus className="h-4 w-4" />
          New chart
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card/40 px-6 py-3">
        <div>
          <h3 className="text-sm font-semibold">{charts.length} chart{charts.length === 1 ? '' : 's'}</h3>
          <p className="text-xs text-muted-foreground">All saved locally in this session.</p>
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" />
          New chart
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-4 overflow-auto p-6 md:grid-cols-2 xl:grid-cols-3">
        {charts.map((spec) => (
          <ChartTile
            key={spec.id}
            spec={spec}
            dataset={dataset}
            onEdit={() => onEdit(spec.id)}
            onDuplicate={() => duplicateChart(spec.id)}
            onDelete={() => removeChart(spec.id)}
            onDownload={() => downloadChartAsPng(spec.id, spec.title)}
          />
        ))}
      </div>
    </div>
  )
}
