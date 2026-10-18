import { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FollowUpsView() {
  const [activeTab, setActiveTab] = useState('OVERDUE')

  const tabs = [
    { id: 'OVERDUE', label: 'Overdue', count: 1, urgent: true },
    { id: 'TODAY', label: 'Due Today', count: 1, urgent: false },
    { id: 'UPCOMING', label: 'Upcoming', count: 3, urgent: false },
    { id: 'COMPLETED', label: 'Completed', count: 8, urgent: false },
  ]

  const sampleFollowups = [
    {
      id: 'f1',
      studentName: 'Aarav Sharma',
      course: 'Data Science & AI',
      dueTime: 'Yesterday, 4:00 PM',
      note: 'Requested syllabus PDF and course fee structure. Follow up regarding batch timing.',
      assignee: 'Anjali Gupta',
      isOverdue: true,
    },
  ]

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Task Center</h1>
          <p className="page-subtitle">
            Stay on schedule with prospective student calls, counseling sessions, and campus visits.
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Tabs Bar */}
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
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: tab.urgent ? '#ffe4e6' : isActive ? '#dbeafe' : '#f1f5f9',
                  color: tab.urgent ? '#e11d48' : isActive ? '#1d4ed8' : '#64748b',
                }}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Follow-up Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sampleFollowups.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1.5rem',
              borderLeft: item.isOverdue ? '4px solid #f43f5e' : '4px solid #3b82f6',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                  {item.studentName}
                </span>
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
                  {item.course}
                </span>
                {item.isOverdue && (
                  <span className="status-badge badge-lost">
                    <AlertTriangle size={12} />
                    <span>Action Overdue</span>
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.5rem', lineHeight: 1.5 }}>
                {item.note}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginTop: '0.75rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color={item.isOverdue ? '#e11d48' : '#64748b'} />
                  <strong style={{ color: item.isOverdue ? '#e11d48' : '#0f172a' }}>
                    {item.dueTime}
                  </strong>
                </span>
                <span>•</span>
                <span>Assigned to: <strong>{item.assignee}</strong></span>
              </div>
            </div>

            {/* Task Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/leads"
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
              >
                <span>Lead Details</span>
                <ArrowUpRight size={14} />
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#059669',
                }}
              >
                <CheckCircle2 size={15} />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
