import { MessageSquare, FolderOpen, Zap } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { formatTokenCount } from '@/lib/analytics'
import type { DashboardStats } from '@/types/dashboard'

interface StatsOverviewProps {
  stats: DashboardStats
}

const emptyTokenUsage = {
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const usage = stats.tokenUsage ?? emptyTokenUsage
  const totalTokens = usage.input_tokens + usage.output_tokens

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Sessions"
        value={stats.totalSessions.toLocaleString()}
        icon={<MessageSquare className="w-4 h-4" />}
      />
      <StatCard
        label="Projects"
        value={stats.totalProjects.toLocaleString()}
        icon={<FolderOpen className="w-4 h-4" />}
      />
      <StatCard
        label="Token Consumption (sampled)"
        value={formatTokenCount(totalTokens)}
        icon={<Zap className="w-4 h-4" />}
        description="From first 64KB of each session"
      />
    </div>
  )
}
