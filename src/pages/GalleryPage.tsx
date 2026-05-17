import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Database,
  ExternalLink,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select } from '@/components/ui/select'
import { CHART_TYPES, CATEGORIES, getChartMeta, type ChartMeta } from '@/lib/chartMeta'
import { SAMPLES, buildSampleDataset } from '@/data/samples'
import type { ChartType, Dataset } from '@/lib/types'
import { ChartPlayground } from '@/components/charts/ChartPlayground'
import { useDatasetsStore } from '@/stores/datasets.store'
import { cn } from '@/lib/utils'

export function GalleryPage() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('iris')
  const [activeType, setActiveType] = useState<ChartType | null>(null)
  const [activeCategory, setActiveCategory] = useState<ChartMeta['category'] | 'all'>('all')

  // Materialize the chosen sample dataset for chart previews / playground.
  const dataset = useMemo<Dataset>(() => {
    const spec = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0]
    return buildSampleDataset(spec)
  }, [selectedSampleId])

  const filteredCharts = useMemo(() => {
    if (activeCategory === 'all') return CHART_TYPES
    return CHART_TYPES.filter((c) => c.category === activeCategory)
  }, [activeCategory])

  if (activeType) {
    const meta = getChartMeta(activeType)!
    return (
      <PlaygroundView
        meta={meta}
        dataset={dataset}
        selectedSampleId={selectedSampleId}
        onSampleChange={setSelectedSampleId}
        onBack={() => setActiveType(null)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <BookOpen className="h-3 w-3 text-accent" />
          Chart Library
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Pick the right chart for the question
        </h1>
        <p className="text-balance mt-3 max-w-2xl text-base text-muted-foreground">
          Browse every chart DataCanvas supports, read when to use it, and click any card
          to try it on a sample dataset in the interactive playground.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryPill
            label="All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              description={cat.description}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="min-w-[200px]">
            <FieldLabel htmlFor="gallery-sample">Sample dataset</FieldLabel>
            <Select
              id="gallery-sample"
              value={selectedSampleId}
              onChange={setSelectedSampleId}
              options={SAMPLES.map((s) => ({ value: s.id, label: s.title }))}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCharts.map((meta) => (
          <GalleryCard
            key={meta.type}
            meta={meta}
            onSelect={() => setActiveType(meta.type)}
          />
        ))}
      </div>

      {filteredCharts.length === 0 && (
        <div className="rounded-lg border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
          No chart types in this category yet.
        </div>
      )}
    </div>
  )
}

function CategoryPill({
  label,
  description,
  active,
  onClick,
}: {
  label: string
  description?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={description}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary/70 bg-primary/10 text-primary'
          : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-card hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function GalleryCard({ meta, onSelect }: { meta: ChartMeta; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full flex-col rounded-lg border bg-card/60 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="h-10 w-16 text-primary">{meta.preview}</div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {meta.category}
        </span>
      </div>
      <h3 className="text-base font-semibold">{meta.label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {meta.bestFor.slice(0, 3).map((b) => (
          <span
            key={b}
            className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {b}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-end pt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Try it
        <ArrowRight className="ml-1 h-3 w-3" />
      </div>
    </button>
  )
}

interface PlaygroundProps {
  meta: ChartMeta
  dataset: Dataset
  selectedSampleId: string
  onSampleChange: (id: string) => void
  onBack: () => void
}

function PlaygroundView({ meta, dataset, selectedSampleId, onSampleChange, onBack }: PlaygroundProps) {
  const navigate = useNavigate()
  const addDataset = useDatasetsStore((s) => s.addDataset)

  const openInWorkspace = async () => {
    // Re-build to ensure a fresh copy (RNG-seeded so values are stable).
    const spec = SAMPLES.find((s) => s.id === selectedSampleId)
    if (!spec) return
    const ds = buildSampleDataset(spec)
    await addDataset(ds)
    navigate(`/workspace/${ds.id}`)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Library
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-12 text-primary">{meta.preview}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {meta.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="min-w-[180px]">
            <FieldLabel htmlFor="pg-sample">Sample dataset</FieldLabel>
            <Select
              id="pg-sample"
              value={selectedSampleId}
              onChange={onSampleChange}
              options={SAMPLES.map((s) => ({ value: s.id, label: s.title }))}
            />
          </div>
          <Button size="sm" onClick={openInWorkspace}>
            <ExternalLink className="h-3.5 w-3.5" />
            Use in workspace
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 xl:grid-cols-[1fr_320px]">
        <div className="flex min-h-0 flex-col">
          <ChartPlayground dataset={dataset} type={meta.type} />
        </div>
        <aside className="space-y-4 overflow-auto">
          <InfoCard icon={Sparkles} title="When to use">
            <p className="text-sm leading-relaxed text-muted-foreground">{meta.whenToUse}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {meta.bestFor.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={Database} title="Encodings">
            <p className="text-sm leading-relaxed text-muted-foreground">{meta.encodings}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Suggested sample:{' '}
              <button
                type="button"
                onClick={() => onSampleChange(meta.suggestedDataset)}
                className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                {SAMPLES.find((s) => s.id === meta.suggestedDataset)?.title ?? meta.suggestedDataset}
              </button>
            </p>
          </InfoCard>

          <InfoCard icon={Lightbulb} title="Watch out for">
            <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {meta.pitfalls.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </InfoCard>
        </aside>
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-accent" />
        {title}
      </div>
      {children}
    </div>
  )
}
