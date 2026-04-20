import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useSessionStore } from '@/store/session-store'
import type { DataSource } from '@/store/session-store'
import { cn } from '@/lib/utils'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { dataSources, fetchConfig, saveConfig, fetchProjects } =
    useSessionStore()
  const [sources, setSources] = useState<DataSource[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newPath, setNewPath] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])
  useEffect(() => {
    setSources(dataSources)
  }, [dataSources])

  const handleSave = async () => {
    await saveConfig(sources)
    await fetchProjects()
    onClose()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-[13px] font-semibold">Data Sources</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* List */}
        <div className="p-3 space-y-1.5">
          {sources.map((source) => (
            <div
              key={source.id}
              className={cn(
                'group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors',
                source.enabled ? 'bg-zinc-800/50' : 'bg-zinc-900/50 opacity-50',
              )}
            >
              <button
                onClick={() => handleToggle(source.id)}
                className="shrink-0"
              >
                {source.enabled ? (
                  <ToggleRight className="w-[18px] h-[18px] text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-[18px] h-[18px] text-zinc-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-zinc-200">
                  {source.label}
                </span>
                <span className="text-[11px] text-zinc-500 block truncate">
                  {source.path}
                </span>
              </div>
              <button
                onClick={() => handleRemove(source.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {sources.length === 0 && (
            <div className="text-center py-6 text-zinc-600 text-xs">
              No sources configured
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Add */}
        <div className="p-3">
          {isAdding ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
              />
              <input
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="~/path/to/projects"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none focus:border-zinc-500 placeholder:text-zinc-600 font-mono"
              />
              <div className="flex gap-2 pt-0.5">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewLabel('')
                    setNewPath('')
                  }}
                  className="flex-1 py-1.5 text-[12px] text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || !newPath.trim()}
                  className="flex-1 py-1.5 text-[12px] bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-600 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add source
            </button>
          )}
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Footer */}
        <div className="flex justify-end px-4 py-2.5">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-[12px] bg-zinc-200 text-zinc-900 font-medium rounded-lg hover:bg-white transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
