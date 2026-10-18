import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function AppLayout() {
  return (
    <div className="app-container">
      {/* Mobile Top Header (< 768px) */}
      <MobileNav />

      {/* Desktop Persistent Sidebar (>= 768px) */}
      <Sidebar />

      {/* Main Execution Workspace */}
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content-area animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
