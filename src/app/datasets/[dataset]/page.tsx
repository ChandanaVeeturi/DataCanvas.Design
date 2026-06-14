import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Table2, BarChart2 } from 'lucide-react'
import { DATASETS, getDatasetById } from '@/data/datasets'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ dataset: string }>
}

export async function generateStaticParams() {
  return DATASETS.map((d) => ({ dataset: d.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dataset } = await params
  const d = getDatasetById(dataset)
  if (!d) return {}
  return {
    title: `${d.name} Dataset — Sample Data for Visualization`,
    description: d.description,
  }
}

const TYPE_COLORS: Record<string, string> = {
  number: 'hsl(239, 84%, 60%)',
  string: 'hsl(142, 71%, 45%)',
  date: 'hsl(25, 95%, 53%)',
  boolean: 'hsl(340, 82%, 52%)',
}

export default async function DatasetDetailPage({ params }: Props) {
  const { dataset } = await params
  const d = getDatasetById(dataset)
  if (!d) notFound()

  return (
    <div className="container py-10 flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-3">
        <Link href="/datasets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Datasets
        </Link>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{d.industry}</span>
          <h1 className="text-3xl font-bold tracking-tight">{d.name}</h1>
          <p className="text-muted-foreground text-lg">{d.description}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Table2 className="h-4 w-4" /> {d.rows.toLocaleString()} rows</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><BarChart2 className="h-4 w-4" /> {d.columns} columns</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Schema */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Schema</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Column</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {d.fields.map((f, i) => (
                    <tr key={f.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-mono font-medium">{f.name}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${TYPE_COLORS[f.type]}15`, color: TYPE_COLORS[f.type] }}>
                          {f.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardContent className="p-5 flex flex-col gap-4">
              <h3 className="font-semibold">Use Cases</h3>
              <ul className="flex flex-col gap-2">
                {d.useCases.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold">Recommended Charts</h3>
              <div className="flex flex-col gap-2">
                {d.recommendedCharts.map((c) => (
                  <Link key={c} href={`/charts/${c}`} className="text-sm text-primary hover:underline">
                    {c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          <Link
            href="/playground"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Explore in Playground
          </Link>
        </div>
      </div>

      {/* Sample data */}
      <div>
        <h2 className="text-lg font-bold mb-4">Sample Rows</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {d.fields.map((f) => (
                    <th key={f.name} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{f.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.sampleRows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {d.fields.map((f) => (
                      <td key={f.name} className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {String(row[f.name] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
