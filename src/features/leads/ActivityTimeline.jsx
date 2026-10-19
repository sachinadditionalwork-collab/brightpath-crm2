import { useState, useEffect } from 'react'
import {
  History,
  Sparkles,
  GitCommit,
  FileText,
  CalendarPlus,
  CheckCircle2,
  UserCheck,
  Send,
  AlertCircle,
  Tag,
} from 'lucide-react'
import { activityService } from '../../services/activityService'
import { useAuth } from '../../hooks/useAuth'

// Top-level pure date formatter conforming to React 19 purity rules
function formatActivityTimestamp(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
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

// Activity type configuration dictionary
const ACTIVITY_CONFIG = {
  lead_created: {
    label: 'Inquiry Registered',
    icon: Sparkles,
    bg: '#eff6ff',
    border: '#bfdbfe',
    color: '#2563eb',
  },
  status_changed: {
    label: 'Pipeline Stage Updated',
    icon: GitCommit,
    bg: '#f5f3ff',
    border: '#ddd6fe',
    color: '#7c3aed',
  },
  note_added: {
    label: 'Counseling Note',
    icon: FileText,
    bg: '#f0f9ff',
    border: '#bae6fd',
    color: '#0284c7',
  },
  followup_scheduled: {
    label: 'Follow-up Scheduled',
    icon: CalendarPlus,
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#d97706',
  },
  followup_completed: {
    label: 'Follow-up Completed',
    icon: CheckCircle2,
    bg: '#ecfdf5',
    border: '#a7f3d0',
    color: '#059669',
  },
  lead_reassigned: {
    label: 'Lead Reassigned',
    icon: UserCheck,
    bg: '#eef2ff',
    border: '#c7d2fe',
    color: '#4f46e5',
  },
}

export default function ActivityTimeline({ leadId }) {
  const { user, profile } = useAuth()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!leadId) return
    let isMounted = true

    const loadActivities = () => {
      activityService.fetchActivities(leadId).then((res) => {
        if (isMounted) {
          if (res.error) setError(res.error)
          else setActivities(res.data)
          setIsLoading(false)
        }
      })
    }

    loadActivities()

    const handleActivitiesChanged = (e) => {
      if (!e.detail?.leadId || e.detail.leadId === leadId) {
        loadActivities()
      }
    }

    window.addEventListener('brightpath:activities_changed', handleActivitiesChanged)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:activities_changed', handleActivitiesChanged)
    }
  }, [leadId])

  const handleAddQuickNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim() || isSubmitting) return

    setIsSubmitting(true)
    const res = await activityService.addNote(leadId, newNote.trim(), profile || user)
    setIsSubmitting(false)

    if (!res.error) {
      setNewNote('')
      // Refresh list
      const r = await activityService.fetchActivities(leadId)
      if (r.data) setActivities(r.data)
    }
  }

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={16} color="#2563eb" />
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#475569',
              letterSpacing: '0.05em',
            }}
          >
            Audit & Interaction Timeline
          </div>
        </div>

        <span
          style={{
            fontSize: '0.6875rem',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          {activities.length} {activities.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {/* Quick Add Note Form */}
      <form
        onSubmit={handleAddQuickNote}
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          placeholder="Log interaction note (e.g. Phone discussion, campus tour, fee query)..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8125rem',
            outline: 'none',
            backgroundColor: '#ffffff',
          }}
        />
        <button
          type="submit"
          disabled={!newNote.trim() || isSubmitting}
          className="btn btn-primary"
          style={{
            fontSize: '0.75rem',
            padding: '0.45rem 0.85rem',
            flexShrink: 0,
          }}
        >
          <Send size={13} />
          <span>{isSubmitting ? 'Saving...' : 'Log Note'}</span>
        </button>
      </form>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '0.625rem 0.85rem',
            borderRadius: '6px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1rem',
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline Stream */}
      {isLoading ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              borderTopColor: '#2563eb',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 0.5rem',
            }}
          />
          <span style={{ fontSize: '0.75rem' }}>Loading interaction history...</span>
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            padding: '1.5rem 1rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            No activities recorded yet for this student lead.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Stage changes, counseling calls, and logged notes will create an immutable audit trail here.
          </p>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            paddingLeft: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '11px',
              width: '2px',
              backgroundColor: '#e2e8f0',
            }}
          />

          {/* Timeline Event Items */}
          {activities.map((act) => {
            const config = ACTIVITY_CONFIG[act.activity_type] || {
              label: 'Lead Activity',
              icon: History,
              bg: '#f1f5f9',
              border: '#e2e8f0',
              color: '#475569',
            }
            const Icon = config.icon
            const actorName = act.actor_profile?.full_name || 'Staff Member'
            const roleName = act.actor_profile?.role || 'Staff'

            return (
              <div
                key={act.id}
                className="animate-slide-up"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {/* Node Circle */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: config.bg,
                    border: `1.5px solid ${config.border}`,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <Icon size={12} strokeWidth={2.2} />
                </div>

                {/* Event Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>•</span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      {actorName} ({roleName})
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#94a3b8',
                      fontWeight: 500,
                    }}
                  >
                    {formatActivityTimestamp(act.created_at)}
                  </span>
                </div>

                {/* Event Description Card */}
                <div
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.8125rem',
                    color: '#334155',
                    lineHeight: 1.45,
                  }}
                >
                  <div>{act.description}</div>

                  {/* Metadata Tags if available */}
                  {act.metadata && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.35rem',
                        marginTop: '0.35rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {act.metadata.old_status && act.metadata.new_status && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Tag size={10} />
                          <span>
                            {act.metadata.old_status} → {act.metadata.new_status}
                          </span>
                        </span>
                      )}

                      {act.metadata.lost_reason && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#fff1f2',
                            color: '#be123c',
                            fontWeight: 500,
                          }}
                        >
                          Reason: {act.metadata.lost_reason}
                        </span>
                      )}

                      {act.metadata.source && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 500,
                          }}
                        >
                          Source: {act.metadata.source}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
