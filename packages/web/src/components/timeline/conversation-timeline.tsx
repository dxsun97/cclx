import { useMemo } from 'react'
import { useSessionStore } from '@/store/session-store'
import { getToolColor, formatDuration } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function ConversationTimeline() {
  const { session, selectedTurnIndex, selectTurn, filterTool } =
    useSessionStore()

  const turns = useMemo(() => session?.turns ?? [], [session?.turns])
  const totalDuration = session
    ? session.endTime.getTime() - session.startTime.getTime()
    : 0

  const segments = useMemo(() => {
    if (!session || turns.length === 0 || totalDuration === 0) return []

    return turns.map((turn) => {
      const offset =
        ((turn.startTime.getTime() - session.startTime.getTime()) /
          totalDuration) *
        100
      const width = Math.max(
        ((turn.durationMs ??
          turn.endTime.getTime() - turn.startTime.getTime()) /
          totalDuration) *
          100,
        0.5,
      )

      const dominantTool =
        turn.toolCalls.length > 0
          ? turn.toolCalls.reduce(
              (acc, tc) => {
                const name = tc.toolUse.name
                acc[name] = (acc[name] ?? 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )
          : {}
      const topTool = Object.entries(dominantTool).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0]

      const isFiltered = filterTool
        ? turn.toolCalls.some((tc) => tc.toolUse.name === filterTool)
        : true

      return {
        turn,
        offset,
        width,
        color: topTool ? getToolColor(topTool) : '#6366f1',
        isFiltered,
      }
    })
  }, [session, turns, totalDuration, filterTool])

  const handleClick = (turnIndex: number) => {
    selectTurn(turnIndex)
    const scrollEl = document.getElementById('conversation-scroll') as
      | (HTMLDivElement & { scrollToTurn?: (idx: number) => void })
      | null
    scrollEl?.scrollToTurn?.(turnIndex)
  }

  return (
    <div
      className="relative h-3 bg-muted/30 rounded-full overflow-hidden flex-1 min-w-0"
      title={
        segments.length > 0
          ? `${turns.length} turns | ${formatDuration(totalDuration)}`
          : undefined
      }
    >
      {segments.map(({ turn, offset, width, color, isFiltered }) => (
        <button
          key={turn.id}
          onClick={(e) => {
            e.stopPropagation()
            handleClick(turn.index)
          }}
          className={cn(
            'absolute top-0 h-full rounded-sm transition-all duration-150 hover:brightness-125',
            selectedTurnIndex === turn.index && 'ring-1 ring-white/50',
            !isFiltered && 'opacity-20',
          )}
          style={{
            left: `${offset}%`,
            width: `${width}%`,
            backgroundColor: color,
            opacity: isFiltered ? 0.7 : 0.15,
          }}
          title={`Turn ${turn.index + 1}: ${formatDuration(turn.durationMs ?? 0)} | ${turn.toolCalls.length} tools`}
        />
      ))}
    </div>
  )
}
