import { useEffect } from 'react'
import { usePaletteStore } from '@/stores/palette.store'

interface UseGlobalShortcutsOpts {
  onShowShortcuts: () => void
}

/** Global app-level keyboard shortcuts. Mount once at the app root. */
export function useGlobalShortcuts({ onShowShortcuts }: UseGlobalShortcutsOpts) {
  const togglePalette = usePaletteStore((s) => s.toggle)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      // Cmd/Ctrl + K → command palette
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        togglePalette()
        return
      }
      // "?" → cheat sheet (only when not typing in an input)
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (!isTyping && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault()
        onShowShortcuts()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [togglePalette, onShowShortcuts])
}
