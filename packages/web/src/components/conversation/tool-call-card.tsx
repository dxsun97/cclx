import { useState } from 'react'
import {
  Terminal,
  FileText,
  Search,
  Pencil,
  Globe,
  Bot,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Clock,
  Check,
  ExternalLink,
} from 'lucide-react'
import type { PairedToolCall } from '@/types/session'
import { useSessionStore } from '@/store/session-store'
import { getToolColor } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/ui/copy-button'

interface ToolCallCardProps {
  toolCall: PairedToolCall
}

const toolIcons: Record<string, typeof Terminal> = {
  Bash: Terminal,
  Read: FileText,
  Glob: Search,
  Grep: Search,
  Write: Pencil,
  Edit: Pencil,
  NotebookEdit: Pencil,
  WebSearch: Globe,
  WebFetch: Globe,
  Agent: Bot,
  Skill: Bot,
}

function getToolSummary(toolCall: PairedToolCall): string {
  const input = toolCall.toolUse.input
  switch (toolCall.toolUse.name) {
    case 'Bash':
      return (input.command as string)?.slice(0, 120) ?? ''
    case 'Read':
      return (input.file_path as string)?.split('/').pop() ?? ''
    case 'Write':
      return (input.file_path as string)?.split('/').pop() ?? ''
    case 'Edit':
      return (input.file_path as string)?.split('/').pop() ?? ''
    case 'Glob':
      return (input.pattern as string) ?? ''
    case 'Grep':
      return (input.pattern as string) ?? ''
    case 'WebSearch':
      return (input.query as string)?.slice(0, 80) ?? ''
    case 'Agent':
      return (
        (input.description as string) ??
        (input.prompt as string)?.slice(0, 80) ??
        ''
      )
    default:
      return JSON.stringify(input).slice(0, 80)
  }
}

function formatResultContent(toolCall: PairedToolCall): string {
  if (!toolCall.toolResult) return 'No result'
  const content = toolCall.toolResult.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((b) => {
        if (typeof b === 'string') return b
        if (b.type === 'text' && b.text) return b.text
        return JSON.stringify(b)
      })
      .join('\n')
  }
  return JSON.stringify(content)
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { subagents, loadSubagent } = useSessionStore()
  const Icon = toolIcons[toolCall.toolUse.name] ?? Terminal
  const color = getToolColor(toolCall.toolUse.name)

  // Match Agent tool calls to available subagent files
  const isAgentTool = toolCall.toolUse.name === 'Agent'
  const matchedSubagent = isAgentTool
    ? subagents.find((s) =>
        s.id.includes(toolCall.toolUse.id.replace('fc-', '').slice(0, 12)),
      )
    : undefined
  const summary = getToolSummary(toolCall)
  const resultContent = formatResultContent(toolCall)

  return (
    <div className="ml-10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full text-left rounded-lg border transition-colors',
          toolCall.isError
            ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
            : 'border-border bg-card/50 hover:bg-card',
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-1.5 shrink-0">
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
            <Icon className="w-3.5 h-3.5" style={{ color }} />
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ color, backgroundColor: `${color}15` }}
            >
              {toolCall.toolUse.name}
            </span>
          </div>

          <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
            {summary}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {toolCall.durationMs !== null && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {toolCall.durationMs < 1000
                  ? `${toolCall.durationMs}ms`
                  : `${(toolCall.durationMs / 1000).toFixed(1)}s`}
              </span>
            )}
            {toolCall.isError ? (
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            ) : toolCall.toolResult ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : null}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="ml-4 mt-1 border-l-2 border-border pl-3 space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Input
            </div>
            <div className="relative group">
              <CopyButton
                text={JSON.stringify(toolCall.toolUse.input, null, 2)}
                className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-scroll max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                {JSON.stringify(toolCall.toolUse.input, null, 2)}
              </pre>
            </div>
          </div>
          {toolCall.toolResult && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Result{' '}
                {toolCall.isError && (
                  <span className="text-destructive">(Error)</span>
                )}
              </div>
              <div className="relative group">
                <CopyButton
                  text={resultContent.slice(0, 5000)}
                  className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <pre
                  className={cn(
                    'text-xs rounded p-2 overflow-x-scroll max-h-64 overflow-y-auto whitespace-pre-wrap break-words',
                    toolCall.isError ? 'bg-red-500/10' : 'bg-muted/50',
                  )}
                >
                  {resultContent.slice(0, 5000)}
                  {resultContent.length > 5000 && '\n... (truncated)'}
                </pre>
              </div>
            </div>
          )}
          {isAgentTool && matchedSubagent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                loadSubagent(matchedSubagent.id)
              }}
              className="flex items-center gap-1.5 text-xs text-tool-agent hover:text-tool-agent/80 transition-colors py-1"
            >
              <ExternalLink className="w-3 h-3" />
              View subagent conversation
            </button>
          )}
        </div>
      )}
    </div>
  )
}
