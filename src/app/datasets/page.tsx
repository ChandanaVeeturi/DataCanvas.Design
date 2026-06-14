import type { Metadata } from 'next'
import Link from 'next/link'
import type { LucideProps } from 'lucide-react'
import { ShoppingCart, Megaphone, DollarSign, Layers, Rocket, Globe, ArrowRight } from 'lucide-react'
import { DATASETS } from '@/data/datasets'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Dataset Library — Sample Datasets for Data Visualization',
  description: 'Download and explore sample datasets for sales, marketing, finance, product analytics, startups, and population. Perfect for practicing data visualization.',
}

const DATASET_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  ShoppingCart, Megaphone, DollarSign, Layers, Rocket, Globe,
}

export default function DatasetsPage() {
  return (
    <div className="container py-12 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Dataset Library</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sample Datasets</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Ready-to-use datasets for practicing data visualization. Each dataset includes field schemas, sample rows, and recommended charts.
        </p>
      </div>

      {/* Dataset grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DATASETS.map((dataset) => {
          const Icon = DATASET_ICONS[dataset.icon]
          return (
            <Link key={dataset.id} href={`/datasets/${dataset.id}`} className="group">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6 flex flex-col gap-4 h-full">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${dataset.color}18` }}
                    >
                      {Icon && <Icon className="h-6 w-6" style={{ color: dataset.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold group-hover:text-primary transition-colors">{dataset.name}</h2>
                      <p className="text-xs text-muted-foreground">{dataset.industry}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{dataset.description}</p>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Rows</p>
                      <p className="font-semibold">{dataset.rows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Columns</p>
                      <p className="font-semibold">{dataset.columns}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {dataset.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  {/* Recommended charts */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Recommended charts</p>
                    <div className="flex flex-wrap gap-1">
                      {dataset.recommendedCharts.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{c.replace(/-/g, ' ')}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    Explore dataset <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center text-center gap-4">
        <h2 className="text-xl font-bold">Ready to visualize?</h2>
        <p className="text-muted-foreground max-w-md">Load any dataset into the playground to instantly try different chart types.</p>
        <Link
          href="/playground"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Open Playground →
        </Link>
      </div>
    </div>
  )
}
