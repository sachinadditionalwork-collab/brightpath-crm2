import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  GraduationCap,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const { profile, user, signOut } = useAuth()

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/leads',
      label: 'Student Leads',
      icon: Users,
      badge: null,
    },
    {
      to: '/followups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: { text: '2', urgent: true },
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ]

  // Compute initials
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff Member'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <GraduationCap size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title">BrightPath</span>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '-2px' }}>
            Academy CRM
          </span>
        </div>
        <span className="brand-badge">MVP v1</span>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`nav-badge-count ${
                    item.badge.urgent ? 'urgent' : ''
                  }`}
                >
                  {item.badge.text}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Workspace Plan Indicator */}
      <div
        style={{
          margin: '0 0.75rem 0.75rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <Sparkles size={16} color="#60a5fa" />
        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Phase 3 Active</div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Auth & Roles Online</div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="sidebar-footer" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
          <div className="user-avatar-pill">{initials}</div>
          <div className="user-meta">
            <span className="user-name">{displayName}</span>
            <span className="user-role-tag">{profile?.role || 'Counsellor'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="btn btn-ghost"
          style={{ padding: '0.4rem', color: '#94a3b8', borderRadius: '6px' }}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
