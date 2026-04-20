import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('cf-theme') as Theme) ?? 'dark',
  setTheme: (theme) => {
    localStorage.setItem('cf-theme', theme)
    applyTheme(theme)
    set({ theme })
  },
}))

// Initialize on load
applyTheme(useThemeStore.getState().theme)
