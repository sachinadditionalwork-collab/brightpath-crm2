import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { activityService } from './activityService'

/**
 * Lead Management Service
 * Decoupled data layer interfacing with Supabase PostgREST queries and activities logging.
 */

const STORAGE_KEY = 'brightpath_sandbox_leads'

// Initial realistic default leads for sandbox / demo mode
const INITIAL_DEMO_LEADS = [
  {
    id: 'lead-001',
    full_name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    phone: '+91 98765 43210',
    course_interest: 'Data Science & AI',
    source: 'Website',
    status: 'New',
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    created_by: 'demo-counsellor-uuid',
    created_by_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    notes: 'Inquired via website form regarding weekend batches and placement assistance.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-002',
    full_name: 'Sneha Rao',
    email: 'sneha.rao@example.com',
    phone: '+91 98234 56789',
    course_interest: 'Full Stack Development',
    source: 'Walk-in',
    status: 'Contacted',
    assigned_to: 'demo-manager-uuid',
    assigned_to_profile: { id: 'demo-manager-uuid', full_name: 'Vikram Singh' },
    created_by: 'demo-counsellor-uuid',
    created_by_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    notes: 'Visited campus. Discussed curriculum, lab facilities, and picked up syllabus brochure.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-003',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 97123 45678',
    course_interest: 'Cloud Engineering',
    source: 'Referral',
    status: 'Qualified',
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    created_by: 'demo-counsellor-uuid',
    created_by_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    notes: 'Referred by alumni Rahul. Working IT professional looking for advanced AWS certification.',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-004',
    full_name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 99887 76655',
    course_interest: 'UI/UX Design',
    source: 'Social Media',
    status: 'Converted',
    assigned_to: 'demo-manager-uuid',
    assigned_to_profile: { id: 'demo-manager-uuid', full_name: 'Vikram Singh' },
    created_by: 'demo-counsellor-uuid',
    created_by_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    notes: 'Enrolled in Spring cohort. Admission fee receipt acknowledged.',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lead-005',
    full_name: 'Kabir Sen',
    email: 'kabir.sen@example.com',
    phone: '+91 98112 23344',
    course_interest: 'Data Science & AI',
    source: 'Phone Call',
    status: 'Lost',
    lost_reason: 'Relocating to another city for work',
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    created_by: 'demo-counsellor-uuid',
    created_by_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    notes: 'Unable to join offline batch due to sudden relocation to Pune.',
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
]

function getSandboxLeads() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS))
    return INITIAL_DEMO_LEADS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_DEMO_LEADS
  }
}

function saveSandboxLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
}

