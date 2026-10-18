import { useState } from 'react'
import {
  Plus,
  Search,
  Download,
  Phone,
  Mail,
  MoreVertical,
} from 'lucide-react'

export default function LeadsView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Sample lead rows showcasing Phase 1 UI presentation
  const demoLeads = [
    {
      id: '1',
      name: 'Rohan Mehra',
      phone: '+91 98765 43210',
      email: 'rohan.m@example.com',
      course: 'Data Science & AI',
      source: 'Website',
      status: 'New',
      statusClass: 'badge-new',
      assignee: 'Anjali Gupta',
      createdAt: 'Today, 10:30 AM',
    },
    {
      id: '2',
      name: 'Sneha Rao',
      phone: '+91 98234 56789',
      email: 'sneha.rao@example.com',
      course: 'Full Stack Development',
      source: 'Walk-in',
      status: 'Contacted',
      statusClass: 'badge-contacted',
      assignee: 'Vikram Singh',
      createdAt: 'Yesterday',
    },
    {
      id: '3',
      name: 'Aarav Sharma',
      phone: '+91 97123 45678',
      email: 'aarav.s@example.com',
      course: 'Cloud Engineering',
      source: 'Referral',
      status: 'Qualified',
      statusClass: 'badge-qualified',
      assignee: 'Anjali Gupta',
      createdAt: '2 days ago',
    },
    {
      id: '4',
      name: 'Priya Patel',
      phone: '+91 99887 76655',
      email: 'priya.p@example.com',
      course: 'UI/UX Design',
      source: 'Social Media',
      status: 'Converted',
      statusClass: 'badge-converted',
      assignee: 'Vikram Singh',
      createdAt: '4 days ago',
    },
  ]

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Leads</h1>
          <p className="page-subtitle">
            Manage inquiries, assign counsellors, and track student admissions pipeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button type="button" className="btn btn-secondary">
            <Download size={15} />
            <span>Export</span>
          </button>
          <button type="button" className="btn btn-primary" id="btn-create-lead-main">
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '380px',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search student name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New Inquiries</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Showing <strong>{demoLeads.length}</strong> inquiries
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.85rem 1.25rem' }}>Student Profile</th>
                <th style={{ padding: '0.85rem 1rem' }}>Course Interest</th>
                <th style={{ padding: '0.85rem 1rem' }}>Source</th>
                <th style={{ padding: '0.85rem 1rem' }}>Pipeline Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned To</th>
                <th style={{ padding: '0.85rem 1rem' }}>Created</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demoLeads.map((lead) => (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.name}</div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginTop: '2px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={11} /> {lead.phone}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Mail size={11} /> {lead.email}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                      }}
                    >
                      {lead.course}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1rem', color: '#64748b' }}>{lead.source}</td>
                  <td style={{ padding: '1rem 1rem' }}>
                    <span className={`status-badge ${lead.statusClass}`}>
                      <span className="status-dot" />
                      <span>{lead.status}</span>
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: '#334155',
                        }}
                      >
                        {lead.assignee.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#334155' }}>
                        {lead.assignee}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                    {lead.createdAt}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '0.4rem' }}
                      title="Lead Options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
