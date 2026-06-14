import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CATEGORIES, CHARTS, getCategoryBySlug, getChartsByCategory } from '@/data/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ChartCategory } from '@/data/charts/types'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryBySlug(category as ChartCategory)
  if (!cat) return {}
  return {
    title: `${cat.name} Charts — Best Charts for ${cat.name}`,
    description: `${cat.description}. Browse ${cat.chartCount} ${cat.name.toLowerCase()} chart types with best practices and interactive examples.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category as ChartCategory)
  if (!cat) notFound()
  const charts = getChartsByCategory(cat.id)

  return (
    <div className="container py-12 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href="/charts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Chart Library
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{cat.chartCount} Charts</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{cat.name} Charts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{cat.description}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {charts.map((chart) => (
          <Link key={chart.id} href={`/charts/${chart.category}/${chart.id}`} className="group">
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-base group-hover:text-primary transition-colors">{chart.name}</h2>
                  <Badge variant={chart.complexity === 'beginner' ? 'success' : chart.complexity === 'intermediate' ? 'warning' : 'destructive'}>
                    {chart.complexity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{chart.description}</p>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Best for:</p>
                  <ul className="flex flex-col gap-1">
                    {chart.whenToUse.slice(0, 3).map((use) => (
                      <li key={use} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  View full guide →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Related categories */}
      <div className="border-t border-border pt-8">
        <h3 className="text-sm font-semibold mb-4">Other chart categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => c.id !== cat.id).map(c => (
            <Link
              key={c.id}
              href={`/charts/${c.id}`}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
