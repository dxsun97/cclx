import type { RawMessage } from './types/session.js'

export function parseJsonl(text: string): RawMessage[] {
  const messages: RawMessage[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        messages.push(parsed as RawMessage)
      }
    } catch {
      // Skip malformed lines
    }
  }

  return messages
}
