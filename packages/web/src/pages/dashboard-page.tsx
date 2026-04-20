import { useEffect } from 'react'
import { useSessionStore } from '@/store/session-store'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { RecentSessions } from '@/components/dashboard/recent-sessions'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { TokenConsumptionChart } from '@/components/dashboard/tool-usage-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const {
    dashboardStats,
    isDashboardLoading,
    fetchConfig,
    fetchDashboardStats,
  } = useSessionStore()

  useEffect(() => {
    fetchConfig().then(() => fetchDashboardStats())
  }, [fetchConfig, fetchDashboardStats])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your Claude Code sessions
        </p>
      </div>

      {isDashboardLoading || !dashboardStats ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6 animate-fade-in">
          <StatsOverview stats={dashboardStats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityChart data={dashboardStats.sessionsPerDay} />
            <TokenConsumptionChart data={dashboardStats.tokenUsage} />
          </div>
          <RecentSessions sessions={dashboardStats.recentSessions} />
        </div>
      )}
    </div>
  )
}
