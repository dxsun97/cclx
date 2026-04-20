import { Clock, GitBranch, FolderOpen, Hash, Shield } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { formatDuration } from '@/lib/analytics'
import { format } from 'date-fns'

function isKnown(value: string): boolean {
  return !!value && value !== 'unknown'
}

export function SessionInfo() {
  const session = useSessionStore((s) => s.session)
  if (!session) return null

  const projectName = isKnown(session.projectPath)
    ? session.projectPath.split('/').pop()!
    : 'Session'

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-sm truncate">{projectName}</h2>

      <div className="space-y-2 text-xs">
        {isKnown(session.projectPath) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate" title={session.projectPath}>
              {session.projectPath}
            </span>
          </div>
        )}
        {isKnown(session.gitBranch) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>{session.gitBranch}</span>
          </div>
        )}
        {isKnown(session.sessionId) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-mono" title={session.sessionId}>
              {session.sessionId.slice(0, 8)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{format(session.startTime, 'MMM d, HH:mm')}</span>
          <span className="text-muted-foreground/60">
            (
            {formatDuration(
              session.endTime.getTime() - session.startTime.getTime(),
            )}
            )
          </span>
        </div>
        {session.permissionMode && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="capitalize">{session.permissionMode}</span>
          </div>
        )}
      </div>
    </div>
  )
}
