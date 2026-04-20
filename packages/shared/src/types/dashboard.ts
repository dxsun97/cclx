export interface DashboardStats {
  totalSessions: number
  totalProjects: number
  recentSessions: {
    projectDir: string
    sessionId: string
    sourceDir: string
    preview: string
    title: string
    modified: string
    projectPath: string
  }[]
  sessionsPerDay: { date: string; count: number }[]
  tokenUsage: {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens: number
    cache_read_input_tokens: number
  }
}
