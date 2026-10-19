import { useState } from 'react'
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
} from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function LoginView() {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [shake, setShake] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = location.state?.from?.pathname || '/'

  const triggerError = (msg) => {
    setLocalError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password) {
      triggerError('Please enter both your email address and password.')
      return
    }

    if (password.length < 6) {
      triggerError('Password must contain at least 6 characters.')
      return
    }

    if (isRegisterMode && !fullName.trim()) {
      triggerError('Please provide your full name to register.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isRegisterMode) {
        const result = await signUp(email, password, fullName)
        if (!result.success) {
          triggerError(result.error || 'Failed to create account.')
          setIsSubmitting(false)
          return
        }
      } else {
        const result = await signIn(email, password)
        if (!result.success) {
          triggerError(result.error || 'Invalid email or password.')
          setIsSubmitting(false)
          return
        }
      }

      navigate(destination, { replace: true })
    } catch (err) {
      triggerError(err.message || 'An unexpected authentication error occurred.')
      setIsSubmitting(false)
    }
  }

  const fillQuickDemo = (demoEmail, demoPassword = 'password123') => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setLocalError(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#090d16',
        color: '#ffffff',
      }}
    >
      {/* Left Brand Showcase Section */}
      <div
        style={{
          flex: 1.1,
          padding: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'radial-gradient(ellipse at top left, #1e293b 0%, #090d16 70%)',
          borderRight: '1px solid #1e293b',
        }}
        className="login-showcase-desktop"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            BrightPath Academy
          </span>
        </div>

        <div style={{ maxWidth: '480px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={14} />
            <span>Admissions Operations Platform</span>
          </div>

          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Clarity, velocity & accountability for student inquiries.
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '1rem', lineHeight: 1.6 }}>
            Consolidate inquiries across website, phone calls, walk-ins, and referrals into a
            structured pipeline with automated follow-up tracking and role-based permissions.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '2.5rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid #1e293b',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#60a5fa' }}>
                100%
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
                Inquiry Follow-up Visibility
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid #1e293b',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#34d399' }}>
                Zero
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>
                Forgotten Consultations
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8125rem' }}>
          <ShieldCheck size={16} color="#34d399" />
          <span>PostgreSQL Row-Level Security Enforced</span>
        </div>
      </div>

      {/* Right Login Console Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: '#0f172a',
        }}
      >
        <div
          style={{ maxWidth: '400px', width: '100%' }}
          className={`animate-slide-up ${shake ? 'animate-error-shake' : ''}`}
        >
          {/* Status Indicator Banner */}
          {!isSupabaseConfigured && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
              }}
            >
              <Database size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block' }}>Sandbox Auth Active</strong>
                <span>Supabase is unconfigured. Quick-fill credentials below to test all roles, or </span>
                <Link to="/setup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
                  configure .env
                </Link>.
              </div>
            </div>
          )}

          {/* Form Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {isRegisterMode ? 'Create Counselor Account' : 'Sign In to BrightPath'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              {isRegisterMode
                ? 'Join your institute workspace to manage admissions.'
                : 'Enter your credentials to access your student leads.'}
            </p>
          </div>

          {/* Error Alert Box */}
          {localError && (
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
              <span>{localError}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name Field (Register Mode Only) */}
            {isRegisterMode && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                  />
                  <input
                    type="text"
                    placeholder="Anjali Gupta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Institutional Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                />
                <input
                  type="email"
                  placeholder="counsellor@brightpath.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.25rem 0.625rem 2.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                fontSize: '0.9375rem',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Complete Registration' : 'Sign In to Workspace'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Toggle */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>
            {isRegisterMode ? (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setLocalError(null) }}
                  style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New counselor?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setLocalError(null) }}
                  style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Create an account
                </button>
              </span>
            )}
          </div>

          {/* Quick Demo Switcher Bar */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid #1e293b',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Fill Demo Accounts:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { role: 'Counsellor', email: 'counsellor@brightpath.edu' },
                { role: 'Manager', email: 'manager@brightpath.edu' },
                { role: 'Admin', email: 'admin@brightpath.edu' },
              ].map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillQuickDemo(account.email)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#e2e8f0',
                  }}
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
