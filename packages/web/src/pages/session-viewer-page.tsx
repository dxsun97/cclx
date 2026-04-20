import { useEffect } from 'react'
import { useParams } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { AppLayout } from '@/components/layout/app-layout'
import { SessionInfo } from '@/components/analytics/session-info'
import { TokenSummary } from '@/components/analytics/token-summary'
import { ToolAnalytics } from '@/components/analytics/tool-analytics'
import { ConversationFlow } from '@/components/conversation/conversation-flow'
import { SubagentPanel } from '@/components/subagent/subagent-panel'

function getNavContext() {
  // 1. Check Zustand store (set before in-app navigation)
  const store = useSessionStore.getState()
  if (store.pendingSourceDir != null) {
    return {
      sourceDir: store.pendingSourceDir,
      projectPath: store.pendingProjectPath ?? '',
      modified: store.pendingModified ?? '',
    }
  }
  // 2. Check sessionStorage (survives refresh)
  try {
    const raw = sessionStorage.getItem('cf-nav')
    if (raw)
      return JSON.parse(raw) as {
        sourceDir: string
        projectPath: string
        modified?: string
      }
  } catch {
    /* sessionStorage unavailable */
  }
  // 3. Empty — server will search all sources
  return { sourceDir: '', projectPath: '', modified: '' }
}

function isRecentlyModified(modified: string | undefined): boolean {
  if (!modified) return false
  const diff = Date.now() - new Date(modified).getTime()
  return diff < 5 * 60 * 1000 // 5 minutes
}

export function SessionViewerPage() {
  const { projectDir, sessionId } = useParams<{
    projectDir: string
    sessionId: string
  }>()
  const { session, error, isStreaming, isSessionLive } = useSessionStore()

  useEffect(() => {
    if (!projectDir || !sessionId) return
    const { sourceDir, projectPath, modified } = getNavContext()
    const store = useSessionStore.getState()

    if (isRecentlyModified(modified)) {
      // We know from the session list it's recent — stream directly
      store.streamSession(
        projectDir,
        sessionId,
        sourceDir,
        projectPath || undefined,
      )
    } else {
      // Load first, then check if session is actually recent and switch to streaming
      store
        .loadSession(projectDir, sessionId, sourceDir, projectPath || undefined)
        .then(() => {
          const { session: loaded } = useSessionStore.getState()
          if (loaded && Date.now() - loaded.endTime.getTime() < 5 * 60 * 1000) {
            store.streamSession(
              projectDir,
              sessionId,
              sourceDir,
              projectPath || undefined,
            )
          }
        })
    }

    return () => {
      useSessionStore.getState().stopStreaming()
    }
  }, [projectDir, sessionId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const sidebarContent = session ? (
    <div className="divide-y divide-border">
      <SessionInfo />
      <TokenSummary />
      <ToolAnalytics />
    </div>
  ) : null

  const mainContent = session ? <ConversationFlow /> : null

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="flex-1 overflow-hidden">
        <AppLayout
          isStreaming={isStreaming}
          isSessionLive={isSessionLive}
          sidebar={sidebarContent}
          main={mainContent}
        />
      </div>
      {session && <SubagentPanel />}
    </div>
  )
}
