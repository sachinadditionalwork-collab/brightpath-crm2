import { useState } from 'react'
import {
  Users,
  UserPlus,
  Trophy,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  RotateCcw,
  Plus,
  CheckCircle2,
  CalendarCheck,
  Share2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../hooks/useAuth'
import { followUpService } from '../../services/followUpService'
import { leadService } from '../../services/leadService'
import LeadDetailDrawer from '../leads/LeadDetailDrawer'
import CreateLeadModal from '../leads/CreateLeadModal'

// Top-level pure date formatters conforming to React 19 rules
function formatDashboardDue(isoString) {
  if (!isoString) return ''
  try {
    const due = new Date(isoString)
    const now = new Date()
    const isSameDay =
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday =
      due.getFullYear() === yesterday.getFullYear() &&
      due.getMonth() === yesterday.getMonth() &&
      due.getDate() === yesterday.getDate()

    const timeStr = due.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    if (isSameDay) return `Today at ${timeStr}`
    if (isYesterday) return `Yesterday at ${timeStr}`
    return `${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`
  } catch {
    return isoString
  }
}

function formatLeadDate(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

const SOURCE_COLORS = {
  Website: '#2563eb',
  'Walk-in': '#059669',
  Referral: '#7c3aed',
  'Social Media': '#d97706',
  'Phone Call': '#0891b2',
}

export default function DashboardView() {
  const { metrics, isLoading, error, refreshDashboard } = useDashboard()
  const { user, profile } = useAuth()

  const [selectedLead, setSelectedLead] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [completingId, setCompletingId] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleMarkComplete = async (fuId, studentName) => {
    setCompletingId(fuId)
    const res = await followUpService.completeFollowUp(fuId, profile || user)
    setCompletingId(null)
    if (!res.error) {
      showToast(`Follow-up with ${studentName || 'student'} marked completed!`)
      refreshDashboard()
    }
  }

  const handleCreateLead = async (leadPayload) => {
    const res = await leadService.createLead(leadPayload, profile || user)
    if (!res.error) {
      showToast(`Inquiry for ${leadPayload.full_name} registered successfully!`)
      refreshDashboard()
    }
    return res
  }

  const handleUpdateLead = async (leadId, updates) => {
    const res = await leadService.updateLead(leadId, updates, profile || user)
    if (res.success) {
      setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, ...updates } : prev))
      showToast('Lead record updated.')
      refreshDashboard()
    }
    return res
  }

  const kpisData = metrics?.kpis || {
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    conversionRate: '0.0',
    overdueCount: 0,
    todayCount: 0,
  }

  const kpis = [
    {
      label: 'Total Student Inquiries',
      value: kpisData.totalLeads,
      change: `${kpisData.contactedLeads + kpisData.qualifiedLeads} in active consultation`,
      icon: Users,
      color: '#2563eb',
      to: '/leads',
    },
    {
      label: 'New Uncontacted Leads',
      value: kpisData.newLeads,
      change: 'Awaiting first counselor call',
      icon: UserPlus,
      color: '#0ea5e9',
      to: '/leads',
    },
    {
      label: 'Admissions Converted',
      value: kpisData.convertedLeads,
      change: `${kpisData.conversionRate}% overall conversion rate`,
      icon: Trophy,
      color: '#059669',
      to: '/leads',
    },
    {
      label: 'Overdue Follow-ups',
      value: kpisData.overdueCount,
      change:
        kpisData.overdueCount > 0
          ? 'Requires immediate action'
          : 'All counseling calls on track',
      icon: AlertCircle,
      color: kpisData.overdueCount > 0 ? '#e11d48' : '#64748b',
      to: '/followups',
      urgent: kpisData.overdueCount > 0,
    },
  ]

  return (
    <div className="animate-slide-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 110,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time prospective student inquiry pipeline and verified conversion metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={refreshDashboard}
            title="Refresh metrics from database"
          >
            <RotateCcw size={15} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            id="btn-dashboard-create-lead"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="stat-card-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              to={kpi.to}
              className="card stat-card"
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                borderLeft: kpi.urgent ? '4px solid #f43f5e' : undefined,
                transition: 'transform 150ms ease, box-shadow 150ms ease',
              }}
            >
              <div className="stat-card-top">
                <span className="stat-label">{kpi.label}</span>
                <div
                  className="stat-icon-wrapper"
                  style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div
                className="stat-value"
                style={{ color: kpi.urgent ? '#e11d48' : '#0f172a' }}
              >
                {isLoading ? '...' : kpi.value}
              </div>
              <div className="stat-change" style={{ color: '#64748b' }}>
                <TrendingUp size={13} color={kpi.color} />
                <span>{kpi.change}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Middle Section: Stage Distribution & Source Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Pipeline Stage Distribution Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                Inquiry Stage Distribution
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Active prospects categorized by pipeline stage
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
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading pipeline distribution...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(metrics?.statusDistribution || []).map((stage) => (
                  <div key={stage.status}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8125rem',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {stage.label}
                      </span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {stage.count} {stage.count === 1 ? 'lead' : 'leads'} ({stage.pct}%)
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
                          width: `${Math.max(stage.pct, stage.count > 0 ? 4 : 0)}%`,
                          height: '100%',
                          backgroundColor: stage.color,
                          borderRadius: '9999px',
                          transition: 'width 300ms ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lead Source Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                Inquiry Channel Breakdown
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Prospect volume by acquisition channel
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
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading channels...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(metrics?.sourceDistribution || []).map((item) => {
                  const channelColor = SOURCE_COLORS[item.source] || '#2563eb'
                  return (
                    <div key={item.source}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8125rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Share2 size={12} color={channelColor} />
                          <span>{item.source}</span>
                        </span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.count} ({item.pct}%)
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
                            width: `${Math.max(item.pct, item.count > 0 ? 4 : 0)}%`,
                            height: '100%',
                            backgroundColor: channelColor,
                            borderRadius: '9999px',
                            transition: 'width 300ms ease',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Priority Tasks & Recent Inquiries */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Actionable Follow-ups Widget */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                Priority Follow-up Schedule
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Upcoming & overdue counseling calls
              </div>
            </div>
            <Link
              to="/followups"
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
            >
              <span>Task Center</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading priority tasks...
              </div>
            ) : (metrics?.urgentFollowUps || []).length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <CalendarCheck size={22} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                  All Caught Up!
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  No pending counseling follow-ups require immediate action.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(metrics?.urgentFollowUps || []).map((task) => {
                  const isOverdue =
                    task.status === 'pending' && new Date(task.due_at) < new Date()
                  const studentName = task.lead?.full_name || 'Student Inquiry'
                  const course = task.lead?.course_interest || 'General'

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: isOverdue ? '#fff1f2' : '#f8fafc',
                        border: isOverdue ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: isOverdue ? '#9f1239' : '#0f172a',
                            }}
                          >
                            {studentName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: isOverdue ? '#ffe4e6' : '#e2e8f0',
                              color: isOverdue ? '#be123c' : '#475569',
                            }}
                          >
                            {course}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: isOverdue ? '#be123c' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            marginTop: '2px',
                          }}
                        >
                          <Clock size={12} />
                          <span>{formatDashboardDue(task.due_at)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isOverdue && (
                          <span
                            className="status-badge badge-lost"
                            style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
                          >
                            Overdue
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(task.id, studentName)}
                          className="btn btn-primary"
                          disabled={completingId === task.id}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.6rem',
                            backgroundColor: '#059669',
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries Preview Widget */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>
                Recent Student Inquiries
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Latest prospective leads registered
              </div>
            </div>
            <Link
              to="/leads"
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
            >
              <span>Manage Leads</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading recent inquiries...
              </div>
            ) : (metrics?.recentLeads || []).length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Users size={22} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                  No Inquiries Yet
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Register student leads to begin pipeline tracking.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(metrics?.recentLeads || []).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                          {lead.full_name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                          }}
                        >
                          {lead.course_interest}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        via {lead.source} • Registered {formatLeadDate(lead.created_at)}
                      </div>
                    </div>

                    <span
                      className={`status-badge badge-${lead.status.toLowerCase()}`}
                      style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                    >
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
      />

      {/* Embedded Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateLead={handleCreateLead}
      />
    </div>
  )
}
