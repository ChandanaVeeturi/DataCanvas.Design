import { Link } from 'react-router-dom'
import { Dropzone } from '@/components/upload/Dropzone'
import { SampleDatasets } from '@/components/upload/SampleDatasets'
import { ArrowRight, BarChart3, BookOpen, Calculator, Sparkles, Table2 } from 'lucide-react'

const features = [
  {
    icon: Table2,
    title: 'Inspect & shape',
    body: 'Sort, filter, rename, retype, hide, and clean your columns in a virtualized grid.',
  },
  {
    icon: Calculator,
    title: 'Excel-class formulas',
    body: 'Add derived columns with a familiar formula bar. Pivot, group, and join across files.',
  },
  {
    icon: BarChart3,
    title: 'Charts & dashboards',
    body: 'Build interactive charts, snap them onto a dashboard, cross-filter, then screenshot or export.',
  },
]

export function LandingPage() {
  return (
    <div className="relative isolate">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-10 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Sparkles className="h-3 w-3 text-accent" />
          Runs entirely in your browser
          <span className="text-muted-foreground/40">·</span>
          <span>Data never uploaded</span>
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Turn spreadsheets into{' '}
          <span className="bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
            interactive canvases
          </span>
        </h1>
        <p className="text-balance mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Upload a CSV or Excel file, pick your columns, run formulas and stats,
          chart it, dashboard it, and ship the screenshot.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <Dropzone />
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          or try a{' '}
          <a href="#samples" className="inline-flex items-center gap-1 text-foreground hover:text-primary">
            sample dataset <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="animate-fade-in rounded-lg border bg-card/60 p-5 text-left shadow-sm transition-colors hover:bg-card"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="samples" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Sample datasets</h2>
            <p className="text-sm text-muted-foreground">
              Explore the studio without uploading anything.
            </p>
          </div>
        </div>
        <SampleDatasets />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Link
          to="/gallery"
          className="group relative block overflow-hidden rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
        >
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                <BookOpen className="h-3 w-3" />
                New
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Browse the chart library</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Eleven chart types with guidance on when to use each. Click any card to play
                with the chart on a sample dataset — no upload required.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              Open library
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </section>
      <footer className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground">
            Made with <span aria-label="love" role="img">❤️</span> by{' '}
            <span className="font-medium text-foreground">Chandana Veeturi</span> from India
          </div>
        </footer>
    </div>
  )
}
