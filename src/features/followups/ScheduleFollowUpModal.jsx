import { useState, useEffect } from 'react'
import { X, CalendarPlus, Clock, FileText, AlertCircle } from 'lucide-react'
import { leadService } from '../../services/leadService'

function getDefaultDueAt() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  return new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export default function ScheduleFollowUpModal({
  isOpen,
  onClose,
  onSchedule,
  defaultLead = null,
}) {
  const [leads, setLeads] = useState([])
  const [selectedLeadId, setSelectedLeadId] = useState(defaultLead?.id || '')
  const [dueAt, setDueAt] = useState(() => getDefaultDueAt())
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [shake, setShake] = useState(false)

  // Load leads if opened without a pre-selected lead
  useEffect(() => {
    if (!defaultLead && isOpen) {
      leadService.fetchLeads({ pageSize: 50 }).then((res) => {
        if (res.data) setLeads(res.data)
      })
    }
  }, [defaultLead, isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const triggerError = (msg) => {
    setErrorMsg(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // Quick preset helpers
  const setPresetTime = (daysAhead, hour) => {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    d.setHours(hour, 0, 0, 0)
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setDueAt(localIso)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const leadIdToUse = defaultLead?.id || selectedLeadId
    if (!leadIdToUse) {
      triggerError('Please select a student inquiry to follow up with.')
      return
    }

    if (!dueAt) {
      triggerError('Please specify the scheduled date and time.')
      return
    }

    if (!note.trim()) {
      triggerError('Please enter consultation notes or an agenda for this call.')
      return
    }

    setIsSubmitting(true)

    // Lookup lead metadata if in standalone mode
    const matchedLead = defaultLead || leads.find((l) => l.id === leadIdToUse)

    const result = await onSchedule({
      lead_id: leadIdToUse,
      lead: matchedLead
        ? {
            id: matchedLead.id,
            full_name: matchedLead.full_name,
            phone: matchedLead.phone,
            email: matchedLead.email,
            course_interest: matchedLead.course_interest,
            status: matchedLead.status,
          }
        : null,
      due_at: new Date(dueAt).toISOString(),
      note: note.trim(),
    })

    if (result.success) {
      setNote('')
      setIsSubmitting(false)
      onClose()
    } else {
      triggerError(result.error || 'Failed to schedule follow-up.')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className={`card animate-slide-up modal-responsive ${shake ? 'animate-error-shake' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-followup-modal-title"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarPlus size={18} />
            </div>
            <div>
              <h3 id="schedule-followup-modal-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Schedule Counseling Follow-up
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Set a due date and agenda for the next prospective student call.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', color: '#64748b' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMsg && (
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Lead Selector (if not pre-selected) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="schedule-lead-select" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Prospective Student <span style={{ color: '#ef4444' }}>*</span>
            </label>
            {defaultLead ? (
              <div
                id="schedule-lead-select"
                style={{
                  padding: '0.625rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#0f172a',
                }}
              >
                {defaultLead.full_name} ({defaultLead.course_interest})
              </div>
            ) : (
              <select
                id="schedule-lead-select"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="">-- Choose a Student Lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name} • {l.course_interest} ({l.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date & Time Picker */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label htmlFor="schedule-due-at" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Follow-up Date & Time <span style={{ color: '#ef4444' }}>*</span>
              </label>
            </div>

            <div style={{ position: 'relative' }}>
              <Clock
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                id="schedule-due-at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: '0.25rem' }}>
                Presets:
              </span>
              <button
                type="button"
                onClick={() => setPresetTime(1, 10)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Tomorrow 10 AM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(1, 15)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Tomorrow 3 PM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(2, 11)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(7, 10)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Agenda & Notes */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="schedule-consultation-note" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Consultation Agenda & Notes <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FileText
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#94a3b8' }}
              />
              <textarea
                id="schedule-consultation-note"
                rows={3}
                placeholder="e.g. Call to discuss syllabus details, confirm preferred batch timing, and answer fee questions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Scheduling...</span>
              ) : (
                <>
                  <CalendarPlus size={16} />
                  <span>Confirm Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
