import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { GraduationCap } from 'lucide-react'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#ffffff',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulseGlow 2s infinite ease-in-out',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
          }}
        >
          <GraduationCap size={28} color="#ffffff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f8fafc' }}>
            BrightPath Academy
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
            Restoring session...
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role authorization if specified
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#e11d48', fontSize: '1.5rem', fontWeight: 700 }}>
          Access Restricted
        </h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Your account role ({profile.role}) does not have permission to access this area.
        </p>
      </div>
    )
  }

  return <Outlet />
}
