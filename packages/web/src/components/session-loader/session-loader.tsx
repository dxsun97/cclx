import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  FolderOpen,
  FileText,
  AlertCircle,
  List,
  Calendar,
  Search,
} from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import { Skeleton } from '@/components/ui/skeleton'
import { usePreferencesStore } from '@/store/preferences-store'
import type { ProjectInfo } from '@/store/session-store'
import { SessionCard } from './session-card'
import type { SessionCardData } from './session-card'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return 'This Week'
  if (isThisMonth(d)) return 'This Month'
  return format(d, 'MMMM yyyy')
}

function flattenByTime(
  projects: ProjectInfo[],
): { group: string; sessions: SessionCardData[] }[] {
  const all: SessionCardData[] = []
  for (const p of projects) {
    for (const s of p.sessions) {
      all.push({
        projectDirName: p.dirName,
        projectPath: p.projectPath,
        sourceDir: p.sourceDir,
        sourceLabel: p.sourceLabel,
        id: s.id,
        filename: s.filename,
        size: s.size,
        modified: s.modified,
        preview: s.preview,
        title: s.title ?? '',
      })
    }
  }
  all.sort(
    (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime(),
  )

  const grouped: { group: string; sessions: SessionCardData[] }[] = []
  let currentGroup = ''
  for (const s of all) {
    const group = getDateGroup(s.modified)
    if (group !== currentGroup) {
      currentGroup = group
      grouped.push({ group, sessions: [] })
    }
    grouped[grouped.length - 1].sessions.push(s)
  }
  return grouped
}

export function SessionLoader() {
  const { projects, isLoadingProjects, error, fetchProjects, fetchConfig } =
    useSessionStore()
  const navigate = useNavigate()
  const view = usePreferencesStore((s) => s.sessionsViewMode)
  const setView = (v: 'timeline' | 'project') =>
    usePreferencesStore.getState().set('sessionsViewMode', v)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchConfig().then(() => fetchProjects())
  }, [fetchConfig, fetchProjects])

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects
    const q = search.toLowerCase()
    return projects
      .map((p) => ({
        ...p,
        sessions: p.sessions.filter(
          (s) =>
            s.preview.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            p.projectPath.toLowerCase().includes(q),
        ),
      }))
      .filter((p) => p.sessions.length > 0)
  }, [projects, search])

  const timelineGroups = useMemo(
    () => flattenByTime(filteredProjects),
    [filteredProjects],
  )

  const handleSessionClick = (
    projectDirName: string,
    sessionId: string,
    sourceDir: string,
    projectPath: string,
    modified?: string,
  ) => {
    useSessionStore
      .getState()
      .setNavigationContext(sourceDir, projectPath, modified)
    navigate(`/sessions/${projectDirName}/${sessionId}`)
  }

  return (
    <div>
      {/* Search + view toggle */}
      <div className="flex items-center gap-2 sm:gap-3 sticky top-14 z-10 bg-background py-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-secondary border border-border rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div className="inline-flex bg-secondary rounded-md p-0.5">
          <button
            onClick={() => setView('timeline')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition-colors',
              view === 'timeline'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          <button
            onClick={() => setView('project')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition-colors',
              view === 'project'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">By Project</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoadingProjects ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="px-4 py-3 bg-card/50 flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
              <div className="divide-y divide-border/50">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="px-4 py-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 && !search ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No sessions found. Add data sources in settings.</p>
        </div>
      ) : filteredProjects.length === 0 && search ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No sessions match your search.</p>
        </div>
      ) : view === 'timeline' ? (
        <div className="space-y-6 animate-fade-in">
          {timelineGroups.map((group) => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {group.group}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border/50">
                {group.sessions.map((session) => (
                  <SessionCard
                    key={`${session.sourceDir}-${session.projectDirName}-${session.id}`}
                    session={session}
                    showProject={true}
                    onClick={() =>
                      handleSessionClick(
                        session.projectDirName,
                        session.id,
                        session.sourceDir,
                        session.projectPath,
                        session.modified,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {filteredProjects.map((project) => (
            <div
              key={`${project.sourceDir}-${project.dirName}`}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div className="px-4 py-3 bg-card/50 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <span
                  className="text-sm font-medium truncate"
                  title={project.projectPath}
                >
                  {project.projectPath}
                </span>
                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground shrink-0">
                  {project.sourceLabel}
                </span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {project.sessions.length} session
                  {project.sessions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {project.sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={{
                      ...session,
                      projectDirName: project.dirName,
                      projectPath: project.projectPath,
                      sourceDir: project.sourceDir,
                      sourceLabel: project.sourceLabel,
                    }}
                    showProject={false}
                    onClick={() =>
                      handleSessionClick(
                        project.dirName,
                        session.id,
                        project.sourceDir,
                        project.projectPath,
                        session.modified,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
