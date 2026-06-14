import type { Metadata } from 'next'
import { PlaygroundClient } from '@/components/playground/playground-client'

export const metadata: Metadata = {
  title: 'Chart Playground — Experiment with Data Visualizations',
  description: 'Switch between 15+ chart types, edit your data, and instantly see chart updates. Compare visualizations side by side.',
}

export default function PlaygroundPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-base font-semibold">Playground</h1>
          <p className="text-xs text-muted-foreground">Switch chart types · Edit data · See changes instantly</p>
        </div>
      </div>
      <PlaygroundClient />
    </div>
  )
}
