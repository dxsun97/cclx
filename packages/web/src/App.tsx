import { Routes, Route } from 'react-router'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/pages/dashboard-page'
import { SessionsPage } from '@/pages/sessions-page'
import { SessionViewerPage } from '@/pages/session-viewer-page'
import { SettingsPage } from '@/pages/settings-page'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route
          path="sessions/:projectDir/:sessionId"
          element={<SessionViewerPage />}
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
