import { useRef, useCallback, useEffect } from 'react'
import { useStickToBottom } from 'use-stick-to-bottom'
import { ArrowDown } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { TurnGroup } from './turn-group'

export function ConversationFlow() {
  const { session, selectedTurnIndex, selectTurn, filterTool, isStreaming } =
    useSessionStore()
  const legacyRef = useRef<HTMLDivElement>(null)

  const turns = session?.turns ?? []

  const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
    useStickToBottom({
      initial: isStreaming ? 'smooth' : false,
      resize: 'smooth',
    })
  const filteredTurns = filterTool
    ? turns.filter((t) =>
        t.toolCalls.some((tc) => tc.toolUse.name === filterTool),
      )
    : turns

  const scrollToTurn = useCallback(
    (index: number) => {
      const el = legacyRef.current?.querySelector(
        `[data-turn-index="${index}"]`,
      )
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      selectTurn(index)
    },
    [selectTurn],
  )

  // Expose scrollToTurn via ref for timeline
  useEffect(() => {
    if (legacyRef.current) {
      ;(
        legacyRef.current as HTMLDivElement & {
          scrollToTurn?: typeof scrollToTurn
        }
      ).scrollToTurn = scrollToTurn
    }
  }, [scrollToTurn])

  if (filteredTurns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        {filterTool
          ? `No turns with ${filterTool} tool calls`
          : 'No conversation data'}
      </div>
    )
  }

  return (
    <div
      ref={(el) => {
        scrollRef(el)
        ;(legacyRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el
      }}
      className="flex-1 overflow-auto relative"
      id="conversation-scroll"
    >
      <div ref={contentRef}>
        {filteredTurns.map((turn) => (
          <div key={turn.id} data-turn-index={turn.index}>
            <TurnGroup
              turn={turn}
              isSelected={selectedTurnIndex === turn.index}
              onSelect={() => selectTurn(turn.index)}
            />
          </div>
        ))}
      </div>
      {!isAtBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 border border-border shadow-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm"
        >
          <ArrowDown className="w-3 h-3" />
          Scroll to bottom
        </button>
      )}
    </div>
  )
}
