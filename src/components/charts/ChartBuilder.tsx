import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select } from '@/components/ui/select'
import { ChartTypePicker } from './ChartTypePicker'
import { ChartRenderer } from './ChartRenderer'
import { defaultSpecFor } from '@/lib/chart-data'
import { encodingLayoutFor } from '@/lib/chart-encoding'
import type { Aggregator, ChartSpec, ChartType, Dataset } from '@/lib/types'

interface ChartBuilderProps {
  dataset: Dataset
  initialSpec?: ChartSpec
  onSave: (spec: ChartSpec) => void
  onCancel: () => void
}

const AGG_OPTIONS: { value: Aggregator; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'median', label: 'Median' },
  { value: 'none', label: 'None (raw)' },
]


export function ChartBuilder({ dataset, initialSpec, onSave, onCancel }: ChartBuilderProps) {
  const [spec, setSpec] = useState<ChartSpec>(
    () => initialSpec ?? defaultSpecFor('bar', dataset, dataset.id),
  )

  const layout = useMemo(() => encodingLayoutFor(spec.type, dataset.columns), [spec.type, dataset.columns])

  // When switching chart type, reseed encoding to sensible defaults if current picks don't fit.
  const setType = (type: ChartType) => {
    setSpec((prev) => {
      const fresh = defaultSpecFor(type, dataset, dataset.id)
      return {
        ...fresh,
        id: prev.id,
        title: prev.title.startsWith('New ') ? fresh.title : prev.title,
      }
    })
  }

  // Auto-update title to reflect chart type when user hasn't customized it.
  useEffect(() => {
    setSpec((s) => (s.title.startsWith('New ') ? { ...s, title: `New ${s.type} chart` } : s))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.type])

  const update = (patch: Partial<ChartSpec>) => setSpec((s) => ({ ...s, ...patch }))
  const updateEncoding = (key: keyof ChartSpec['encoding'], value: string) =>
    setSpec((s) => ({ ...s, encoding: { ...s.encoding, [key]: value || undefined } }))
  const updateOptions = (patch: Partial<ChartSpec['options']>) =>
    setSpec((s) => ({ ...s, options: { ...s.options, ...patch } }))

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="min-w-0">
            <input
              value={spec.title}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full bg-transparent text-base font-semibold tracking-tight focus:outline-none"
              placeholder="Chart title"
            />
            <p className="text-xs text-muted-foreground">
              {initialSpec ? 'Editing chart' : 'Building new chart'} · {dataset.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(spec)}>
            <Save className="h-3.5 w-3.5" />
            Save chart
          </Button>
        </div>
      </div>

      <div className="border-b px-6 py-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          Chart type
        </div>
        <ChartTypePicker value={spec.type} onChange={setType} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside className="border-b lg:border-b-0 lg:border-r overflow-auto p-5">
          <div className="space-y-4">
            {layout.x && (
              <div>
                <FieldLabel htmlFor="enc-x">{layout.x.label}</FieldLabel>
                <Select id="enc-x" value={spec.encoding.x} onChange={(v) => updateEncoding('x', v)} options={layout.x.opts} />
              </div>
            )}
            {'y' in layout && layout.y && (
              <div>
                <FieldLabel htmlFor="enc-y">{layout.y.label}</FieldLabel>
                <Select id="enc-y" value={spec.encoding.y} onChange={(v) => updateEncoding('y', v)} options={layout.y.opts} />
              </div>
            )}
            {'series' in layout && layout.series && (
              <div>
                <FieldLabel htmlFor="enc-series">{layout.series.label}</FieldLabel>
                <Select id="enc-series" value={spec.encoding.series} onChange={(v) => updateEncoding('series', v)} options={[{ value: '', label: 'None' }, ...layout.series.opts]} />
              </div>
            )}
            {'size' in layout && layout.size && (
              <div>
                <FieldLabel htmlFor="enc-size">{layout.size.label}</FieldLabel>
                <Select id="enc-size" value={spec.encoding.size} onChange={(v) => updateEncoding('size', v)} options={[{ value: '', label: 'None' }, ...layout.size.opts]} />
              </div>
            )}

            {layout.agg && (
              <div>
                <FieldLabel htmlFor="agg">Aggregation</FieldLabel>
                <Select id="agg" value={spec.aggregate} onChange={(v) => update({ aggregate: v as Aggregator })} options={AGG_OPTIONS} />
              </div>
            )}

            {'bins' in layout && (
              <div>
                <FieldLabel htmlFor="bins">Bins</FieldLabel>
                <input
                  id="bins"
                  type="range"
                  min={4}
                  max={60}
                  value={spec.options.binCount ?? 20}
                  onChange={(e) => updateOptions({ binCount: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
                  {spec.options.binCount ?? 20}
                </div>
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Display</p>
              {(spec.type === 'bar' || spec.type === 'area' || spec.type === 'line' || spec.type === 'rose') && (
                <ToggleRow
                  label="Stacked"
                  checked={!!spec.options.stacked}
                  onChange={(v) => updateOptions({ stacked: v })}
                />
              )}
              {spec.type === 'funnel' && (
                <ToggleRow
                  label="Ascending (narrow at top)"
                  checked={!!spec.options.ascending}
                  onChange={(v) => updateOptions({ ascending: v })}
                />
              )}
              {spec.type === 'bar' && (
                <ToggleRow
                  label="Horizontal"
                  checked={!!spec.options.horizontal}
                  onChange={(v) => updateOptions({ horizontal: v })}
                />
              )}
              {(spec.type === 'line' || spec.type === 'area') && (
                <ToggleRow
                  label="Smooth lines"
                  checked={!!spec.options.smooth}
                  onChange={(v) => updateOptions({ smooth: v })}
                />
              )}
              {(spec.type === 'bar' || spec.type === 'line' || spec.type === 'area' || spec.type === 'scatter') && (
                <ToggleRow
                  label="Log scale Y"
                  checked={!!spec.options.logScale}
                  onChange={(v) => updateOptions({ logScale: v })}
                />
              )}
              <ToggleRow
                label="Show legend"
                checked={spec.options.showLegend !== false}
                onChange={(v) => updateOptions({ showLegend: v })}
              />
            </div>
          </div>
        </aside>

        <div className="min-h-0 p-5">
          <div className="h-full rounded-lg border bg-card p-3">
            <ChartRenderer spec={spec} dataset={dataset} className="h-full min-h-[400px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-1 text-sm hover:bg-muted/40">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
    </label>
  )
}
