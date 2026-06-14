import Link from 'next/link'
import type { Metadata } from 'next'
import type { LucideProps } from 'lucide-react'
import { ArrowRight, BarChart2, TrendingUp, Activity, GitBranch, PieChart, ArrowRightCircle, Network, Zap, BookOpen, Play } from 'lucide-react'
import { CATEGORIES, CHARTS } from '@/data/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroShowcase } from '@/components/home/hero-showcase'

export const metadata: Metadata = {
  title: 'DataCanvas.Design — Find the Right Chart for Your Data',
  description: 'The complete data visualization reference. Explore 30+ chart types, find the right chart for your data, and experiment in the interactive playground.',
}

const CATEGORY_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  comparison: BarChart2,
  trends: TrendingUp,
  distribution: Activity,
  relationship: GitBranch,
  composition: PieChart,
  flow: ArrowRightCircle,
  hierarchy: Network,
}

const FEATURED_CHARTS = [
  { id: 'bar-chart', category: 'comparison' },
  { id: 'line-chart', category: 'trends' },
  { id: 'scatter-plot', category: 'relationship' },
  { id: 'pie-chart', category: 'composition' },
  { id: 'funnel-chart', category: 'flow' },
  { id: 'treemap', category: 'composition' },
]

export default function HomePage() {
  const featuredCharts = FEATURED_CHARTS.map(f => CHARTS.find(c => c.id === f.id)).filter(Boolean)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="relative container py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Badge variant="default">30+ Chart Types</Badge>
                <Badge variant="secondary">Interactive Playground</Badge>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl">
                The right chart<br />
                <span className="gradient-text">for every story.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Data visualization is both a science and an art. Explore 30+ chart types — learn when to use them, why they work, and how to design them well.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/wizard"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Zap className="h-4 w-4" />
                  Find My Chart
                </Link>
                <Link
                  href="/charts"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse All Charts
                </Link>
                <Link
                  href="/playground"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Playground
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />30+ chart types</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Interactive examples</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" />Best practices</span>
              </div>
            </div>
            <div className="lg:block">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex flex-col gap-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Browse by Goal</span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What are you trying to show?</h2>
          <p className="text-muted-foreground">Every chart answers a different question. Choose your goal to find the right chart type.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id]
            return (
              <Link
                key={cat.id}
                href={`/charts/${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${cat.color}18` }}
                >
                  {Icon && <Icon className="h-6 w-6" style={{ color: cat.color }} />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.chartCount} charts</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Charts */}
      <section className="border-t border-border bg-card/50">
        <div className="container py-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Popular Charts</span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Start here</h2>
            </div>
            <Link
              href="/charts"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all 30+ charts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCharts.map((chart) => {
              if (!chart) return null
              return (
                <Link
                  key={chart.id}
                  href={`/charts/${chart.category}/${chart.id}`}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{chart.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{chart.category}</p>
                        </div>
                        <Badge
                          variant={chart.complexity === 'beginner' ? 'success' : chart.complexity === 'intermediate' ? 'warning' : 'destructive'}
                        >
                          {chart.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{chart.description}</p>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">
                        View guide <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link href="/charts" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              View all charts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <div className="text-center flex flex-col items-center gap-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Three ways to find your chart</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Use the Chart Finder',
              description: 'Answer 3 quick questions about your data and goal. Get a ranked list of chart recommendations with explanations.',
              href: '/wizard',
              label: 'Open Chart Finder →',
              color: 'hsl(239, 84%, 60%)',
            },
            {
              step: '02',
              title: 'Browse the Library',
              description: '30+ chart types organized by goal: comparison, trends, distribution, relationship, composition, flow, and hierarchy.',
              href: '/charts',
              label: 'Browse Charts →',
              color: 'hsl(188, 95%, 43%)',
            },
            {
              step: '03',
              title: 'Experiment in the Playground',
              description: 'Switch between chart types with your own data, and see changes instantly. Compare multiple visualizations side by side.',
              href: '/playground',
              label: 'Open Playground →',
              color: 'hsl(262, 83%, 58%)',
            },
          ].map((item) => (
            <Card key={item.step} className="relative overflow-hidden">
              <CardContent className="p-6 flex flex-col gap-4">
                <span className="text-5xl font-black" style={{ color: `${item.color}30` }}>{item.step}</span>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                </div>
                <Link href={item.href} className="text-sm font-medium" style={{ color: item.color }}>
                  {item.label}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-16 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Not sure which chart to use?</h2>
          <p className="text-muted-foreground text-lg max-w-xl">Answer 3 questions and we'll recommend the best chart for your data and audience.</p>
          <Link
            href="/wizard"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Zap className="h-5 w-5" />
            Find My Chart — it's free
          </Link>
          <p className="text-sm text-muted-foreground">No signup required · Instant results · Works for any goal</p>
        </div>
      </section>
    </div>
  )
}
