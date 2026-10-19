import React from 'react'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('BrightPath CRM Error Boundary caught an unhandled error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.href = '/'
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090d16',
            color: '#ffffff',
            padding: '2rem',
            fontFamily: 'Inter, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  Application Notice
                </h1>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  A runtime exception was intercepted by BrightPath Recovery Guard.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.8125rem',
                color: '#f87171',
                fontFamily: 'monospace',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                maxHeight: '140px',
              }}
            >
              {this.state.error?.message || 'Unknown application error'}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
                <span>Reset Sandbox Cache</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
