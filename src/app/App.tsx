import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'
import { ImportListener } from './ImportListener'
import { LandingPage } from '@/pages/LandingPage'
import { Toaster } from '@/components/ui/toaster'
import { CommandPalette } from '@/components/ui/command-palette'
import { ShortcutsDialog } from '@/components/ui/shortcuts-dialog'
import { useGlobalShortcuts } from '@/lib/use-global-shortcuts'
import { useDatasetsStore } from '@/stores/datasets.store'
import { useChartsStore } from '@/stores/charts.store'
import { useDashboardsStore } from '@/stores/dashboards.store'

const WorkspacePage = lazy(() =>
  import('@/pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage })),
)

const GalleryPage = lazy(() =>
  import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })),
)

const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  )
}

export function App() {
  const hydrateDatasets = useDatasetsStore((s) => s.hydrate)
  const hydrateCharts = useChartsStore((s) => s.hydrate)
  const hydrateDashboards = useDashboardsStore((s) => s.hydrate)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    hydrateDatasets()
    hydrateCharts()
    hydrateDashboards()
  }, [hydrateDatasets, hydrateCharts, hydrateDashboards])

  useGlobalShortcuts({ onShowShortcuts: () => setShowShortcuts(true) })

  return (
    <AppShell>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/workspace/:datasetId" element={<WorkspacePage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <ImportListener />
      <CommandPalette />
      <ShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <Toaster />
    </AppShell>
  )
}
