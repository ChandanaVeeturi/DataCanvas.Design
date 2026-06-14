import type { Metadata } from 'next'
import { WizardFlow } from '@/components/wizard/wizard-flow'

export const metadata: Metadata = {
  title: 'Chart Finder — Find the Right Chart for Your Data',
  description: 'Answer 3 quick questions about your data and goal, and get instant chart recommendations with explanations. Free, no signup required.',
}

export default function WizardPage() {
  return (
    <div className="container py-12 flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Chart Finder</span>
        <h1 className="text-3xl font-bold tracking-tight">Find the right chart</h1>
        <p className="text-muted-foreground">Answer one question and get instant chart recommendations tailored to your goal.</p>
      </div>
      <WizardFlow />
    </div>
  )
}
