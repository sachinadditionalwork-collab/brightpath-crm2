import { leadService } from './leadService'
import { followUpService } from './followUpService'

/**
 * Dashboard Analytics Service
 * Computes live reconciled KPI metrics, pipeline distribution, source breakdown, and urgent tasks.
 */

const STATUS_ORDER = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

const STATUS_CONFIG = {
  New: { label: 'New Inquiries', color: '#2563eb', bg: '#eff6ff', badge: 'badge-new' },
  Contacted: { label: 'Contacted', color: '#0ea5e9', bg: '#f0f9ff', badge: 'badge-contacted' },
  Qualified: { label: 'Qualified Candidates', color: '#d97706', bg: '#fffbeb', badge: 'badge-qualified' },
  Converted: { label: 'Admissions Won', color: '#059669', bg: '#ecfdf5', badge: 'badge-converted' },
  Lost: { label: 'Inquiries Lost', color: '#e11d48', bg: '#fff1f2', badge: 'badge-lost' },
}

const SOURCES = ['Website', 'Walk-in', 'Referral', 'Social Media', 'Phone Call']

export const dashboardService = {
  /**
   * Fetch all aggregated metrics with 1:1 reconciliation against leads and follow-ups
   */
  async fetchDashboardMetrics(currentUser = null) {
    try {
      // Fetch accessible leads and follow-ups in parallel
      const [leadsRes, followUpsRes] = await Promise.all([
        leadService.fetchLeads({ pageSize: 500 }, currentUser),
        followUpService.fetchFollowUps({}, currentUser),
      ])

      const leads = leadsRes.data || []
      const followUps = followUpsRes.data || []

      const totalLeads = leads.length
      const newLeads = leads.filter((l) => l.status === 'New').length
      const contactedLeads = leads.filter((l) => l.status === 'Contacted').length
      const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length
      const convertedLeads = leads.filter((l) => l.status === 'Converted').length
      const lostLeads = leads.filter((l) => l.status === 'Lost').length

      // Conversion Rate with zero-division safeguard
      const conversionRate =
        totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0'

      // Overdue Follow-ups (pending & due_at < now)
      const now = new Date()
      const overdueFollowUpsList = followUps.filter(
        (f) => f.status === 'pending' && new Date(f.due_at) < now
      )
      const overdueCount = overdueFollowUpsList.length

      // Today follow-ups
      const todayFollowUpsList = followUps.filter((f) => {
        if (f.status !== 'pending') return false
        const d = new Date(f.due_at)
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        )
      })

      // Pipeline Stage Distribution
      const statusDistribution = STATUS_ORDER.map((stg) => {
        const count = leads.filter((l) => l.status === stg).length
        const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
        return {
          status: stg,
          ...STATUS_CONFIG[stg],
          count,
          pct,
        }
      })

      // Source Breakdown
      const sourceDistribution = SOURCES.map((src) => {
        const count = leads.filter((l) => l.source === src).length
        const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
        return {
          source: src,
          count,
          pct,
        }
      }).sort((a, b) => b.count - a.count)

      // Urgent Tasks: Pending follow-ups sorted by due date ascending
      const pendingFollowUps = followUps.filter((f) => f.status === 'pending')
      pendingFollowUps.sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
      const urgentFollowUps = pendingFollowUps.slice(0, 4)

      // Recent leads sorted by creation date descending
      const recentLeads = [...leads]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4)

      return {
        data: {
          kpis: {
            totalLeads,
            newLeads,
            contactedLeads,
            qualifiedLeads,
            convertedLeads,
            lostLeads,
            conversionRate,
            overdueCount,
            todayCount: todayFollowUpsList.length,
          },
          statusDistribution,
          sourceDistribution,
          urgentFollowUps,
          recentLeads,
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: err.message || 'Failed to compute dashboard metrics.',
      }
    }
  },
}
