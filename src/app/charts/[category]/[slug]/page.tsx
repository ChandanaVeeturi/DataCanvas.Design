import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, AlertTriangle } from 'lucide-react'
import { getAllChartSlugs, getChartBySlug, getCategoryBySlug, getChartsByCategory } from '@/data/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComplexityBadge } from '@/components/ui/complexity-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChartDetailPreview } from '@/components/charts/chart-detail-preview'
import type { ChartCategory } from '@/data/charts/types'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  return getAllChartSlugs().map(({ category, slug }) => ({ category, slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const chart = getChartBySlug(slug)
  if (!chart) return {}
  return {
    title: chart.seoTitle,
    description: chart.seoDescription,
    keywords: chart.tags,
  }
}

export default async function ChartDetailPage({ params }: Props) {
  const { category, slug } = await params
  const chart = getChartBySlug(slug)
  if (!chart || chart.category !== category) notFound()
  const cat = getCategoryBySlug(chart.category as ChartCategory)
  const related = getChartsByCategory(chart.category).filter(c => c.id !== chart.id).slice(0, 3)

  return (
    <div className="container py-10 flex flex-col gap-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/charts" className="hover:text-foreground transition-colors">Charts</Link>
        <span>/</span>
        <Link href={`/charts/${chart.category}`} className="hover:text-foreground transition-colors capitalize">{chart.category}</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{chart.name}</span>
      </div>

      {/* Hero grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <ComplexityBadge complexity={chart.complexity} />
            <Badge variant="secondary" className="capitalize">{chart.category}</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{chart.name}</h1>
            <p className="text-muted-foreground text-base leading-relaxed">{chart.description}</p>
          </div>
          <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Facts</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Complexity</p>
                <p className="font-medium capitalize">{chart.complexity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{chart.category}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/playground?chart=${chart.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try in Playground →
            </Link>
            <Link
              href="/wizard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Chart Finder
            </Link>
          </div>
        </div>

        {/* Right: Chart Preview */}
        <div className="lg:col-span-3">
          <ChartDetailPreview chart={chart} />
        </div>
      </div>

      {/* Detail tabs */}
      <Tabs defaultValue="when-to-use">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="when-to-use">When to Use</TabsTrigger>
          <TabsTrigger value="when-not">When NOT to Use</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="mistakes">Common Mistakes</TabsTrigger>
        </TabsList>

        <TabsContent value="when-to-use">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="font-semibold">When to use a {chart.name}</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {chart.whenToUse.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="when-not">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold">When NOT to use a {chart.name}</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {chart.whenNotToUse.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h2 className="font-semibold">Best practices for {chart.name}s</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {chart.bestPractices.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold">Common mistakes with {chart.name}s</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {chart.commonMistakes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Long description */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold mb-4">About the {chart.name}</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          {chart.longDescription.split('\n\n').map((para, i) => (
            <p key={i} className="mb-3">{para}</p>
          ))}
        </div>
      </div>

      {/* Related Charts */}
      {related.length > 0 && (
        <div className="border-t border-border pt-8">
          <h2 className="text-xl font-bold mb-5">Related {cat?.name} Charts</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/charts/${r.category}/${r.id}`} className="group">
                <Card className="h-full hover:border-primary/50 transition-all">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
