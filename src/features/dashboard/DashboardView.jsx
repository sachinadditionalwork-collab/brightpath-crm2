import {
  Users,
  UserPlus,
  Trophy,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardView() {
  const kpis = [
    {
      label: 'Total Inquiries',
      value: '24',
      change: '+12% this week',
      icon: Users,
      color: '#3b82f6',
    },
    {
      label: 'New Leads',
      value: '8',
      change: 'Awaiting first contact',
      icon: UserPlus,
      color: '#0ea5e9',
    },
    {
      label: 'Admissions Converted',
      value: '6',
      change: '25.0% conversion rate',
      icon: Trophy,
      color: '#10b981',
    },
    {
      label: 'Overdue Follow-ups',
      value: '2',
      change: 'Requires immediate action',
      icon: AlertCircle,
      color: '#f43f5e',
    },
  ]

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time prospective student inquiry pipeline and conversion metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary">
            <Calendar size={15} />
            <span>This Month</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-card-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="card stat-card">
              <div className="stat-card-top">
                <span className="stat-label">{kpi.label}</span>
                <div
                  className="stat-icon-wrapper"
                  style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{kpi.value}</div>
              <div className="stat-change" style={{ color: '#64748b' }}>
                <TrendingUp size={13} />
                <span>{kpi.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Grid for Live Pipeline Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Pipeline Distribution Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                Inquiry Stage Distribution
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Active prospects by pipeline status
              </div>
            </div>
            <Link
              to="/leads"
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'New Inquiries', count: 8, pct: 33, class: 'badge-new' },
                { label: 'Contacted', count: 6, pct: 25, class: 'badge-contacted' },
                { label: 'Qualified Candidates', count: 4, pct: 17, class: 'badge-qualified' },
                { label: 'Enrolled / Converted', count: 6, pct: 25, class: 'badge-converted' },
              ].map((stage) => (
                <div key={stage.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: '#334155' }}>
                      {stage.label}
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      {stage.count} leads ({stage.pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '7px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${stage.pct}%`,
                        height: '100%',
                        backgroundColor: '#2563eb',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Follow-ups Widget */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                Urgent & Upcoming Follow-ups
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Scheduled student consultations
              </div>
            </div>
            <Link
              to="/followups"
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#9f1239' }}>
                    Aarav Sharma • Data Science
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#be123c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '2px',
                    }}
                  >
                    <Clock size={12} />
                    <span>Overdue since Yesterday 4:00 PM</span>
                  </div>
                </div>
                <span className="status-badge badge-lost">Overdue</span>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    Priya Patel • Full Stack Web
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '2px',
                    }}
                  >
                    <Clock size={12} />
                    <span>Today at 3:30 PM</span>
                  </div>
                </div>
                <span className="status-badge badge-qualified">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
