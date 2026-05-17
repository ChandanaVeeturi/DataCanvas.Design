import { useState } from 'react'
import type { TextTileSpec } from '@/lib/types'
import { TileShell } from './TileShell'

interface TextTileRendererProps {
  tile: TextTileSpec
  onChange: (patch: Partial<TextTileSpec>) => void
  onDelete: () => void
}

export function TextTileRenderer({ tile, onChange, onDelete }: TextTileRendererProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tile.content)

  const isHeading = tile.content.startsWith('# ')
  const displayContent = isHeading ? tile.content.slice(2) : tile.content

  return (
    <TileShell title="Text" subtitle="markdown" onDelete={onDelete}>
      <div className="h-full p-3">
        {editing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              onChange({ content: draft })
              setEditing(false)
            }}
            placeholder='Notes… Start a line with "# " for a heading.'
            className="h-full w-full resize-none rounded border border-input bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(tile.content)
              setEditing(true)
            }}
            className="h-full w-full rounded text-left text-sm hover:bg-accent/5"
          >
            {displayContent ? (
              isHeading ? (
                <h3 className="text-lg font-semibold leading-tight">{displayContent}</h3>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{displayContent}</p>
              )
            ) : (
              <span className="text-muted-foreground italic">Click to add text…</span>
            )}
          </button>
        )}
      </div>
    </TileShell>
  )
}
