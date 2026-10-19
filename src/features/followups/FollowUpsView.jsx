import { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Phone,
  Mail,
  CalendarCheck,
  Check,
  Ban,
  AlertCircle,
} from 'lucide-react'
import { useFollowUps } from '../../hooks/useFollowUps'
import { useAuth } from '../../hooks/useAuth'
import { leadService } from '../../services/leadService'
import ScheduleFollowUpModal from './ScheduleFollowUpModal'
import LeadDetailDrawer from '../leads/LeadDetailDrawer'

// Top-level pure date formatters
function formatDueDateTime(isoString) {
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

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow =
      due.getFullYear() === tomorrow.getFullYear() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getDate() === tomorrow.getDate()

    const timeStr = due.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    if (isSameDay) return `Today, ${timeStr}`
    if (isYesterday) return `Yesterday, ${timeStr}`
    if (isTomorrow) return `Tomorrow, ${timeStr}`

    return `${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`
  } catch {
    return isoString
  }
}

function formatCompletedDate(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return isoString
  }
}

export default function FollowUpsView() {
  const {
    activeList,
    counts,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    scheduleFollowUp,
    completeFollowUp,
    cancelFollowUp,
  } = useFollowUps()
  const { user, profile } = useAuth()

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const tabs = [
    { id: 'OVERDUE', label: 'Overdue', count: counts.overdue, urgent: counts.overdue > 0 },
    { id: 'TODAY', label: 'Due Today', count: counts.today, urgent: false },
    { id: 'UPCOMING', label: 'Upcoming', count: counts.upcoming, urgent: false },
    { id: 'COMPLETED', label: 'Completed', count: counts.completed, urgent: false },
  ]

  const handleScheduleSubmit = async (payload) => {
    const res = await scheduleFollowUp(payload)
    if (res.success) {
      showToast('Follow-up scheduled successfully!')
    }
    return res
  }

  const handleMarkComplete = async (id, studentName) => {
    setProcessingId(id)
    const res = await completeFollowUp(id)
    setProcessingId(null)
    if (res.success) {
      showToast(`Follow-up with ${studentName || 'student'} marked completed!`)
    }
  }

  const handleCancelTask = async (id) => {
    if (window.confirm('Are you sure you want to cancel this follow-up?')) {
      setProcessingId(id)
      const res = await cancelFollowUp(id)
      setProcessingId(null)
      if (res.success) {
        showToast('Follow-up task cancelled.')
      }
    }
  }

  // Handle lead detail drawer updates
  const handleUpdateLeadFromDrawer = async (leadId, updates) => {
    const res = await leadService.updateLead(leadId, updates, profile || user)
    if (res.success) {
      setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, ...updates } : prev))
      showToast('Student lead profile updated.')
    }
    return res
  }

  return (
    <div className="animate-slide-up">
      {/* Feedback Toast */}
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

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Task Center</h1>
          <p className="page-subtitle">
            Stay on schedule with prospective student calls, counseling sessions, and campus visits.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsScheduleModalOpen(true)}
          id="btn-schedule-followup-main"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2563eb' : '#64748b',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                transition: 'all 150ms ease',
                marginBottom: '-1px',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: tab.urgent
                    ? '#ffe4e6'
                    : isActive
                    ? '#dbeafe'
                    : '#f1f5f9',
                  color: tab.urgent
                    ? '#e11d48'
                    : isActive
                    ? '#1d4ed8'
                    : '#64748b',
                  transition: 'all 150ms ease',
                }}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error Banner */}
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

      {/* Task List Content */}
      {isLoading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Loading counseling follow-up tasks...
          </span>
        </div>
      ) : activeList.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3rem 1.5rem' }}>
          <div className="empty-icon-circle">
            <CalendarCheck size={26} />
          </div>
          <div className="empty-title">
            {activeTab === 'OVERDUE' && 'All Caught Up! No Overdue Tasks'}
            {activeTab === 'TODAY' && 'No Follow-ups Due Today'}
            {activeTab === 'UPCOMING' && 'No Upcoming Tasks Scheduled'}
            {activeTab === 'COMPLETED' && 'No Completed Tasks Yet'}
          </div>
          <div className="empty-description" style={{ maxWidth: '440px' }}>
            {activeTab === 'OVERDUE' &&
              'Outstanding counseling inquiries are up to date. Prospective students are being contacted on schedule.'}
            {activeTab === 'TODAY' &&
              'You have no scheduled calls for today. Review upcoming inquiries or schedule prospective student meetings.'}
            {activeTab === 'UPCOMING' &&
              'No counseling calls on the calendar for future dates. Plan your outreach to stay ahead.'}
            {activeTab === 'COMPLETED' &&
              'Tasks marked as completed will be cataloged here for accountability and reporting.'}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsScheduleModalOpen(true)}
            style={{ marginTop: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeList.map((item) => {
            const isOverdue =
              item.status === 'pending' && new Date(item.due_at) < new Date()
            const isCompleted = item.status === 'completed'
            const isProcessing = processingId === item.id
            const leadData = item.lead || {}

            let borderAccent = '#3b82f6'
            if (isCompleted) borderAccent = '#10b981'
            else if (isOverdue) borderAccent = '#f43f5e'
            else if (activeTab === 'TODAY') borderAccent = '#f59e0b'

            return (
              <div
                key={item.id}
                className="card animate-slide-up"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  borderLeft: `4px solid ${borderAccent}`,
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'box-shadow 150ms ease, transform 150ms ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Lead and Task Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#0f172a',
                      }}
                    >
                      {leadData.full_name || 'Prospective Student'}
                    </span>

                    {leadData.course_interest && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 500,
                        }}
                      >
                        {leadData.course_interest}
                      </span>
                    )}

                    {isOverdue && (
                      <span className="status-badge badge-lost">
                        <AlertTriangle size={12} />
                        <span>Action Overdue</span>
                      </span>
                    )}

                    {isCompleted && (
                      <span className="status-badge badge-converted">
                        <CheckCircle2 size={12} />
                        <span>Completed</span>
                      </span>
                    )}

                    {item.status === 'cancelled' && (
                      <span className="status-badge badge-lost">
                        <Ban size={12} />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>

                  {/* Consultation Agenda / Notes */}
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#334155',
                      marginTop: '0.5rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.note}
                  </p>

                  {/* Meta Bar: Due Date, Assignee, Student Quick Contact */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginTop: '0.85rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock
                        size={13}
                        color={isOverdue ? '#e11d48' : '#64748b'}
                      />
                      <strong style={{ color: isOverdue ? '#e11d48' : '#0f172a' }}>
                        {formatDueDateTime(item.due_at)}
                      </strong>
                    </span>

                    <span>•</span>

                    <span>
                      Assigned to:{' '}
                      <strong style={{ color: '#0f172a' }}>
                        {item.assigned_to_profile?.full_name || 'Staff Member'}
                      </strong>
                    </span>

                    {/* Quick Phone / Email if available */}
                    {leadData.phone && (
                      <>
                        <span>•</span>
                        <a
                          href={`tel:${leadData.phone}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#2563eb',
                            fontWeight: 500,
                          }}
                        >
                          <Phone size={11} />
                          <span>{leadData.phone}</span>
                        </a>
                      </>
                    )}

                    {leadData.email && (
                      <>
                        <span>•</span>
                        <a
                          href={`mailto:${leadData.email}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#2563eb',
                            fontWeight: 500,
                          }}
                        >
                          <Mail size={11} />
                          <span>{leadData.email}</span>
                        </a>
                      </>
                    )}

                    {isCompleted && item.completed_at && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          Finished: {formatCompletedDate(item.completed_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions Button Group */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0,
                  }}
                >
                  {/* Lead Details Drawer Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.lead) {
                        setSelectedLead(item.lead)
                      } else if (item.lead_id) {
                        leadService.fetchLeadById(item.lead_id).then((res) => {
                          if (res.data) setSelectedLead(res.data)
                        })
                      }
                    }}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.45rem 0.75rem',
                      backgroundColor: '#ffffff',
                    }}
                    title="View student profile and inquiry details"
                  >
                    <span>Lead Details</span>
                    <ArrowUpRight size={14} />
                  </button>

                  {/* Pending Task Action: Mark Done & Cancel */}
                  {!isCompleted && item.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCancelTask(item.id)}
                        className="btn btn-ghost"
                        style={{
                          fontSize: '0.8125rem',
                          padding: '0.45rem 0.65rem',
                          color: '#94a3b8',
                        }}
                        disabled={isProcessing}
                        title="Cancel task"
                      >
                        <Ban size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleMarkComplete(item.id, leadData.full_name)
                        }
                        className="btn btn-primary"
                        style={{
                          fontSize: '0.8125rem',
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#059669',
                          borderColor: '#047857',
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span>Updating...</span>
                        ) : (
                          <>
                            <Check size={15} strokeWidth={2.5} />
                            <span>Mark Done</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleSubmit}
      />

      {/* Embedded Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLeadFromDrawer}
      />
    </div>
  )
}
