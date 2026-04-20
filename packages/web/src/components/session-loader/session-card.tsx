import { FileText, FolderOpen, Clock, HardDrive } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export interface SessionCardData {
  projectDirName: string
  projectPath: string
  sourceDir: string
  sourceLabel: string
  id: string
  filename: string
  size: number
  modified: string
  preview: string
  title: string
}

interface SessionCardProps {
  session: SessionCardData
  showProject: boolean
  onClick: () => void
}

function isRecentSession(modified: string): boolean {
  return Date.now() - new Date(modified).getTime() < 5 * 60 * 1000
}

export function SessionCard({
  session,
  showProject,
  onClick,
}: SessionCardProps) {
  const isLive = isRecentSession(session.modified)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
        'hover:bg-accent/50 active:bg-accent',
      )}
    >
      <FileText className="w-4 h-4 text-tool-agent shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {session.title ? (
          <>
            <div className="text-sm font-medium truncate">{session.title}</div>
            {session.preview && (
              <div className="text-xs text-muted-foreground truncate">
                {session.preview}
              </div>
            )}
          </>
        ) : session.preview ? (
          <div className="text-sm truncate">{session.preview}</div>
        ) : (
          <div className="text-sm font-mono truncate text-muted-foreground">
            {session.id}
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
          {showProject && (
            <span className="flex items-center gap-1 truncate max-w-[120px] sm:max-w-[200px]">
              <FolderOpen className="w-3 h-3 shrink-0" />
              {session.projectPath.split('/').pop()}
            </span>
          )}
          {showProject && session.sourceLabel && (
            <span className="hidden sm:inline bg-muted px-1.5 py-0.5 rounded text-[10px]">
              {session.sourceLabel}
            </span>
          )}
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {format(new Date(session.modified), 'MMM d, HH:mm')}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 shrink-0 text-green-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Live
            </span>
          )}
          <span className="flex items-center gap-1 shrink-0">
            <HardDrive className="w-3 h-3" />
            {formatSize(session.size)}
          </span>
        </div>
      </div>
    </button>
  )
}
