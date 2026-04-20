// Raw JSONL message types from Claude Code session files

export interface BaseMessage {
  uuid: string
  parentUuid: string | null
  isSidechain: boolean
  userType: 'external' | 'internal'
  cwd: string
  sessionId: string
  version: string
  gitBranch: string
  slug?: string
  timestamp: string
  isMeta?: boolean
  origin?: { kind: string }
}

// --- Content blocks ---

export interface TextBlock {
  type: 'text'
  text: string
}

export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string | Array<{ type: string; text?: string; source?: unknown }>
  is_error?: boolean
}

export interface ThinkingBlock {
  type: 'thinking'
  thinking: string
  signature?: string
}

export type ContentBlock =
  | TextBlock
  | ToolUseBlock
  | ToolResultBlock
  | ThinkingBlock

// --- Token usage ---

export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
  server_tool_use?: {
    web_search_requests?: number
    web_fetch_requests?: number
  }
  service_tier?: string
}

// --- Tool use result metadata ---

export interface ToolUseResultMeta {
  durationMs?: number
  filenames?: string[]
  numFiles?: number
  truncated?: boolean
}

// --- Message types ---

export interface UserTextMessage extends BaseMessage {
  type: 'user'
  message: {
    role: 'user'
    content: string
  }
}

export interface UserToolResultMessage extends BaseMessage {
  type: 'user'
  message: {
    role: 'user'
    content: ToolResultBlock[]
  }
  toolUseResult?: ToolUseResultMeta
  sourceToolAssistantUUID?: string
}

export type UserMessage = UserTextMessage | UserToolResultMessage

export interface AssistantMessage extends BaseMessage {
  type: 'assistant'
  message: {
    id: string
    type: 'message'
    role: 'assistant'
    content: ContentBlock[]
    model: string
    usage: TokenUsage
    stop_reason: string
  }
}

export interface SystemMessage extends BaseMessage {
  type: 'system'
  subtype:
    | 'turn_duration'
    | 'local_command'
    | 'api_error'
    | 'compact_boundary'
    | 'microcompact_boundary'
  content?: string
  durationMs?: number
  level?: string
}

export interface ProgressMessage extends BaseMessage {
  type: 'progress'
  data: {
    type: string
    [key: string]: unknown
  }
}

export interface FileHistorySnapshot {
  type: 'file-history-snapshot'
  messageId: string
  snapshot: {
    messageId: string
    trackedFileBackups: Record<string, unknown>
    timestamp: string
  }
  isSnapshotUpdate: boolean
}

export interface QueueOperation {
  type: 'queue-operation'
  [key: string]: unknown
}

export type RawMessage =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | ProgressMessage
  | FileHistorySnapshot
  | QueueOperation

// --- Processed types for the UI ---

export interface PairedToolCall {
  toolUse: ToolUseBlock
  toolResult: ToolResultBlock | null
  resultMeta: ToolUseResultMeta | null
  isError: boolean
  durationMs: number | null
}

export interface Turn {
  id: string
  index: number
  userMessage: UserTextMessage
  assistantMessages: AssistantMessage[]
  toolCalls: PairedToolCall[]
  systemMessages: SystemMessage[]
  startTime: Date
  endTime: Date
  durationMs: number | null
  totalTokens: TokenUsage
}

export interface SessionData {
  sessionId: string
  projectPath: string
  gitBranch: string
  version: string
  permissionMode?: string
  turns: Turn[]
  totalTokens: TokenUsage
  startTime: Date
  endTime: Date
}

export interface ToolStats {
  name: string
  count: number
  errors: number
  totalDurationMs: number
}

export interface SessionAnalytics {
  totalTurns: number
  totalMessages: number
  totalTokens: TokenUsage
  toolStats: ToolStats[]
  tokensPerTurn: {
    turnIndex: number
    input: number
    output: number
    cached: number
  }[]
  totalDurationMs: number
}
