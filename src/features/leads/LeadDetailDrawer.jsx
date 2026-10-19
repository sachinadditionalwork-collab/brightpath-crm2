import { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  Share2,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CalendarCheck,
  Clock,
  Plus,
  Check,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { followUpService } from '../../services/followUpService'
import { activityService } from '../../services/activityService'
import LostReasonModal from './LostReasonModal'
import ScheduleFollowUpModal from '../followups/ScheduleFollowUpModal'
import ActivityTimeline from './ActivityTimeline'

function formatDrawerDueTime(isoString) {
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

export default function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
}) {
  const { isManager, isAdmin, user, profile } = useAuth()
  const [isLostModalOpen, setIsLostModalOpen] = useState(false)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [leadFollowUps, setLeadFollowUps] = useState([])
  const [newNoteText, setNewNoteText] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [completingFuId, setCompletingFuId] = useState(null)

  // Load follow-ups for this lead
  useEffect(() => {
    if (!lead?.id || !isOpen) return
    let isMounted = true

    const loadFollowUps = () => {
      followUpService.fetchFollowUps({ leadId: lead.id }).then((res) => {
        if (isMounted && res.data) {
          setLeadFollowUps(res.data)
        }
      })
    }

    loadFollowUps()
    window.addEventListener('brightpath:followups_changed', loadFollowUps)

    return () => {
      isMounted = false
      window.removeEventListener('brightpath:followups_changed', loadFollowUps)
    }
  }, [lead?.id, isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !lead) return null

  const stages = [
    { id: 'New', label: '1. New' },
    { id: 'Contacted', label: '2. Contacted' },
    { id: 'Qualified', label: '3. Qualified' },
    { id: 'Converted', label: '4. Converted' },
  ]

  const currentStageIndex = stages.findIndex((s) => s.id === lead.status)

  const handleStatusChange = async (targetStatus) => {
    if (targetStatus === 'Lost') {
      setIsLostModalOpen(true)
      return
    }

    setIsUpdating(true)
    await onUpdateLead(lead.id, {
      status: targetStatus,
      lost_reason: null, // Clear lost reason if progressing
    })
    setIsUpdating(false)
  }

  const handleConfirmLost = async (reason) => {
    setIsUpdating(true)
    await onUpdateLead(lead.id, {
      status: 'Lost',
      lost_reason: reason,
    })
    setIsUpdating(false)
  }

  const handleSaveNote = async (e) => {
    e.preventDefault()
    if (!newNoteText.trim()) return

    setIsUpdating(true)
    const noteText = newNoteText.trim()
    const updatedNotes = lead.notes
      ? `${lead.notes}\n\n[${new Date().toLocaleDateString('en-US')}]: ${noteText}`
      : `[${new Date().toLocaleDateString('en-US')}]: ${noteText}`

    await onUpdateLead(lead.id, { notes: updatedNotes })
    await activityService.addNote(lead.id, noteText, profile || user)
    setNewNoteText('')
    setIsUpdating(false)
  }

  const handleReassign = async (newAssigneeName) => {
    setIsUpdating(true)
    await onUpdateLead(lead.id, {
      assigned_to_profile: { id: 'counsellor-reassigned', full_name: newAssigneeName },
    })
    setIsUpdating(false)
  }

  const handleScheduleLeadFollowUp = async (payload) => {
    const res = await followUpService.createFollowUp(payload, profile || user)
    if (!res.error) {
      const r = await followUpService.fetchFollowUps({ leadId: lead.id })
      if (r.data) setLeadFollowUps(r.data)
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  const handleCompleteLeadFollowUp = async (fuId) => {
    setCompletingFuId(fuId)
    await followUpService.completeFollowUp(fuId, profile || user)
    const r = await followUpService.fetchFollowUps({ leadId: lead.id })
    if (r.data) setLeadFollowUps(r.data)
    setCompletingFuId(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 90,
        }}
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div
        className="animate-slide-in-right slide-over-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-detail-drawer-title"
        aria-label={`Lead details for ${lead.full_name}`}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 95,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #cbd5e1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#090d16',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 id="lead-detail-drawer-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                {lead.full_name}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#60a5fa',
                  border: '1px solid #334155',
                  fontWeight: 600,
                }}
              >
                {lead.course_interest}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Inquiry ID: <code>{lead.id.substring(0, 8)}</code> • Registered {new Date(lead.created_at).toLocaleDateString()}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ color: '#94a3b8', padding: '0.4rem' }}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Progression Stepper */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                Pipeline Stage Progression
              </div>
              {lead.status === 'Lost' ? (
                <span className="status-badge badge-lost">
                  <AlertTriangle size={12} />
                  <span>Inquiry Lost</span>
                </span>
              ) : (
                <span className={`status-badge badge-${lead.status.toLowerCase()}`}>
                  <span>Current: {lead.status}</span>
                </span>
              )}
            </div>

            {/* Stepper Steps */}
            {lead.status !== 'Lost' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '1rem' }}>
                {stages.map((stg, idx) => {
                  const isCurrent = lead.status === stg.id
                  const isPassed = currentStageIndex > idx

                  return (
                    <button
                      key={stg.id}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(stg.id)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        transition: 'all 150ms ease',
                        backgroundColor: isCurrent
                          ? '#2563eb'
                          : isPassed
                          ? '#ecfdf5'
                          : '#f1f5f9',
                        color: isCurrent
                          ? '#ffffff'
                          : isPassed
                          ? '#047857'
                          : '#64748b',
                        border: isCurrent
                          ? '1px solid #1d4ed8'
                          : isPassed
                          ? '1px solid #a7f3d0'
                          : '1px solid #e2e8f0',
                      }}
                    >
                      {stg.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              /* If Lost: Banner with Reason */
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#9f1239',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={15} />
                  <span>Marked as Lost</span>
                </div>
                <div style={{ fontSize: '0.8125rem', marginTop: '0.35rem', color: '#be123c' }}>
                  <strong>Reason:</strong> {lead.lost_reason || 'No specific reason recorded.'}
                </div>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Contacted')}
                  className="btn btn-secondary"
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reopen Inquiry</span>
                </button>
              </div>
            )}

            {/* Stage Quick Advance Action Buttons */}
            {lead.status !== 'Lost' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {lead.status === 'New' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Contacted')}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.8125rem' }}
                    disabled={isUpdating}
                  >
                    <span>Mark Contacted</span>
                  </button>
                )}
                {lead.status === 'Contacted' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Qualified')}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.8125rem', backgroundColor: '#d97706' }}
                    disabled={isUpdating}
                  >
                    <span>Qualify Candidate</span>
                  </button>
                )}
                {lead.status === 'Qualified' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Converted')}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.8125rem', backgroundColor: '#059669' }}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirm Admission Won</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLostModalOpen(true)}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8125rem', color: '#be123c' }}
                  disabled={isUpdating}
                >
                  <span>Mark Lost...</span>
                </button>
              </div>
            )}
          </div>

          {/* Student Profile & Contact Info */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Student Contact Information
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Phone Number:</span>
                <a
                  href={`tel:${lead.phone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  <Phone size={14} />
                  <span>{lead.phone}</span>
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Email Address:</span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    <Mail size={14} />
                    <span>{lead.email}</span>
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Not provided</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Inquiry Source:</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155', fontWeight: 500, fontSize: '0.8125rem' }}>
                  <Share2 size={13} color="#64748b" />
                  <span>{lead.source}</span>
                </span>
              </div>

              {/* Counselor Assignment */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Assigned Counselor:</span>
                {isManager || isAdmin ? (
                  <select
                    value={lead.assigned_to_profile?.full_name || 'Anjali Gupta'}
                    onChange={(e) => handleReassign(e.target.value)}
                    style={{
                      padding: '0.3rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="Anjali Gupta">Anjali Gupta (Counsellor)</option>
                    <option value="Vikram Singh">Vikram Singh (Manager)</option>
                    <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Admin)</option>
                  </select>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}>
                    <UserCheck size={14} color="#059669" />
                    <span>{lead.assigned_to_profile?.full_name || 'Staff Member'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scheduled Follow-ups Section */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={16} color="#2563eb" />
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                  Scheduled Follow-ups
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                <Plus size={13} />
                <span>Schedule</span>
              </button>
            </div>

            {leadFollowUps.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                  No follow-ups scheduled for this student.
                </p>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', marginTop: '0.5rem' }}
                >
                  <Plus size={13} />
                  <span>Set Follow-up Due Date</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {leadFollowUps.map((fu) => {
                  const isFuOverdue = fu.status === 'pending' && new Date(fu.due_at) < new Date()
                  const isFuDone = fu.status === 'completed'

                  return (
                    <div
                      key={fu.id}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: isFuDone ? '#f0fdf4' : isFuOverdue ? '#fff1f2' : '#f8fafc',
                        border: isFuDone
                          ? '1px solid #bbf7d0'
                          : isFuOverdue
                          ? '1px solid #fecdd3'
                          : '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <Clock size={13} color={isFuOverdue ? '#e11d48' : '#64748b'} />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: isFuOverdue ? '#be123c' : '#0f172a',
                            }}
                          >
                            {formatDrawerDueTime(fu.due_at)}
                          </span>
                          {isFuOverdue && (
                            <span className="status-badge badge-lost" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                              Overdue
                            </span>
                          )}
                          {isFuDone && (
                            <span className="status-badge badge-converted" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                              Completed
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                          {fu.note}
                        </p>
                      </div>

                      {fu.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCompleteLeadFollowUp(fu.id)}
                          className="btn btn-primary"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.6rem',
                            backgroundColor: '#059669',
                            flexShrink: 0,
                          }}
                          disabled={completingFuId === fu.id}
                        >
                          <Check size={13} />
                          <span>Done</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Consultation Notes Section */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FileText size={16} color="#2563eb" />
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                Counseling Interaction Notes
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.8125rem',
                color: '#334155',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                minHeight: '60px',
                marginBottom: '1rem',
              }}
            >
              {lead.notes || 'No consultation notes registered yet.'}
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type a new update note and press Enter..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={!newNoteText.trim() || isUpdating}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  <span>Append Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit & Interaction Timeline */}
          <ActivityTimeline leadId={lead.id} />
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} color="#2563eb" />
            <span>Audit trail auto-logged to PostgreSQL activities</span>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem' }}>
            Close Drawer
          </button>
        </div>
      </div>

      {/* Schedule Follow-up Modal for Lead */}
      <ScheduleFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSchedule={handleScheduleLeadFollowUp}
        defaultLead={lead}
      />

      {/* Mandatory Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        onConfirm={handleConfirmLost}
        studentName={lead.full_name}
      />
    </>
  )
}
