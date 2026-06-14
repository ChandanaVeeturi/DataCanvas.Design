import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string
  className?: string
  centered?: boolean
}

export function SectionHeader({ label, title, description, className, centered }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2', centered && 'items-center text-center', className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{label}</span>
      )}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-base max-w-2xl">{description}</p>
      )}
    </div>
  )
}
