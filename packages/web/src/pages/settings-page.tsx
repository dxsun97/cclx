import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import type { DataSource } from '@/store/session-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const { dataSources, fetchConfig, saveConfig, fetchProjects } =
    useSessionStore()
  const [sources, setSources] = useState<DataSource[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newPath, setNewPath] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    setSources(dataSources)
  }, [dataSources])

  const handleSave = async () => {
    await saveConfig(sources)
    await fetchProjects()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggle = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  const handleRemove = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id))
  }

  const handleAdd = () => {
    if (!newLabel.trim() || !newPath.trim()) return
    setSources((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        label: newLabel.trim(),
        path: newPath.trim(),
        enabled: true,
      },
    ])
    setNewLabel('')
    setNewPath('')
    setIsAdding(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure data sources and preferences
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Data Sources</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Directories to scan for Claude Code session files
            </p>
          </div>
          <Button onClick={handleSave} size="sm" className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>

        <div className="border border-border rounded-lg divide-y divide-border">
          {sources.map((source) => (
            <div
              key={source.id}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 transition-colors',
                !source.enabled && 'opacity-50',
              )}
            >
              <button
                onClick={() => handleToggle(source.id)}
                className="shrink-0"
              >
                {source.enabled ? (
                  <ToggleRight className="w-5 h-5 text-tool-bash" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{source.label}</span>
                <span className="text-xs text-muted-foreground block truncate">
                  {source.path}
                </span>
              </div>
              <button
                onClick={() => handleRemove(source.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {sources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sources configured
            </div>
          )}
        </div>

        <div className="mt-3">
          {isAdding ? (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g. Claude Code)"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <input
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="Path (e.g. ~/.claude/projects)"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewLabel('')
                    setNewPath('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || !newPath.trim()}
                >
                  Add Source
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-muted-foreground rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add source
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
