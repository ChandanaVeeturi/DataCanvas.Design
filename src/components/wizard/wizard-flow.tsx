'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { LucideProps } from 'lucide-react'
import {
  BarChart2, TrendingUp, Activity, GitBranch, PieChart,
  ArrowRight as ArrowRightIcon, Network, ArrowRight, RotateCcw, ExternalLink
} from 'lucide-react'
import { WIZARD_GOALS, getRecommendations } from '@/data/wizard'
import type { WizardGoal, ChartRecommendation } from '@/data/wizard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CHARTS } from '@/data/charts'

const GOAL_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  compare: BarChart2,
  trend: TrendingUp,
  distribution: Activity,
  relationship: GitBranch,
  composition: PieChart,
  flow: ArrowRightIcon,
  hierarchy: Network,
}

const GOAL_COLORS: Record<string, string> = {
  compare: 'hsl(239, 84%, 60%)',
  trend: 'hsl(188, 95%, 43%)',
  distribution: 'hsl(262, 83%, 58%)',
  relationship: 'hsl(142, 71%, 45%)',
  composition: 'hsl(25, 95%, 53%)',
  flow: 'hsl(340, 82%, 52%)',
  hierarchy: 'hsl(43, 96%, 56%)',
}

export function WizardFlow() {
  const [selectedGoal, setSelectedGoal] = useState<WizardGoal | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleGoalSelect = (goal: WizardGoal) => {
    setSelectedGoal(goal)
    setShowResults(true)
  }

  const handleReset = () => {
    setSelectedGoal(null)
    setShowResults(false)
  }

  if (showResults && selectedGoal) {
    const recommendations = getRecommendations({ goal: selectedGoal, dataSize: null, timePoints: null, audience: null })
    return <WizardResults goal={selectedGoal} recommendations={recommendations} onReset={handleReset} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-1">What are you trying to show?</h2>
        <p className="text-sm text-muted-foreground mb-6">Choose the goal that best describes your data story.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WIZARD_GOALS.map((goal) => {
            const Icon = GOAL_ICONS[goal.id]
            const color = GOAL_COLORS[goal.id]
            return (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal.id as WizardGoal)}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-5 text-center hover:border-primary hover:bg-primary/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${color}18` }}>
                  {Icon && <Icon className="h-6 w-6 transition-colors" style={{ color }} />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{goal.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Not sure? <Link href="/charts" className="text-primary hover:underline">Browse all 30+ chart types</Link>
      </p>
    </div>
  )
}

function WizardResults({ goal, recommendations, onReset }: {
  goal: WizardGoal
  recommendations: ChartRecommendation[]
  onReset: () => void
}) {
  const goalDef = WIZARD_GOALS.find(g => g.id === goal)
  const color = GOAL_COLORS[goal]

  return (
    <div className="flex flex-col gap-6">
      {/* Goal summary */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Your goal</p>
          <p className="font-semibold">{goalDef?.label}</p>
          <p className="text-sm text-muted-foreground">{goalDef?.description}</p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recommended charts for you</h2>
        <div className="flex flex-col gap-3">
          {recommendations.map((rec, i) => {
            const chart = CHARTS.find(c => c.id === rec.chartId)
            return (
              <Card key={rec.chartId} className={`hover:border-primary/50 transition-all ${i === 0 ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  {/* Score ring */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold border-2"
                      style={{ borderColor: color, color, backgroundColor: `${color}12` }}
                    >
                      {rec.score}
                    </div>
                    {i === 0 && <span className="text-xs font-medium text-primary">Best</span>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{rec.chartName}</h3>
                      {chart && (
                        <Badge variant={chart.complexity === 'beginner' ? 'success' : chart.complexity === 'intermediate' ? 'warning' : 'destructive'}>
                          {chart.complexity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                    <div className="flex gap-2">
                      <Link
                        href={`/charts/${rec.category}/${rec.chartId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View guide <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/playground?chart=${rec.chartId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Try in playground
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Want to compare all options?{' '}
        <Link href={`/charts/${goal === 'compare' ? 'comparison' : goal === 'trend' ? 'trends' : goal}`} className="text-primary hover:underline">
          Browse all {goalDef?.label.toLowerCase()} charts
        </Link>
      </p>
    </div>
  )
}
