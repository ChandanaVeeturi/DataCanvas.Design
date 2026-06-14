import type { Metadata } from 'next'
import Link from 'next/link'
import type { LucideProps } from 'lucide-react'
import { BarChart2, TrendingUp, Activity, GitBranch, PieChart, ArrowRight, Network } from 'lucide-react'
import { CATEGORIES, CHARTS, getChartsByCategory } from '@/data/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Chart Library — 30+ Data Visualization Types',
  description: 'Browse 30+ chart types organized by goal: comparison, trends, distribution, relationship, composition, flow, and hierarchy. Each with best practices and interactive examples.',
}

const CATEGORY_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  comparison: BarChart2, trends: TrendingUp, distribution: Activity,
  relationship: GitBranch, composition: PieChart, flow: ArrowRight, hierarchy: Network,
}

export default function ChartsPage() {
  return (
    <div className="container py-12 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Chart Library</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">30+ Data Visualization Types</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Every chart has a job. Browse by goal to find the chart that tells your data story best.
        </p>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((cat) => {
        const charts = getChartsByCategory(cat.id)
        const Icon = CATEGORY_ICONS[cat.id]
        return (
          <section key={cat.id} id={cat.id}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}18` }}>
                  {Icon && <Icon className="h-5 w-5" style={{ color: cat.color }} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <Link href={`/charts/${cat.id}`} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all {cat.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map((chart) => (
                <Link key={chart.id} href={`/charts/${chart.category}/${chart.id}`} className="group">
                  <Card className="h-full hover:border-primary/40 hover:shadow-sm transition-all duration-200">
                    <CardContent className="p-5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{chart.name}</h3>
                        <Badge variant={chart.complexity === 'beginner' ? 'success' : chart.complexity === 'intermediate' ? 'warning' : 'destructive'}>
                          {chart.complexity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{chart.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
