import { useEffect, useState } from 'react'
import { Check, Copy, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChartSpec, DashboardSpec, Dataset } from '@/lib/types'
import { buildShareUrl, encodeSharePayload } from '@/lib/share-url'

interface ShareDialogProps {
  dashboard: DashboardSpec
  charts: ChartSpec[]
  dataset: Dataset
  onClose: () => void
}

export function ShareDialog({ dashboard, charts, dataset, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const encoded = encodeSharePayload(dashboard, charts)
  const url = buildShareUrl(encoded)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback for browsers without clipboard
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const sizeKb = (encoded.length / 1024).toFixed(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border bg-card shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Share2 className="h-3 w-3 text-primary" />
            Share dashboard
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This URL encodes the layout, tile config, and chart specs (≈ {sizeKb} KB). The recipient
            opens it, picks a local dataset whose column names match yours, and the dashboard
            rehydrates. <span className="font-medium text-foreground">No data leaves your browser.</span>
          </p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Shareable URL
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" variant="outline" onClick={() => void copy()}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3 text-xs">
            <div className="mb-2 font-medium text-foreground">What gets shared</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Dashboard layout ({dashboard.tiles.length} tile{dashboard.tiles.length === 1 ? '' : 's'})</li>
              <li>• {charts.length} chart spec{charts.length === 1 ? '' : 's'} — type, encodings, options</li>
              <li>• Column references by <span className="font-mono">name</span> (not by data)</li>
              <li className="text-muted-foreground/70">
                Recipient sees columns from <span className="font-medium text-foreground">{dataset.name}</span>{' '}
                but the dashboard works against any dataset with matching column names.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-card/40 px-5 py-3">
          <Button size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}
