import { Outlet } from 'react-router'
import { Navbar } from './navbar'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Outlet />
    </div>
  )
}
