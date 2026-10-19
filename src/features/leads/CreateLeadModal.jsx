import { useState, useEffect } from 'react'
import { X, UserPlus, Phone, Mail, BookOpen, Share2, FileText, AlertCircle } from 'lucide-react'

export default function CreateLeadModal({ isOpen, onClose, onCreateLead }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [courseInterest, setCourseInterest] = useState('Data Science & AI')
  const [source, setSource] = useState('Website')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [shake, setShake] = useState(false)

  // Close on Escape key
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    // Validation
    if (!fullName.trim()) {
      triggerError('Please enter the student\'s full name.')
      return
    }

    // Clean phone validation (at least 10 digits)
    const cleanedPhone = phone.replace(/[^0-9+]/g, '')
    if (cleanedPhone.length < 10) {
      triggerError('Please enter a valid phone number with at least 10 digits.')
      return
    }

    // Email regex validation if email was provided
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        triggerError('Please enter a valid email address.')
        return
      }
    }

    setIsSubmitting(true)

    const result = await onCreateLead({
      full_name: fullName.trim(),
      phone: cleanedPhone,
      email: email.trim() || null,
      course_interest: courseInterest,
      source,
      notes: notes.trim() || null,
    })

    if (result.success) {
      // Reset form and close
      setFullName('')
      setPhone('')
      setEmail('')
      setNotes('')
      setIsSubmitting(false)
      onClose()
    } else {
      triggerError(result.error || 'Failed to create lead. Please try again.')
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
        zIndex: 100,
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
        aria-labelledby="create-lead-modal-title"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: '16px',
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
              <UserPlus size={18} />
            </div>
            <div>
              <h2 id="create-lead-modal-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Register New Student Lead
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Capture inquiry details and assign to counseling pipeline.
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Student Full Name */}
            <div>
              <label htmlFor="create-lead-fullname" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Student Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="create-lead-fullname"
                type="text"
                placeholder="e.g. Rohan Mehra"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="create-lead-phone" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={15}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  id="create-lead-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="create-lead-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Email Address <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  id="create-lead-email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Course Interest */}
            <div>
              <label htmlFor="create-lead-course" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Course of Interest <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <BookOpen
                  size={15}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <select
                  id="create-lead-course"
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="Cloud Engineering">Cloud Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Executive MBA">Executive MBA</option>
                </select>
              </div>
            </div>

            {/* Lead Source */}
            <div>
              <label htmlFor="create-lead-source" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Inquiry Source <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Share2
                  size={15}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <select
                  id="create-lead-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Website">Website Form</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Walk-in">Campus Walk-in</option>
                  <option value="Referral">Student / Alumni Referral</option>
                  <option value="Social Media">Social Media (LinkedIn / Instagram)</option>
                  <option value="Other">Other Channel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Initial Counseling Notes */}
          <div style={{ marginTop: '1.25rem' }}>
            <label htmlFor="create-lead-notes" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Consultation Notes <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FileText
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#94a3b8' }}
              />
              <textarea
                id="create-lead-notes"
                rows={3}
                placeholder="Key questions asked, preferred batch timing, scholarship inquiries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Registering lead...</span>
              ) : (
                <>
                  <UserPlus size={16} strokeWidth={2.5} />
                  <span>Save Student Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
