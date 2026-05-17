import { Link, NavLink } from 'react-router-dom'
import { BookOpen, Github, Search, Settings, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { usePaletteStore } from '@/stores/palette.store'
import { cn } from '@/lib/utils'

export function Header() {
  const openPalette = usePaletteStore((s) => s.toggle)

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">DataCanvas</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Browser studio
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <BookOpen className="h-3.5 w-3.5" />
            Chart library
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={openPalette}
          className="hidden h-8 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground sm:inline-flex"
          aria-label="Open command palette"
        >
          <Search className="h-3 w-3" />
          <span>Search…</span>
          <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </button>
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={({ isActive }) =>
            cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground',
              isActive && 'text-foreground',
            )
          }
        >
          <Settings className="h-4 w-4" />
        </NavLink>
        <a
          href="https://github.com/ChandanaVeeturi/DataCanvas.Design"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        >
          <Github className="h-4 w-4" />
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
