import { User, Database, Info } from 'lucide-react'

export default function SettingsView() {
  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Operational Roles</h1>
          <p className="page-subtitle">
            Configure counselor preferences, security parameters, and review system configuration.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="#2563eb" />
              <span style={{ fontWeight: 600 }}>Active Counselor Profile</span>
            </div>
            <span className="status-badge badge-qualified">Counsellor</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  Full Name
                </label>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.25rem' }}>
                  Anjali Gupta
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  Email Address
                </label>
                <div style={{ fontWeight: 500, color: '#334155', marginTop: '0.25rem' }}>
                  anjali.gupta@brightpath.edu
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8125rem',
                  color: '#475569',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <Info size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  By security design, role modifications (e.g. promoting to Manager or Administrator)
                  must be executed via Supabase database procedures to prevent client-side privilege escalation.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Environment Info Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="#059669" />
              <span style={{ fontWeight: 600 }}>Environment & Architecture</span>
            </div>
            <span className="status-badge badge-converted">Online</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Frontend Framework</span>
                <strong style={{ color: '#0f172a' }}>React 19 + Vite 8</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Client Router</span>
                <strong style={{ color: '#0f172a' }}>React Router v7</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Database Engine</span>
                <strong style={{ color: '#0f172a' }}>Supabase PostgreSQL 15+</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Security Engine</span>
                <strong style={{ color: '#0f172a' }}>Row-Level Security (RLS)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Deployment Target</span>
                <strong style={{ color: '#0f172a' }}>Vercel Edge</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
