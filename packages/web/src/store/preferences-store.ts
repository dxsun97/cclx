import { create } from 'zustand'

const STORAGE_KEY = 'cf-preferences'

interface Preferences {
  sessionsViewMode: 'timeline' | 'project'
}

interface PreferencesState extends Preferences {
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
}

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaults
}

function save(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

const defaults: Preferences = {
  sessionsViewMode: 'timeline',
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...load(),
  set: (key, value) => {
    set({ [key]: value })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { set: _, ...prefs } = get()
    save(prefs)
  },
}))
