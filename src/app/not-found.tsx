import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          The chart or page you are looking for doesn&apos;t exist. Try the chart library or use the wizard to find your chart.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/charts"
          className="h-10 inline-flex items-center px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Browse Charts
        </Link>
        <Link
          href="/wizard"
          className="h-10 inline-flex items-center px-5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
        >
          Chart Finder
        </Link>
      </div>
    </div>
  )
}
