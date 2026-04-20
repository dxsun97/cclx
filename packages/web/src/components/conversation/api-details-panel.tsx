import { useState, forwardRef, useCallback } from 'react'
import { ArrowUp, ArrowDown, Zap, AlertCircle, Copy, Check } from 'lucide-react'
import type {
  Turn,
  AssistantMessage,
  ToolUseBlock,
  PairedToolCall,
} from '@/types/session'
import { formatTokenCount } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface FlowStep {
  type: 'request' | 'response' | 'tool'
  requestLabel?: string
  assistant?: AssistantMessage
  toolUseCount?: number
  hasText?: boolean
  toolCall?: PairedToolCall
}

function buildFlowSteps(turn: Turn): FlowStep[] {
  const steps: FlowStep[] = []
  const toolMap = new Map<string, PairedToolCall>()
  for (const tc of turn.toolCalls) {
    toolMap.set(tc.toolUse.id, tc)
  }

  steps.push({ type: 'request', requestLabel: 'User message' })

  for (let i = 0; i < turn.assistantMessages.length; i++) {
    const am = turn.assistantMessages[i]
    const toolUses = am.message.content.filter(
      (b) => b.type === 'tool_use',
    ) as ToolUseBlock[]
    const hasText = am.message.content.some(
      (b) => b.type === 'text' && b.text.trim(),
    )

    steps.push({
      type: 'response',
      assistant: am,
      toolUseCount: toolUses.length,
      hasText,
    })

    for (const tu of toolUses) {
      const paired = toolMap.get(tu.id)
      if (paired) {
        steps.push({ type: 'tool', toolCall: paired })
      }
    }

    if (toolUses.length > 0 && i < turn.assistantMessages.length - 1) {
      steps.push({
        type: 'request',
        requestLabel: `${toolUses.length} tool result${toolUses.length > 1 ? 's' : ''}`,
      })
    }
  }

  return steps
}

export const ExecutionFlowPopover = forwardRef<HTMLDivElement, { turn: Turn }>(
  function ExecutionFlowPopover({ turn }, ref) {
    const steps = buildFlowSteps(turn)
    const roundTrips = turn.assistantMessages.length
    const totalTools = turn.toolCalls.length

    return (
      <div
        ref={ref}
        className="absolute right-0 top-full mt-1 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="text-xs font-medium text-foreground">
            Execution Flow
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {roundTrips} round-trip{roundTrips > 1 ? 's' : ''} &middot;{' '}
            {totalTools} tool{totalTools !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="p-3 space-y-0">
          {steps.map((step, i) => (
            <FlowStepRow key={i} step={step} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    )
  },
)

function FlowStepRow({ step, isLast }: { step: FlowStep; isLast: boolean }) {
  const [showDetail, setShowDetail] = useState(false)

  if (step.type === 'request') {
    return (
      <div className="flex items-stretch gap-0">
        <div className="flex flex-col items-center w-5 shrink-0">
          <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center">
            <ArrowUp className="w-2.5 h-2.5 text-blue-400" />
          </div>
          {!isLast && <div className="w-px flex-1 bg-border/60" />}
        </div>
        <div className="ml-2 pb-2 min-w-0">
          <div className="text-[11px] text-blue-400 font-medium">Request</div>
          <div className="text-[10px] text-muted-foreground">
            {step.requestLabel}
          </div>
        </div>
      </div>
    )
  }

  if (step.type === 'response') {
    const am = step.assistant!
    const m = am.message
    const u = m.usage
    return (
      <div className="flex items-stretch gap-0">
        <div className="flex flex-col items-center w-5 shrink-0">
          <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
            <ArrowDown className="w-2.5 h-2.5 text-green-400" />
          </div>
          {!isLast && <div className="w-px flex-1 bg-border/60" />}
        </div>
        <div className="ml-2 pb-2 min-w-0 flex-1">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-left w-full"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-green-400 font-medium">
                Response
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {m.model}
              </span>
              <span
                className={cn(
                  'text-[10px] px-1 py-px rounded font-medium',
                  m.stop_reason === 'end_turn'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-amber-500/10 text-amber-400',
                )}
              >
                {m.stop_reason}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
              <span>in: {formatTokenCount(u.input_tokens)}</span>
              <span>out: {formatTokenCount(u.output_tokens)}</span>
              {(u.cache_read_input_tokens ?? 0) > 0 && (
                <span>
                  cached: {formatTokenCount(u.cache_read_input_tokens!)}
                </span>
              )}
              {step.hasText && (
                <span className="text-foreground/50">+ text</span>
              )}
              {(step.toolUseCount ?? 0) > 0 && (
                <span className="text-foreground/50">
                  + {step.toolUseCount} tool{step.toolUseCount! > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </button>
          {showDetail && (
            <div className="relative mt-1 group/detail">
              <CopyButton text={JSON.stringify(am.message, null, 2)} />
              <pre className="text-[10px] bg-muted/50 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-foreground">
                {JSON.stringify(am.message, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  const tc = step.toolCall!
  return (
    <div className="flex items-stretch gap-0">
      <div className="flex flex-col items-center w-5 shrink-0">
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center',
            tc.isError ? 'bg-red-500/15' : 'bg-amber-500/10',
          )}
        >
          {tc.isError ? (
            <AlertCircle className="w-2.5 h-2.5 text-red-400" />
          ) : (
            <Zap className="w-2.5 h-2.5 text-amber-400" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/60" />}
      </div>
      <div className="ml-2 pb-2 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[11px] font-medium',
              tc.isError ? 'text-red-400' : 'text-amber-400',
            )}
          >
            {tc.toolUse.name}
          </span>
          {tc.durationMs != null && (
            <span className="text-[10px] text-muted-foreground">
              {tc.durationMs < 1000
                ? `${tc.durationMs}ms`
                : `${(tc.durationMs / 1000).toFixed(1)}s`}
            </span>
          )}
          {tc.isError && (
            <span className="text-[10px] text-red-400">error</span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
          {getToolOneLiner(tc)}
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="absolute top-1.5 right-1.5 p-1 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/detail:opacity-100"
      title="Copy JSON"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  )
}

function getToolOneLiner(tc: PairedToolCall): string {
  const input = tc.toolUse.input
  switch (tc.toolUse.name) {
    case 'Bash':
      return (input.command as string)?.slice(0, 100) ?? ''
    case 'Read':
      return (input.file_path as string) ?? ''
    case 'Write':
      return (input.file_path as string) ?? ''
    case 'Edit':
      return (input.file_path as string) ?? ''
    case 'Glob':
      return (input.pattern as string) ?? ''
    case 'Grep':
      return (input.pattern as string) ?? ''
    case 'WebSearch':
      return (input.query as string)?.slice(0, 80) ?? ''
    case 'Agent':
      return (input.description as string) ?? ''
    default:
      return JSON.stringify(input).slice(0, 80)
  }
}
