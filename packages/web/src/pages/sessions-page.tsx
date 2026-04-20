import { SessionLoader } from '@/components/session-loader/session-loader'

export function SessionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and search Claude Code conversations
        </p>
      </div>
      <SessionLoader />
    </div>
  )
}
