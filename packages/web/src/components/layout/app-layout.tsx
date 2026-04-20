import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Radio } from 'lucide-react'
import { SearchBar } from '@/components/conversation/search-bar'
import { ConversationTimeline } from '@/components/timeline/conversation-timeline'
import { useSessionStore } from '@/store/session-store'
import { useKeyboardNav } from '@/hooks/use-keyboard-nav'

interface AppLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  isStreaming?: boolean
  isSessionLive?: boolean
}

export function AppLayout({
  sidebar,
  main,
  isStreaming,
  isSessionLive,
}: AppLayoutProps) {
  useKeyboardNav()
  const filterTool = useSessionStore((s) => s.filterTool)
  const setFilterTool = useSessionStore((s) => s.setFilterTool)

  return (
    <div className="h-full flex overflow-hidden">
      <aside className="hidden md:block w-72 shrink-0 border-r border-border overflow-y-auto bg-card/50">
        {sidebar}
      </aside>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Unified top bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 border-b border-border bg-card/30 shrink-0">
          <Link
            to="/sessions"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sessions</span>
          </Link>

          {filterTool && (
            <span className="flex items-center gap-1 bg-accent px-1.5 py-0.5 rounded text-[10px] text-muted-foreground shrink-0 animate-fade-in">
              <span className="font-medium text-foreground">{filterTool}</span>
              <button
                onClick={() => setFilterTool(null)}
                className="hover:text-foreground ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          <ConversationTimeline />

          {isStreaming && (
            <div className="flex items-center gap-1 shrink-0 animate-fade-in">
              {isSessionLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-medium text-green-500">
                    LIVE
                  </span>
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    CONNECTED
                  </span>
                </>
              )}
            </div>
          )}

          <SearchBar />
        </div>
        <main className="flex-1 overflow-hidden flex flex-col">{main}</main>
      </div>
    </div>
  )
}
