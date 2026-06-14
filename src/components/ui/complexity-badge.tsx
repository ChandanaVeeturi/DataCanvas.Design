import { Badge } from './badge'

const map = {
  beginner: { label: 'Beginner', variant: 'success' as const },
  intermediate: { label: 'Intermediate', variant: 'warning' as const },
  advanced: { label: 'Advanced', variant: 'destructive' as const },
}

export function ComplexityBadge({ complexity }: { complexity: 'beginner' | 'intermediate' | 'advanced' }) {
  const { label, variant } = map[complexity]
  return <Badge variant={variant}>{label}</Badge>
}
