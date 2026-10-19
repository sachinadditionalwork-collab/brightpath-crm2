import { useState, useEffect } from 'react'
import { X, AlertTriangle, ShieldAlert } from 'lucide-react'

export default function LostReasonModal({ isOpen, onClose, onConfirm, studentName }) {
  const [reasonCategory, setReasonCategory] = useState('Course fee / budget constraint')
  const [customExplanation, setCustomExplanation] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const [shake, setShake] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg(null)

    const finalReason = customExplanation.trim()
      ? `${reasonCategory}: ${customExplanation.trim()}`
      : reasonCategory

    if (!finalReason.trim()) {
      triggerError('A reason is mandatory when marking an inquiry as Lost.')
      return
    }

    onConfirm(finalReason)
    setCustomExplanation('')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className={`card animate-slide-up ${shake ? 'animate-error-shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #fee2e2',
            backgroundColor: '#fff5f5',
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
                backgroundColor: '#fee2e2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#9f1239' }}>
                Reason for Lost Inquiry
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#be123c' }}>
                Required for conversion analytics & pipeline reporting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', color: '#be123c' }}
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
                marginBottom: '1rem',
              }}
            >
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Please select why the inquiry for <strong>{studentName || 'this student'}</strong> is being closed as <strong>Lost</strong>:
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Primary Reason Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
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
              <option value="Course fee / budget constraint">Course fee / budget constraint</option>
              <option value="Batch timing / schedule mismatch">Batch timing / schedule mismatch</option>
              <option value="Relocation / distance issue">Relocation / distance issue</option>
              <option value="Joined competitor institute">Joined competitor institute</option>
              <option value="Not eligible for prerequisites">Not eligible for prerequisites</option>
              <option value="Personal / family circumstances">Personal / family circumstances</option>
              <option value="Other">Other specific reason</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Additional Explanation / Context
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Student preferred offline weekend batches, but only online is currently available..."
              value={customExplanation}
              onChange={(e) => setCustomExplanation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
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
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: '#e11d48',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              Mark Inquiry as Lost
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
