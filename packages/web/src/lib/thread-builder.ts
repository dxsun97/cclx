import type {
  RawMessage,
  UserTextMessage,
  UserToolResultMessage,
  AssistantMessage,
  SystemMessage,
  Turn,
  PairedToolCall,
  ToolUseBlock,
  ToolResultBlock,
  TokenUsage,
  SessionData,
} from '@/types/session'

function isUserTextMessage(msg: RawMessage): msg is UserTextMessage {
  return (
    msg.type === 'user' &&
    'message' in msg &&
    typeof (msg as UserTextMessage).message?.content === 'string'
  )
}

function isUserToolResultMessage(
  msg: RawMessage,
): msg is UserToolResultMessage {
  return (
    msg.type === 'user' &&
    'message' in msg &&
    Array.isArray((msg as UserToolResultMessage).message?.content)
  )
}

function isAssistantMessage(msg: RawMessage): msg is AssistantMessage {
  return msg.type === 'assistant'
}

function isSystemMessage(msg: RawMessage): msg is SystemMessage {
  return msg.type === 'system'
}

function emptyUsage(): TokenUsage {
  return {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  }
}

function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens:
      (a.cache_creation_input_tokens ?? 0) +
      (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens:
      (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  }
}

function pairToolCalls(
  assistantMessages: AssistantMessage[],
  toolResultMessages: UserToolResultMessage[],
): PairedToolCall[] {
  // Collect all tool_use blocks from assistant messages
  const toolUses: ToolUseBlock[] = []
  for (const msg of assistantMessages) {
    for (const block of msg.message.content) {
      if (block.type === 'tool_use') {
        toolUses.push(block)
      }
    }
  }

  // Collect all tool_result blocks from user messages
  const resultMap = new Map<
    string,
    { result: ToolResultBlock; meta: UserToolResultMessage }
  >()
  for (const msg of toolResultMessages) {
    for (const block of msg.message.content) {
      if (block.type === 'tool_result') {
        resultMap.set(block.tool_use_id, { result: block, meta: msg })
      }
    }
  }

  return toolUses.map((toolUse) => {
    const paired = resultMap.get(toolUse.id)
    return {
      toolUse,
      toolResult: paired?.result ?? null,
      resultMeta: paired?.meta?.toolUseResult ?? null,
      isError: paired?.result?.is_error ?? false,
      durationMs: paired?.meta?.toolUseResult?.durationMs ?? null,
    }
  })
}

export function buildSession(messages: RawMessage[]): SessionData {
  // Filter to main chain (not sidechain), exclude noise types
  const relevant = messages.filter(
    (m) =>
      m.type !== 'file-history-snapshot' &&
      m.type !== 'queue-operation' &&
      m.type !== 'progress' &&
      !('isSidechain' in m && m.isSidechain),
  )

  const turns: Turn[] = []
  let currentUserMsg: UserTextMessage | null = null
  let currentAssistant: AssistantMessage[] = []
  let currentToolResults: UserToolResultMessage[] = []
  let currentSystem: SystemMessage[] = []

  function flushTurn() {
    if (!currentUserMsg) return
    const toolCalls = pairToolCalls(currentAssistant, currentToolResults)
    const totalTokens = currentAssistant.reduce(
      (acc, m) => addUsage(acc, m.message.usage),
      emptyUsage(),
    )
    const allTimestamps = [
      currentUserMsg,
      ...currentAssistant,
      ...currentToolResults,
      ...currentSystem,
    ].map((m) => new Date(m.timestamp).getTime())

    const startTime = new Date(Math.min(...allTimestamps))
    const endTime = new Date(Math.max(...allTimestamps))
    const durationSystem = currentSystem.find(
      (s) => s.subtype === 'turn_duration',
    )

    turns.push({
      id: currentUserMsg.uuid,
      index: turns.length,
      userMessage: currentUserMsg,
      assistantMessages: currentAssistant,
      toolCalls,
      systemMessages: currentSystem,
      startTime,
      endTime,
      durationMs:
        durationSystem?.durationMs ?? endTime.getTime() - startTime.getTime(),
      totalTokens,
    })
  }

  for (const msg of relevant) {
    if (isUserTextMessage(msg) && !msg.isMeta) {
      flushTurn()
      currentUserMsg = msg
      currentAssistant = []
      currentToolResults = []
      currentSystem = []
    } else if (isAssistantMessage(msg)) {
      currentAssistant.push(msg)
    } else if (isUserToolResultMessage(msg)) {
      currentToolResults.push(msg)
    } else if (isSystemMessage(msg)) {
      currentSystem.push(msg)
    }
  }
  flushTurn()

  const totalTokens = turns.reduce(
    (acc, t) => addUsage(acc, t.totalTokens),
    emptyUsage(),
  )

  // Extract session metadata from first relevant message with these fields
  const firstMsg = relevant.find((m) => 'sessionId' in m && m.sessionId) as
    | (RawMessage & {
        sessionId: string
        cwd: string
        gitBranch: string
        version: string
      })
    | undefined

  // Extract permission mode from all messages (not just relevant)
  const permModeMsg = messages.find(
    (m) => (m.type as string) === 'permission-mode',
  ) as (RawMessage & { permissionMode: string }) | undefined

  return {
    sessionId: firstMsg?.sessionId ?? 'unknown',
    projectPath: firstMsg?.cwd ?? 'unknown',
    gitBranch: firstMsg?.gitBranch ?? 'unknown',
    version: firstMsg?.version ?? 'unknown',
    permissionMode: permModeMsg?.permissionMode,
    turns,
    totalTokens,
    startTime: turns.length > 0 ? turns[0].startTime : new Date(),
    endTime: turns.length > 0 ? turns[turns.length - 1].endTime : new Date(),
  }
}
