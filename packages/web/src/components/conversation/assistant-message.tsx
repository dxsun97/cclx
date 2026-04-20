import { useState } from 'react'
import { Bot, Brain, ChevronRight, ChevronDown } from 'lucide-react'
import type { AssistantMessage } from '@/types/session'
import Markdown from 'react-markdown'
import { CopyButton } from '@/components/ui/copy-button'

interface AssistantMessageProps {
  message: AssistantMessage
}

function ThinkingSection({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full text-left mb-2 rounded-md bg-muted/30 border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors">
      <div
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <Brain className="w-3 h-3" />
        <span>Thinking</span>
        {!expanded && (
          <span className="truncate opacity-60 ml-1">{text.slice(0, 80)}</span>
        )}
      </div>
      {expanded && (
        <pre
          onClick={(e) => e.stopPropagation()}
          className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-relaxed max-h-64 overflow-y-auto select-text"
        >
          {text}
        </pre>
      )}
    </div>
  )
}

export function AssistantMessageBubble({ message }: AssistantMessageProps) {
  const textBlocks = message.message.content.filter((b) => b.type === 'text')
  const thinkingBlocks = message.message.content.filter(
    (b) => b.type === 'thinking',
  )
  const hasText = textBlocks.some((b) => b.type === 'text' && b.text.trim())
  const hasThinking = thinkingBlocks.some(
    (b) => b.type === 'thinking' && b.thinking.trim(),
  )

  if (!hasText && !hasThinking) return null

  const text = textBlocks
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('\n')

  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
          Claude
          {message.message.model && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
              {message.message.model}
            </span>
          )}
        </div>
        {hasThinking &&
          thinkingBlocks.map((b, i) =>
            b.type === 'thinking' && b.thinking.trim() ? (
              <ThinkingSection key={i} text={b.thinking} />
            ) : null,
          )}
        {hasText && (
          <div className="overflow-hidden bg-card border border-border rounded-lg rounded-tl-sm px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_pre]:overflow-x-scroll [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
            <Markdown
              components={{
                pre({ children }) {
                  const code = (() => {
                    if (!children || typeof children !== 'object') return ''
                    const child = Array.isArray(children)
                      ? children[0]
                      : children
                    if (
                      child &&
                      typeof child === 'object' &&
                      'props' in child
                    ) {
                      return String(child.props.children ?? '')
                    }
                    return ''
                  })()
                  return (
                    <div className="relative group">
                      <CopyButton
                        text={code}
                        className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <pre>{children}</pre>
                    </div>
                  )
                },
              }}
            >
              {text}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  )
}
