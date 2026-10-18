import { useLocation, Link } from 'react-router-dom'
import { Plus, Bell, ShieldCheck } from 'lucide-react'

export default function Navbar({ onOpenNewLead }) {
  const location = useLocation()

  // Format breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Executive Dashboard'
      case '/leads':
        return 'Student Leads'
      case '/followups':
        return 'Follow-up Center'
      case '/settings':
        return 'Settings & Roles'
      default:
        return 'Workspace'
    }
  }

  return (
    <header className="top-navbar">
      {/* Dynamic Breadcrumbs */}
      <div className="navbar-breadcrumbs">
        <span className="breadcrumb-root">BrightPath</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Side Actions */}
      <div className="navbar-actions">
        {/* System Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={13} />
          <span>System Normal</span>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '8px' }}
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell size={18} />
        </button>

        {/* Primary "+ New Lead" Action Button */}
        <Link
          to="/leads"
          className="btn btn-primary"
          onClick={onOpenNewLead}
          id="btn-new-lead-topbar"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Lead</span>
        </Link>
      </div>
    </header>
  )
}