export const leadService = {
  /**
   * Fetch leads with debounced text search, multi-filters, and pagination
   */
  async fetchLeads({ search = '', status = 'ALL', source = 'ALL', page = 1, pageSize = 8 } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox mode filtering
      let list = getSandboxLeads()

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        list = list.filter(
          (lead) =>
            lead.full_name.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            lead.course_interest.toLowerCase().includes(q)
        )
      }

      if (status !== 'ALL') {
        list = list.filter((lead) => lead.status === status)
      }

      if (source !== 'ALL') {
        list = list.filter((lead) => lead.source === source)
      }

      // Sort by created_at DESC
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      const totalCount = list.length
      const start = (page - 1) * pageSize
      const paginated = list.slice(start, start + pageSize)

      return { data: paginated, count: totalCount, error: null }
    }

    // Live Supabase PostgREST Query
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(id, full_name, role),
          created_by_profile:profiles!created_by(id, full_name)
        `, { count: 'exact' })

      if (search.trim()) {
        const q = `%${search.trim()}%`
        query = query.or(`full_name.ilike.${q},phone.ilike.${q},email.ilike.${q},course_interest.ilike.${q}`)
      }

      if (status !== 'ALL') {
        query = query.eq('status', status)
      }

      if (source !== 'ALL') {
        query = query.eq('source', source)
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false })

      // Range for pagination
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1
      query = query.range(start, end)

      const { data, count, error } = await query

      if (error) {
        return { data: [], count: 0, error: error.message }
      }

      return { data: data || [], count: count || 0, error: null }
    } catch (err) {
      return { data: [], count: 0, error: err.message }
    }
  },

  /**
   * Create a new student inquiry lead and automatically log activity
   */
  async createLead(leadPayload, currentUser) {
    const creatorId = currentUser?.id || 'demo-counsellor-uuid'
    const creatorName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Staff Member'

    if (!isSupabaseConfigured || !supabase) {
      // Sandbox mode insertion
      const leads = getSandboxLeads()
      const newLead = {
        id: `lead-${Date.now()}`,
        full_name: leadPayload.full_name.trim(),
        email: leadPayload.email?.trim() || null,
        phone: leadPayload.phone.trim(),
        course_interest: leadPayload.course_interest,
        source: leadPayload.source,
        status: 'New',
        assigned_to: leadPayload.assigned_to || creatorId,
        assigned_to_profile: { id: leadPayload.assigned_to || creatorId, full_name: creatorName },
        created_by: creatorId,
        created_by_profile: { id: creatorId, full_name: creatorName },
        notes: leadPayload.notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      leads.unshift(newLead)
      saveSandboxLeads(leads)

      activityService.logActivity(
        {
          leadId: newLead.id,
          activityType: 'lead_created',
          description: `Inquiry registered by ${creatorName} via ${leadPayload.source}.`,
          metadata: { source: leadPayload.source, course_interest: leadPayload.course_interest },
        },
        currentUser
      )

      return { data: newLead, error: null }
    }

    // Live Supabase Insertion
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          full_name: leadPayload.full_name.trim(),
          email: leadPayload.email?.trim() || null,
          phone: leadPayload.phone.trim(),
          course_interest: leadPayload.course_interest,
          source: leadPayload.source,
          status: 'New',
          assigned_to: leadPayload.assigned_to || creatorId,
          created_by: creatorId,
          notes: leadPayload.notes?.trim() || null,
        })
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(id, full_name, role),
          created_by_profile:profiles!created_by(id, full_name)
        `)
        .single()

      if (error) return { data: null, error: error.message }

      // Automatically record activity in 'activities' audit log
      if (data?.id) {
        await activityService.logActivity(
          {
            leadId: data.id,
            activityType: 'lead_created',
            description: `Inquiry registered by ${creatorName} via ${leadPayload.source}.`,
            metadata: { source: leadPayload.source, course_interest: leadPayload.course_interest },
          },
          currentUser
        )
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  /**
   * Update lead status or fields
   */
  async updateLead(leadId, updates, currentUser) {
    if (!isSupabaseConfigured || !supabase) {
      const leads = getSandboxLeads()
      const index = leads.findIndex((l) => l.id === leadId)
      if (index !== -1) {
        const oldLead = leads[index]
        leads[index] = {
          ...leads[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        saveSandboxLeads(leads)

        // Log status change if status changed
        if (updates.status && updates.status !== oldLead.status) {
          activityService.logActivity(
            {
              leadId,
              activityType: 'status_changed',
              description:
                updates.status === 'Lost'
                  ? `Status marked as Lost. Reason: ${updates.lost_reason || 'Not specified'}.`
                  : `Pipeline stage moved from '${oldLead.status}' to '${updates.status}'.`,
              metadata: {
                old_status: oldLead.status,
                new_status: updates.status,
                lost_reason: updates.lost_reason || null,
              },
            },
            currentUser
          )
        }

        // Log reassignment if assigned_to_profile changed
        if (
          updates.assigned_to_profile &&
          updates.assigned_to_profile.full_name !== oldLead.assigned_to_profile?.full_name
        ) {
          activityService.logActivity(
            {
              leadId,
              activityType: 'lead_reassigned',
              description: `Lead reassigned to counselor ${updates.assigned_to_profile.full_name}.`,
              metadata: { new_assignee: updates.assigned_to_profile.full_name },
            },
            currentUser
          )
        }

        return { data: leads[index], error: null }
      }
      return { data: null, error: 'Lead not found.' }
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(id, full_name, role),
          created_by_profile:profiles!created_by(id, full_name)
        `)
        .single()

      if (error) return { data: null, error: error.message }

      // If status changed, log activity
      if (updates.status && currentUser) {
        await activityService.logActivity(
          {
            leadId,
            activityType: 'status_changed',
            description:
              updates.status === 'Lost'
                ? `Status marked as Lost. Reason: ${updates.lost_reason || 'Not specified'}.`
                : `Pipeline stage moved to '${updates.status}'.`,
            metadata: { new_status: updates.status, lost_reason: updates.lost_reason || null },
          },
          currentUser
        )
      }

      // If reassigned
      if (updates.assigned_to && currentUser) {
        await activityService.logActivity(
          {
            leadId,
            activityType: 'lead_reassigned',
            description: `Lead reassigned to new counselor.`,
            metadata: { assigned_to: updates.assigned_to },
          },
          currentUser
        )
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },
}
