import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground border-border',
  outline: 'bg-transparent border-border text-foreground',
  success: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
