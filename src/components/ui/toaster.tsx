import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore, type ToastKind } from '@/stores/toast.store'
import { cn } from '@/lib/utils'

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const ACCENT: Record<ToastKind, string> = {
  success: 'text-emerald-500',
  error: 'text-destructive',
  info: 'text-primary',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.kind]
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-3 shadow-lg',
              'animate-fade-in',
            )}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', ACCENT[t.kind])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{t.message}</p>
              {t.description && (
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
