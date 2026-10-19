import { useState, useEffect } from 'react'
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Code2,
  FileText,
  KeyRound,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { checkSupabaseHealth, getSupabaseDetails } from '../../lib/supabaseClient'

export default function SetupGuideView() {
  const [activeTab, setActiveTab] = useState('ENV')
  const [copiedKey, setCopiedKey] = useState(null)
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    isConfigured: false,
    message: 'Testing connection...',
    latencyMs: 0,
  })

  const details = getSupabaseDetails()

  const runCheck = async () => {
    setHealthStatus((prev) => ({ ...prev, loading: true }))
    const result = await checkSupabaseHealth()
    setHealthStatus({
      loading: false,
      connected: result.connected,
      isConfigured: result.isConfigured,
      needsMigration: result.needsMigration,
      message: result.message,
      latencyMs: result.latencyMs,
    })
  }

  // Run initial health check on mount asynchronously without synchronous setState
  useEffect(() => {
    let isMounted = true
    checkSupabaseHealth().then((result) => {
      if (isMounted) {
        setHealthStatus({
          loading: false,
          connected: result.connected,
          isConfigured: result.isConfigured,
          needsMigration: result.needsMigration,
          message: result.message,
          latencyMs: result.latencyMs,
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const envSample = `# BrightPath CRM — Local Environment Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-public-client-key`

  const migrationSummary = `-- 1. Tables created: profiles, leads, follow_ups, activities
-- 2. Security helper: public.get_user_role() (Prevents RLS infinite recursion)
-- 3. Row-Level Security (RLS): Enabled on all 4 tables
-- 4. Triggers: Auto-create profile on signup & auto-update timestamps
-- (See full schema in supabase/migrations/20261018_crm_core_schema.sql)`

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Database size={18} />
            </div>
            <h1 className="page-title" style={{ fontSize: '1.35rem' }}>
              Database Diagnostics & Setup Guide
            </h1>
          </div>
          <p className="page-subtitle">
            Configure your Supabase PostgreSQL cluster, run schema migrations, and verify live connectivity.
          </p>
        </div>

        <Link to="/" className="btn btn-secondary">
          <span>Back to App</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Live Health Status Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderLeft: healthStatus.connected ? '4px solid #10b981' : '4px solid #f59e0b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: healthStatus.connected ? '#ecfdf5' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: healthStatus.connected ? '#059669' : '#d97706',
              flexShrink: 0,
            }}
          >
            {healthStatus.connected ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                {healthStatus.connected
                  ? 'Supabase Connected & Healthy'
                  : 'Supabase Connection Pending'}
              </span>
              {healthStatus.connected && (
                <span className="status-badge badge-converted">
                  <span className="status-dot" />
                  <span>{healthStatus.latencyMs}ms latency</span>
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
              {healthStatus.message}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={runCheck}
          className="btn btn-secondary"
          disabled={healthStatus.loading}
          style={{ padding: '0.5rem 0.85rem' }}
        >
          <RefreshCw
            size={14}
            className={healthStatus.loading ? 'animate-spin' : ''}
          />
          <span>{healthStatus.loading ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Setup Step Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { id: 'ENV', label: '1. Environment Variables', icon: KeyRound },
          { id: 'SCHEMA', label: '2. Schema Migration SQL', icon: Code2 },
          { id: 'SEED', label: '3. Demo Seed Data', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon
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
                marginBottom: '-1px',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Environment Variables */}
      {activeTab === 'ENV' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Local Environment File (.env)
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Create a file named <code>.env</code> in your project root with your project credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(envSample, 'env')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
            >
              {copiedKey === 'env' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedKey === 'env' ? 'Copied Template!' : 'Copy Template'}</span>
            </button>
          </div>

          <pre
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#090d16',
              color: '#38bdf8',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
              border: '1px solid #1e293b',
              lineHeight: 1.6,
            }}
          >
            {envSample}
          </pre>

          {/* Current Configuration State Inspector */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#334155', marginBottom: '0.5rem' }}>
              Current Runtime Detection:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>VITE_SUPABASE_URL:</span>
                <code style={{ color: details.url ? '#0f172a' : '#ef4444' }}>
                  {details.url || 'Not detected (Missing in .env)'}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>VITE_SUPABASE_ANON_KEY:</span>
                <code style={{ color: details.hasAnonKey ? '#0f172a' : '#ef4444' }}>
                  {details.maskedKey || 'Not detected (Missing in .env)'}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schema Migration SQL */}
      {activeTab === 'SCHEMA' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                PostgreSQL Schema & Row-Level Security
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Execute this migration once in your <strong>Supabase Dashboard &gt; SQL Editor</strong>.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/_/sql"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              color: '#334155',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="#2563eb" />
              <span>Full SQL Migration File Available in Repository:</span>
            </div>
            <code>supabase/migrations/20261018_crm_core_schema.sql</code>
          </div>

          <pre
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#090d16',
              color: '#cbd5e1',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
              border: '1px solid #1e293b',
              lineHeight: 1.6,
            }}
          >
            {migrationSummary}
          </pre>
        </div>
      )}

      {/* Tab 3: Demo Seed Data */}
      {activeTab === 'SEED' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Workshop Sample Inquiries & Follow-ups
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Populates 5 prospective student inquiries with overdue and scheduled follow-ups.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.8125rem',
              color: '#334155',
            }}
          >
            <p>
              The seed data script is saved at <code>supabase/seed.sql</code>. Run it in the Supabase SQL editor
              after creating at least one user account so sample records can be linked to your profile!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
