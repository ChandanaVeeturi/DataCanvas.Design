import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}

/**
 * Lightweight click-outside popover. Renders trigger inline; menu is positioned
 * below it. Closes on outside click or Escape.
 */
export function Popover({ trigger, children, align = 'start', className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)} className="inline-flex">
        {trigger}
      </span>
      {open && (
        <div
          className={cn(
            'absolute z-30 mt-1 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
            'animate-fade-in',
            className,
          )}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  children,
  onSelect,
  destructive,
  className,
}: {
  children: ReactNode
  onSelect: () => void
  destructive?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'hover:bg-accent/10 hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  )
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" />
}
