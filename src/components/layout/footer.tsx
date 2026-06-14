import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

const footerLinks = {
  'Chart Library': [
    { label: 'Comparison Charts', href: '/charts/comparison' },
    { label: 'Trend Charts', href: '/charts/trends' },
    { label: 'Distribution Charts', href: '/charts/distribution' },
    { label: 'Relationship Charts', href: '/charts/relationship' },
    { label: 'Composition Charts', href: '/charts/composition' },
    { label: 'Flow Charts', href: '/charts/flow' },
    { label: 'Hierarchy Charts', href: '/charts/hierarchy' },
  ],
  'Tools': [
    { label: 'Chart Finder', href: '/wizard' },
    { label: 'Playground', href: '/playground' },
    { label: 'Dataset Library', href: '/datasets' },
    { label: 'Dashboard Inspiration', href: '/dashboards' },
  ],
  'Popular Charts': [
    { label: 'When to use a Bar Chart', href: '/charts/comparison/bar-chart' },
    { label: 'When to use a Pie Chart', href: '/charts/composition/pie-chart' },
    { label: 'When to use a Line Chart', href: '/charts/trends/line-chart' },
    { label: 'When to use a Scatter Plot', href: '/charts/relationship/scatter-plot' },
    { label: 'When to use a Treemap', href: '/charts/composition/treemap' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>DataCanvas<span className="text-primary">.</span>Design</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The complete reference for data visualization — learn which chart to use, why it works, and how to design it well.
            </p>
            <p className="text-xs text-muted-foreground">
              Data visualization is both a science and an art.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">{group}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DataCanvas.Design. Built for data storytellers everywhere.
          </p>
          <p className="text-xs text-muted-foreground">
            Best chart for comparison · Best chart for trends · Data visualization examples
          </p>
        </div>
      </div>
    </footer>
  )
}
