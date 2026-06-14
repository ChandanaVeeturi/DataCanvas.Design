import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Dashboard Inspiration — Executive, Product, Marketing & Finance Dashboards',
  description: 'Browse dashboard design inspiration for executive, product, marketing, and finance teams. Each with chart type breakdowns and design principles.',
}

const DASHBOARDS = [
  {
    id: 'executive',
    name: 'Executive Dashboard',
    description: 'High-level company KPIs for C-suite — revenue, growth, burn rate, and headcount in a single view.',
    audience: 'C-Suite',
    chartTypes: ['KPI Cards', 'Line Chart', 'Bar Chart', 'Bullet Chart'],
    color: 'hsl(239, 84%, 60%)',
    principles: [
      'Limit to 6–8 metrics that directly tie to business goals',
      'Use large KPI tiles for the most critical numbers',
      'Include period-over-period comparisons (vs last month, vs last year)',
      'Color red/green only for directional indicators (not decoration)',
    ],
    layout: [
      { type: 'KPI', label: 'Total Revenue', value: '$4.2M', change: '+12%', positive: true },
      { type: 'KPI', label: 'Gross Margin', value: '68%', change: '+2pp', positive: true },
      { type: 'KPI', label: 'Active Customers', value: '1,842', change: '+8%', positive: true },
      { type: 'KPI', label: 'Churn Rate', value: '2.1%', change: '-0.4pp', positive: true },
    ],
  },
  {
    id: 'product',
    name: 'Product Dashboard',
    description: 'DAU, retention, feature adoption, and NPS for product teams shipping and iterating weekly.',
    audience: 'Product & Engineering',
    chartTypes: ['Line Chart', 'Funnel Chart', 'Stacked Bar', 'Scatter Plot'],
    color: 'hsl(262, 83%, 58%)',
    principles: [
      'Show DAU/MAU ratio as engagement health indicator',
      'Retention curves (D1, D7, D30) as the north star metric',
      'Feature adoption funnel to find drop-off points',
      'Cohort analysis for understanding long-term behavior',
    ],
    layout: [
      { type: 'KPI', label: 'Daily Active Users', value: '14.2K', change: '+5%', positive: true },
      { type: 'KPI', label: 'D30 Retention', value: '41%', change: '+3pp', positive: true },
      { type: 'KPI', label: 'Feature Adoption', value: '34%', change: '+2pp', positive: true },
      { type: 'KPI', label: 'NPS Score', value: '52', change: '+4', positive: true },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Dashboard',
    description: 'Campaign performance, CAC, ROAS, and channel attribution for marketing teams optimizing spend.',
    audience: 'Marketing',
    chartTypes: ['Funnel Chart', 'Bar Chart', 'Area Chart', 'Pie Chart'],
    color: 'hsl(188, 95%, 43%)',
    principles: [
      'Conversion funnel from awareness to purchase per channel',
      'ROAS trend over time to show campaign efficiency',
      'Channel mix pie chart updated weekly',
      'CAC vs LTV scatter to identify best customer segments',
    ],
    layout: [
      { type: 'KPI', label: 'Total Leads', value: '3,240', change: '+18%', positive: true },
      { type: 'KPI', label: 'Conversion Rate', value: '8.4%', change: '+1.2pp', positive: true },
      { type: 'KPI', label: 'Avg. ROAS', value: '4.2×', change: '+0.3', positive: true },
      { type: 'KPI', label: 'CAC', value: '$48', change: '-12%', positive: true },
    ],
  },
  {
    id: 'finance',
    name: 'Finance Dashboard',
    description: 'P&L summary, cash flow, budget vs actuals, and runway for finance and ops teams.',
    audience: 'Finance & Operations',
    chartTypes: ['Bullet Chart', 'Bar Chart', 'Area Chart', 'Table'],
    color: 'hsl(142, 71%, 45%)',
    principles: [
      'Bullet charts for budget vs actuals by department',
      'Runway as a single headline number with burn rate context',
      'Waterfall chart for P&L decomposition',
      'Rolling 12-month trend for all key metrics',
    ],
    layout: [
      { type: 'KPI', label: 'Monthly Revenue', value: '$1.4M', change: '+9%', positive: true },
      { type: 'KPI', label: 'Gross Profit', value: '$952K', change: '+11%', positive: true },
      { type: 'KPI', label: 'Operating Expenses', value: '$480K', change: '+4%', positive: false },
      { type: 'KPI', label: 'Runway', value: '18 mo', change: '+2 mo', positive: true },
    ],
  },
]

export default function DashboardsPage() {
  return (
    <div className="container py-12 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Dashboard Inspiration</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard Design Patterns</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Real-world dashboard layouts for different teams. Learn which charts work best for executive reporting, product analytics, marketing, and finance.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="flex flex-col gap-10">
        {DASHBOARDS.map((dash) => (
          <section key={dash.id} id={dash.id} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: dash.color }} />
              <div>
                <h2 className="text-xl font-bold">{dash.name}</h2>
                <p className="text-sm text-muted-foreground">{dash.description}</p>
              </div>
              <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">{dash.audience}</Badge>
            </div>

            {/* KPI preview row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dash.layout.map((kpi) => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <p className={`text-xs font-medium mt-0.5 ${kpi.positive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {kpi.change} vs last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Design principles */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Card>
                <CardContent className="p-5 flex flex-col gap-3">
                  <h3 className="font-semibold text-sm">Design Principles</h3>
                  <ul className="flex flex-col gap-2">
                    {dash.principles.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: dash.color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex flex-col gap-3">
                  <h3 className="font-semibold text-sm">Chart Types Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {dash.chartTypes.map((ct) => (
                      <Badge key={ct} variant="outline">{ct}</Badge>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 mt-1">
                    <Link
                      href={`/dashboards/${dash.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      View full dashboard guide <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Build your own dashboard</h2>
        <p className="text-muted-foreground max-w-md">Use the playground to experiment with the chart types that appear in these dashboards.</p>
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
