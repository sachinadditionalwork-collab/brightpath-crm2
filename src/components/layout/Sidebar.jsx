import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

export default function Sidebar() {
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
          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Phase 1 Active</div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Layout Shell Ready</div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-avatar-pill">BP</div>
        <div className="user-meta">
          <span className="user-name">Staff Member</span>
          <span className="user-role-tag">Counsellor</span>
        </div>
      </div>
    </aside>
  )
}
