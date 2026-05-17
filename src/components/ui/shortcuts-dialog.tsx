import { useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShortcutsDialogProps {
  open: boolean
  onClose: () => void
}

interface ShortcutEntry {
  keys: string[]
  label: string
}

interface ShortcutGroup {
  title: string
  items: ShortcutEntry[]
}

const GROUPS: ShortcutGroup[] = [
  {
    title: 'Global',
    items: [
      { keys: ['⌘', 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show this cheat sheet' },
      { keys: ['Esc'], label: 'Close any dialog or palette' },
    ],
  },
  {
    title: 'Command palette',
    items: [
      { keys: ['↑', '↓'], label: 'Move selection' },
      { keys: ['↵'], label: 'Run highlighted command' },
    ],
  },
  {
    title: 'Data table',
    items: [
      { keys: ['Click header'], label: 'Sort column (asc → desc → none)' },
      { keys: ['Type in row 2'], label: 'Filter that column' },
    ],
  },
  {
    title: 'Dashboard editor',
    items: [
      { keys: ['Drag handle'], label: 'Move tile' },
      { keys: ['Drag corner'], label: 'Resize tile' },
      { keys: ['Click bar / slice'], label: 'Cross-filter the dashboard' },
    ],
  },
]

function isMac() {
  if (typeof navigator === 'undefined') return true
  return /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent)
}

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const mod = isMac() ? '⌘' : 'Ctrl'

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <header className="border-b px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Keyboard className="h-3 w-3 text-primary" />
            Keyboard shortcuts
          </div>
          <h3 className="mt-1 text-base font-semibold">Move faster</h3>
        </header>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </div>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{item.label}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={`${k}-${i}`}
                          className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {k === '⌘' ? mod : k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t bg-card/40 px-5 py-3">
          <Button size="sm" onClick={onClose}>Got it</Button>
        </footer>
      </div>
    </div>
  )
}
