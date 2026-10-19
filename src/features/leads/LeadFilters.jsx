import { Search, X, RotateCcw } from 'lucide-react'

export default function LeadFilters({
  filters,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onResetFilters,
  totalResults,
}) {
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== 'ALL' ||
    filters.source !== 'ALL'

  return (
    <div
      className="card"
      style={{
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
        {/* Search Input Box with Clear button */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
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
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2rem 0.5rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
            }}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <select
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontWeight: 500,
            fontSize: '0.875rem',
            outline: 'none',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="New">New Inquiries</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>

        {/* Source Filter Dropdown */}
        <select
          value={filters.source}
          onChange={(e) => onSourceChange(e.target.value)}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontWeight: 500,
            fontSize: '0.875rem',
            outline: 'none',
          }}
        >
          <option value="ALL">All Sources</option>
          <option value="Website">Website Form</option>
          <option value="Phone Call">Phone Call</option>
          <option value="Walk-in">Campus Walk-in</option>
          <option value="Referral">Referral</option>
          <option value="Social Media">Social Media</option>
          <option value="Other">Other</option>
        </select>

        {/* Reset Filters Pill */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-ghost"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8125rem',
              color: '#dc2626',
              gap: '0.35rem',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
        Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'inquiry' : 'inquiries'}
      </div>
    </div>
  )
}
