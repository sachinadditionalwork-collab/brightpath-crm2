import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  GraduationCap,
} from 'lucide-react'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Student Leads', icon: Users },
    { to: '/followups', label: 'Follow-ups', icon: CalendarCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  const closeDrawer = () => setIsOpen(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Mobile Top Sticky Bar */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <GraduationCap size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#ffffff' }}>
            BrightPath CRM
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: '#ffffff', padding: '0.25rem' }}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop Overlay & Slide-over Drawer */}
      {isOpen && (
        <div className="mobile-drawer-overlay" onClick={closeDrawer}>
          <div
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: '56px',
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <span style={{ fontWeight: 700, color: '#ffffff' }}>Navigation</span>
              <button
                type="button"
                onClick={closeDrawer}
                style={{ color: '#94a3b8' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={closeDrawer}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
