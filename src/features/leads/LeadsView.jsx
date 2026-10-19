import { useState } from 'react'
import {
  Plus,
  Download,
  Phone,
  Mail,
  MoreVertical,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useLeads } from '../../hooks/useLeads'
import CreateLeadModal from './CreateLeadModal'
import LeadFilters from './LeadFilters'

// Deterministic timestamp formatter conforming to React 19 purity rules
function formatTimestamp(isoDate) {
  if (!isoDate) return 'Just now'
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Recently'
  }
}

export default function LeadsView() {
  const {
    leads,
    totalCount,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    createLead,
  } = useLeads()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState(null)

  const handleCreateLead = async (leadPayload) => {
    const result = await createLead(leadPayload)
    if (result.success) {
      setSuccessToast(`Lead for ${leadPayload.full_name} created successfully!`)
      setTimeout(() => setSuccessToast(null), 3500)
    }
    return result
  }

  // Format status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return (
          <span className="status-badge badge-new">
            <span className="status-dot" />
            <span>New Inquiry</span>
          </span>
        )
      case 'Contacted':
        return (
          <span className="status-badge badge-contacted">
            <span className="status-dot" />
            <span>Contacted</span>
          </span>
        )
      case 'Qualified':
        return (
          <span className="status-badge badge-qualified">
            <span className="status-dot" />
            <span>Qualified</span>
          </span>
        )
      case 'Converted':
        return (
          <span className="status-badge badge-converted">
            <span className="status-dot" />
            <span>Converted</span>
          </span>
        )
      case 'Lost':
        return (
          <span className="status-badge badge-lost">
            <span className="status-dot" />
            <span>Lost</span>
          </span>
        )
      default:
        return <span className="status-badge">{status}</span>
    }
  }

  // Pagination metrics
  const totalPages = Math.ceil(totalCount / filters.pageSize) || 1

  return (
    <div className="animate-slide-up">
      {/* Success Feedback Toast */}
      {successToast && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 110,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            id="btn-create-lead-main"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <LeadFilters
        filters={filters}
        onSearchChange={(val) => setFilter('search', val)}
        onStatusChange={(val) => setFilter('status', val)}
        onSourceChange={(val) => setFilter('source', val)}
        onResetFilters={resetFilters}
        totalResults={totalCount}
      />

      {/* Error Alert if any */}
      {error && (
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
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table Container */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading prospective student inquiries...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <Users size={24} />
            </div>
            <div className="empty-title">No student leads found</div>
            <div className="empty-description">
              {filters.search || filters.status !== 'ALL' || filters.source !== 'ALL'
                ? 'No inquiries match your current search and filter settings. Try resetting your filters.'
                : 'No student inquiries have been registered yet. Create your first student lead to get started.'}
            </div>
            {filters.search || filters.status !== 'ALL' || filters.source !== 'ALL' ? (
              <button type="button" onClick={resetFilters} className="btn btn-secondary">
                Reset All Filters
              </button>
            ) : (
              <button type="button" onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                <Plus size={16} />
                <span>Register First Student Lead</span>
              </button>
            )}
          </div>
        ) : (
          <>
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
                    <th style={{ padding: '0.85rem 1rem' }}>Course of Interest</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Source</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Pipeline Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Assigned Counselor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Created</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Student Profile Info */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.full_name}</div>
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
                          <a
                            href={`tel:${lead.phone}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#2563eb' }}
                          >
                            <Phone size={11} /> {lead.phone}
                          </a>
                          {lead.email && (
                            <>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Mail size={11} /> {lead.email}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                          }}
                        >
                          {lead.course_interest}
                        </span>
                      </td>

                      {/* Source */}
                      <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                        {lead.source}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1rem' }}>
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
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
                            {(lead.assigned_to_profile?.full_name || 'Staff').charAt(0)}
                          </div>
                          <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 500 }}>
                            {lead.assigned_to_profile?.full_name || 'Staff Member'}
                          </span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '1rem 1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatTimestamp(lead.created_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '0.4rem', color: '#64748b' }}
                          title="Options"
                          aria-label="Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                color: '#64748b',
              }}
            >
              <div>
                Page <strong>{filters.page}</strong> of <strong>{totalPages}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                  disabled={filters.page <= 1}
                  onClick={() => setFilter('page', filters.page - 1)}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                  disabled={filters.page >= totalPages}
                  onClick={() => setFilter('page', filters.page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Dialog */}
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateLead={handleCreateLead}
      />
    </div>
  )
}
