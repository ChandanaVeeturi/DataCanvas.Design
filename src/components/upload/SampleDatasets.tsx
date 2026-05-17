import { useNavigate } from 'react-router-dom'
import { Flower2, Ship, Car, ShoppingBag, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { SAMPLES, buildSampleDataset } from '@/data/samples'
import { useDatasetsStore } from '@/stores/datasets.store'
import { toast } from '@/stores/toast.store'

const ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  iris: { icon: Flower2, color: 'text-fuchsia-500' },
  titanic: { icon: Ship, color: 'text-sky-500' },
  'nyc-taxi': { icon: Car, color: 'text-amber-500' },
  'sales-demo': { icon: ShoppingBag, color: 'text-emerald-500' },
}

export function SampleDatasets() {
  const navigate = useNavigate()
  const addDataset = useDatasetsStore((s) => s.addDataset)

  const handleLoad = (specId: string) => {
    const spec = SAMPLES.find((s) => s.id === specId)
    if (!spec) return
    const dataset = buildSampleDataset(spec)
    addDataset(dataset)
    toast.success(`Loaded sample: ${dataset.name}`, `${dataset.rowCount.toLocaleString()} rows`)
    navigate(`/workspace/${dataset.id}`)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SAMPLES.map((s) => {
        const meta = ICONS[s.id] ?? { icon: Flower2, color: 'text-muted-foreground' }
        const Icon = meta.icon
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleLoad(s.id)}
            className="text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            aria-label={`Load ${s.title} sample dataset`}
          >
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-card">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">{s.title}</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    {s.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
