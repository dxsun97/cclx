import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const { session, selectTurn } = useSessionStore()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const results = useMemo(() => {
    if (!session || query.length < 2) return []
    const q = query.toLowerCase()
    return session.turns
      .filter((turn) => {
        // Search user message
        const userText = turn.userMessage.message.content.toLowerCase()
        if (userText.includes(q)) return true
        // Search assistant text
        for (const msg of turn.assistantMessages) {
          for (const block of msg.message.content) {
            if (block.type === 'text' && block.text.toLowerCase().includes(q))
              return true
          }
        }
        // Search tool names and inputs
        for (const tc of turn.toolCalls) {
          if (tc.toolUse.name.toLowerCase().includes(q)) return true
          if (JSON.stringify(tc.toolUse.input).toLowerCase().includes(q))
            return true
        }
        return false
      })
      .slice(0, 20)
  }, [session, query])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-accent transition-colors"
        title="Search (Ctrl+F)"
      >
        <Search className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-lg shadow-xl z-20">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in session..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {query.length >= 2 && (
            <div className="max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                  No results
                </div>
              ) : (
                results.map((turn) => (
                  <button
                    key={turn.id}
                    onClick={() => {
                      selectTurn(turn.index)
                      const scrollEl = document.getElementById(
                        'conversation-scroll',
                      ) as
                        | (HTMLDivElement & {
                            scrollToTurn?: (idx: number) => void
                          })
                        | null
                      scrollEl?.scrollToTurn?.(turn.index)
                      setIsOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors border-b border-border/50 last:border-b-0',
                    )}
                  >
                    <span className="text-muted-foreground">
                      Turn {turn.index + 1}:
                    </span>{' '}
                    <span className="truncate">
                      {turn.userMessage.message.content.slice(0, 80)}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
