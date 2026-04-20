import { X, Loader2, Bot } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { TurnGroup } from '@/components/conversation/turn-group'
import { formatTokenCount, formatDuration } from '@/lib/analytics'

export function SubagentPanel() {
  const {
    isSubagentOpen,
    subagentSession,
    subagentAnalytics,
    isLoadingSubagent,
    closeSubagent,
  } = useSessionStore()

  if (!isSubagentOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={closeSubagent}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-background border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <Bot className="w-4 h-4 text-tool-agent" />
          <h3 className="text-sm font-semibold flex-1">
            Subagent Conversation
          </h3>
          {subagentAnalytics && (
            <span className="text-xs text-muted-foreground">
              {subagentAnalytics.totalTurns} turns |{' '}
              {formatTokenCount(
                subagentAnalytics.totalTokens.input_tokens +
                  subagentAnalytics.totalTokens.output_tokens,
              )}{' '}
              tokens | {formatDuration(subagentAnalytics.totalDurationMs)}
            </span>
          )}
          <button
            onClick={closeSubagent}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLoadingSubagent ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : subagentSession ? (
          <div className="flex-1 overflow-y-auto">
            {subagentSession.turns.map((turn) => (
              <TurnGroup
                key={turn.id}
                turn={turn}
                isSelected={false}
                onSelect={() => {}}
              />
            ))}
            {subagentSession.turns.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No conversation turns found in this subagent
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
