import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import DashboardView from './features/dashboard/DashboardView'
import LeadsView from './features/leads/LeadsView'
import FollowUpsView from './features/followups/FollowUpsView'
import SettingsView from './features/settings/SettingsView'
import LoginView from './features/auth/LoginView'
import SetupGuideView from './components/feedback/SetupGuideView'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Screen */}
          <Route path="/login" element={<LoginView />} />

          {/* Protected Application Workspace Shell */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardView />} />
              <Route path="leads" element={<LeadsView />} />
              <Route path="followups" element={<FollowUpsView />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="setup" element={<SetupGuideView />} />
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
