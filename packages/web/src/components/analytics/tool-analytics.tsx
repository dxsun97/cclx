import { useSessionStore } from '@/store/session-store'
import { getToolColor } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function ToolAnalytics() {
  const { analytics, filterTool, setFilterTool } = useSessionStore()
  if (!analytics || analytics.toolStats.length === 0) return null

  const maxCount = analytics.toolStats[0].count

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Tool Usage
      </h3>

      <div className="space-y-1.5">
        {analytics.toolStats.map((stat) => {
          const pct = (stat.count / maxCount) * 100
          const errorPct = stat.count > 0 ? (stat.errors / stat.count) * 100 : 0
          const isActive = filterTool === stat.name

          return (
            <button
              key={stat.name}
              onClick={() => setFilterTool(isActive ? null : stat.name)}
              className={cn(
                'w-full text-left rounded-md px-2 py-1.5 transition-colors',
                isActive ? 'bg-accent' : 'hover:bg-accent/50',
              )}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{stat.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {stat.count}
                  {stat.errors > 0 && (
                    <span className="text-destructive ml-1">
                      ({stat.errors} err)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getToolColor(stat.name),
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
                {errorPct > 0 && (
                  <div
                    className="h-full rounded-full bg-red-500 -mt-1.5"
                    style={{ width: `${errorPct}%` }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
