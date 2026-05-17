import { useEffect, useMemo, useState } from 'react'
import { FieldLabel, Select } from '@/components/ui/select'
import { ChartRenderer } from './ChartRenderer'
import { defaultSpecFor } from '@/lib/chart-data'
import { encodingLayoutFor } from '@/lib/chart-encoding'
import type { Aggregator, ChartSpec, ChartType, Dataset } from '@/lib/types'

interface ChartPlaygroundProps {
  /** Sample dataset the user is currently exploring. */
  dataset: Dataset
  /** Chart type to render. Switching this resets encodings to defaults. */
  type: ChartType
  /** Optional "use this dataset in workspace" CTA. */
  onOpenInWorkspace?: () => void
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

export function ChartPlayground({ dataset, type, onOpenInWorkspace }: ChartPlaygroundProps) {
  const [spec, setSpec] = useState<ChartSpec>(() => defaultSpecFor(type, dataset, dataset.id))

  // Reset spec when the chart type or dataset changes.
  useEffect(() => {
    setSpec(defaultSpecFor(type, dataset, dataset.id))
  }, [type, dataset])

  const layout = useMemo(() => encodingLayoutFor(spec.type, dataset.columns), [spec.type, dataset.columns])

  const update = (patch: Partial<ChartSpec>) => setSpec((s) => ({ ...s, ...patch }))
  const updateEncoding = (key: keyof ChartSpec['encoding'], value: string) =>
    setSpec((s) => ({ ...s, encoding: { ...s.encoding, [key]: value || undefined } }))
  const updateOptions = (patch: Partial<ChartSpec['options']>) =>
    setSpec((s) => ({ ...s, options: { ...s.options, ...patch } }))

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="overflow-auto rounded-lg border bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Encodings
          </h4>
          {onOpenInWorkspace && (
            <button
              type="button"
              onClick={onOpenInWorkspace}
              className="text-[11px] text-primary hover:underline"
            >
              Open in workspace →
            </button>
          )}
        </div>

        <div className="space-y-3">
          {layout.x && (
            <div>
              <FieldLabel htmlFor="pp-x">{layout.x.label}</FieldLabel>
              <Select id="pp-x" value={spec.encoding.x} onChange={(v) => updateEncoding('x', v)} options={layout.x.opts} />
            </div>
          )}
          {layout.y && (
            <div>
              <FieldLabel htmlFor="pp-y">{layout.y.label}</FieldLabel>
              <Select id="pp-y" value={spec.encoding.y} onChange={(v) => updateEncoding('y', v)} options={layout.y.opts} />
            </div>
          )}
          {layout.series && (
            <div>
              <FieldLabel htmlFor="pp-series">{layout.series.label}</FieldLabel>
              <Select
                id="pp-series"
                value={spec.encoding.series}
                onChange={(v) => updateEncoding('series', v)}
                options={[{ value: '', label: 'None' }, ...layout.series.opts]}
              />
            </div>
          )}
          {layout.size && (
            <div>
              <FieldLabel htmlFor="pp-size">{layout.size.label}</FieldLabel>
              <Select
                id="pp-size"
                value={spec.encoding.size}
                onChange={(v) => updateEncoding('size', v)}
                options={[{ value: '', label: 'None' }, ...layout.size.opts]}
              />
            </div>
          )}

          {layout.agg && (
            <div>
              <FieldLabel htmlFor="pp-agg">Aggregation</FieldLabel>
              <Select
                id="pp-agg"
                value={spec.aggregate}
                onChange={(v) => update({ aggregate: v as Aggregator })}
                options={AGG_OPTIONS}
              />
            </div>
          )}

          {layout.bins && (
            <div>
              <FieldLabel htmlFor="pp-bins">Bins</FieldLabel>
              <input
                id="pp-bins"
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

          <div className="space-y-2 border-t pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Display
            </p>
            {(spec.type === 'bar' || spec.type === 'area' || spec.type === 'line') && (
              <ToggleRow
                label="Stacked"
                checked={!!spec.options.stacked}
                onChange={(v) => updateOptions({ stacked: v })}
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

      <div className="min-h-0">
        <div className="h-full rounded-lg border bg-card p-3">
          <ChartRenderer spec={spec} dataset={dataset} className="h-full min-h-[420px]" />
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
