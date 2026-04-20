import { useNavigate } from 'react-router'
import { FileText, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useSessionStore } from '@/store/session-store'
import type { DashboardStats } from '@/types/dashboard'

interface RecentSessionsProps {
  sessions: DashboardStats['recentSessions']
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const navigate = useNavigate()

  const handleClick = (s: RecentSessionsProps['sessions'][number]) => {
    useSessionStore.getState().setNavigationContext(s.sourceDir, s.projectPath)
    navigate(`/sessions/${s.projectDir}/${s.sessionId}`)
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">Recent Sessions</h3>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="divide-y divide-border">
          {sessions.map((s) => (
            <button
              key={`${s.projectDir}-${s.sessionId}`}
              onClick={() => handleClick(s)}
              className="w-full text-left flex items-center gap-3 px-5 py-2.5 hover:bg-accent/50 transition-colors"
            >
              <FileText className="w-4 h-4 text-tool-agent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  {s.title || s.preview || s.sessionId.slice(0, 8)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="truncate">
                    {s.projectPath.split('/').pop()}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {format(new Date(s.modified), 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
