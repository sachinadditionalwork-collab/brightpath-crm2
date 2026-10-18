import { useState } from 'react'
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, Lock, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleDemoSignIn = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 600)
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
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
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
            Clarity, velocity & accountability for every student inquiry.
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '1rem', lineHeight: 1.6 }}>
            Consolidate inquiries across website, phone calls, walk-ins, and referrals into a
            structured pipeline with automated overdue follow-up tracking.
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
          <span>Secured via PostgreSQL Row-Level Security</span>
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
        <div style={{ maxWidth: '400px', width: '100%' }} className="animate-slide-up">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Sign In to CRM
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Enter your counselor or staff credentials to access the workspace.
            </p>
          </div>

          <form onSubmit={handleDemoSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Email Address
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                fontSize: '0.9375rem',
              }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid #334155',
              fontSize: '0.8125rem',
              color: '#94a3b8',
              textAlign: 'center',
            }}
          >
            <span>Phase 1 Sandbox active. Live Supabase Auth connects in Phase 3.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
