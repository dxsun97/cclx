import { useEffect } from 'react'
import { useSessionStore } from '@/store/session-store'

export function useKeyboardNav() {
  const { session, selectedTurnIndex, selectTurn } = useSessionStore()

  useEffect(() => {
    if (!session) return

    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      const maxIndex = session.turns.length - 1
      const current = selectedTurnIndex ?? -1

      switch (e.key) {
        case 'j':
        case 'ArrowDown': {
          e.preventDefault()
          const next = Math.min(current + 1, maxIndex)
          selectTurn(next)
          scrollToTurnElement(next)
          break
        }
        case 'k':
        case 'ArrowUp': {
          e.preventDefault()
          const prev = Math.max(current - 1, 0)
          selectTurn(prev)
          scrollToTurnElement(prev)
          break
        }
        case 'Escape': {
          selectTurn(null)
          break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [session, selectedTurnIndex, selectTurn])
}

function scrollToTurnElement(index: number) {
  const scrollEl = document.getElementById('conversation-scroll') as
    | (HTMLDivElement & { scrollToTurn?: (idx: number) => void })
    | null
  scrollEl?.scrollToTurn?.(index)
}
