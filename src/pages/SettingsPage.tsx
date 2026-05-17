import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  AlertTriangle,
  Calendar,
  Hash,
  Keyboard,
  Monitor,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select } from '@/components/ui/select'
import { ShortcutsDialog } from '@/components/ui/shortcuts-dialog'
import { usePrefsStore } from '@/stores/prefs.store'
import { useDatasetsStore } from '@/stores/datasets.store'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'
import { clearAll } from '@/lib/idb'
import { toast } from '@/stores/toast.store'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const decimalPlaces = usePrefsStore((s) => s.decimalPlaces)
  const setDecimalPlaces = usePrefsStore((s) => s.setDecimalPlaces)
  const dateFormat = usePrefsStore((s) => s.dateFormat)
  const setDateFormat = usePrefsStore((s) => s.setDateFormat)

  const datasets = useDatasetsStore((s) => s.datasets)
  const charts = useChartsStore((s) => s.charts)
  const dashboards = useDashboardsStore((s) => s.dashboards)

  const [showShortcuts, setShowShortcuts] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleClearAll = async () => {
    await clearAll()
    // Hard reload so all in-memory state is wiped too.
    toast.success('Cleared local data', 'Reloading…')
    setTimeout(() => window.location.assign('/'), 800)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferences and storage controls. All settings live in this browser only.
        </p>
      </header>

      <SettingsSection icon={Palette} title="Appearance" description="Light or dark, your call.">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'system', label: 'System', Icon: Monitor },
              { value: 'light', label: 'Light', Icon: Sun },
              { value: 'dark', label: 'Dark', Icon: Moon },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors',
                theme === opt.value
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:bg-card hover:text-foreground',
              )}
            >
              <opt.Icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection icon={Hash} title="Number display" description="How numbers are formatted in stats panels and KPI tiles.">
        <FieldLabel htmlFor="decimals">Default decimal places</FieldLabel>
        <input
          id="decimals"
          type="range"
          min={0}
          max={6}
          value={decimalPlaces}
          onChange={(e) => setDecimalPlaces(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
          {decimalPlaces} {decimalPlaces === 1 ? 'digit' : 'digits'}
        </div>
      </SettingsSection>

      <SettingsSection icon={Calendar} title="Date format" description="How dates render in tables and tooltips.">
        <Select
          value={dateFormat}
          onChange={(v) => setDateFormat(v as typeof dateFormat)}
          options={[
            { value: 'iso', label: 'ISO 8601 (2024-03-15)' },
            { value: 'short', label: 'Short (3/15/2024)' },
            { value: 'long', label: 'Long (March 15, 2024)' },
          ]}
        />
      </SettingsSection>

      <SettingsSection icon={Keyboard} title="Keyboard" description="Move faster with shortcuts.">
        <Button variant="outline" size="sm" onClick={() => setShowShortcuts(true)}>
          <Keyboard className="h-3.5 w-3.5" />
          View all shortcuts
        </Button>
      </SettingsSection>

      <SettingsSection icon={Sparkles} title="Storage" description="Everything you've loaded lives in your browser.">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Datasets" value={datasets.length} />
          <Stat label="Charts" value={charts.length} />
          <Stat label="Dashboards" value={dashboards.length} />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Trash2}
        title="Danger zone"
        description="Permanent deletion. Can't be undone."
        destructive
      >
        {!confirming ? (
          <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear all local data
          </Button>
        ) : (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>
                This will delete <strong>{datasets.length}</strong> datasets,{' '}
                <strong>{charts.length}</strong> charts, and <strong>{dashboards.length}</strong>{' '}
                dashboards from this browser. There's no undo.
              </p>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={() => void handleClearAll()}>
                Yes, delete everything
              </Button>
            </div>
          </div>
        )}
      </SettingsSection>

      <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
  destructive?: boolean
}) {
  return (
    <section
      className={cn(
        'mb-6 rounded-lg border p-5',
        destructive ? 'border-destructive/30 bg-destructive/[0.02]' : 'bg-card/60',
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md',
            destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="ml-11">{children}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}
