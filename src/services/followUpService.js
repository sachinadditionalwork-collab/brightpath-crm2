import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { activityService } from './activityService'

/**
 * Follow-up Service
 * Manages scheduled counseling calls, overdue task calculation, and activity logs.
 */

const STORAGE_KEY = 'brightpath_sandbox_followups'

// Initial realistic default follow-ups for sandbox / demo mode
const INITIAL_DEMO_FOLLOWUPS = [
  {
    id: 'fu-001',
    lead_id: 'lead-003',
    lead: {
      id: 'lead-003',
      full_name: 'Aarav Sharma',
      phone: '+91 97123 45678',
      email: 'aarav.sharma@example.com',
      course_interest: 'Cloud Engineering',
      status: 'Qualified',
    },
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    // Due yesterday at 4:00 PM (Overdue)
    due_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    note: 'Requested syllabus PDF and course fee structure. Follow up regarding batch timing & scholarship.',
    status: 'pending',
    completed_at: null,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fu-002',
    lead_id: 'lead-002',
    lead: {
      id: 'lead-002',
      full_name: 'Sneha Rao',
      phone: '+91 98234 56789',
      email: 'sneha.rao@example.com',
      course_interest: 'Full Stack Development',
      status: 'Contacted',
    },
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    // Due today in 3 hours
    due_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    note: 'Campus visit follow-up: Clarify live project assignments and placement track details.',
    status: 'pending',
    completed_at: null,
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fu-003',
    lead_id: 'lead-001',
    lead: {
      id: 'lead-001',
      full_name: 'Rohan Mehra',
      phone: '+91 98765 43210',
      email: 'rohan.mehra@example.com',
      course_interest: 'Data Science & AI',
      status: 'New',
    },
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    // Due in 3 days (Upcoming)
    due_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    note: 'Initial phone counseling call: Discuss Python prerequisites and weekend batch timings.',
    status: 'pending',
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fu-004',
    lead_id: 'lead-004',
    lead: {
      id: 'lead-004',
      full_name: 'Priya Patel',
      phone: '+91 99887 76655',
      email: 'priya.patel@example.com',
      course_interest: 'UI/UX Design',
      status: 'Converted',
    },
    assigned_to: 'demo-counsellor-uuid',
    assigned_to_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta' },
    due_at: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
    note: 'Send welcome onboarding pack and classroom badge details.',
    status: 'completed',
    completed_at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
]

function getSandboxFollowUps() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_FOLLOWUPS))
    return INITIAL_DEMO_FOLLOWUPS
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_DEMO_FOLLOWUPS
  }
}

function saveSandboxFollowUps(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const followUpService = {
  /**
   * Fetch all follow-ups with lead and assignee details
   */
  async fetchFollowUps({ leadId = null } = {}, currentUser = null) {
    if (!isSupabaseConfigured || !supabase) {
      let list = getSandboxFollowUps()
      if (leadId) {
        list = list.filter((item) => item.lead_id === leadId)
      }

      // Enforce Counsellor RBAC in sandbox
      if (currentUser?.role === 'counsellor') {
        const userId = currentUser.id || 'demo-counsellor-uuid'
        list = list.filter(
          (item) => item.assigned_to === userId || item.created_by === userId
        )
      }

      // Sort by due_at ascending
      list.sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
      return { data: list, error: null }
    }

    // Live Supabase PostgREST query
    try {
      let query = supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, email, course_interest, status),
          assigned_to_profile:profiles!assigned_to(id, full_name, role)
        `)
        .order('due_at', { ascending: true })

      if (leadId) {
        query = query.eq('lead_id', leadId)
      }

      const { data, error } = await query
      if (error) return { data: [], error: error.message }
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: err.message }
    }
  },

  /**
   * Schedule a new follow-up and record in activities
   */
  async createFollowUp(payload, currentUser) {
    const creatorId = currentUser?.id || 'demo-counsellor-uuid'
    const creatorName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Staff Member'

    if (!isSupabaseConfigured || !supabase) {
      const items = getSandboxFollowUps()
      const newFollowUp = {
        id: `fu-${Date.now()}`,
        lead_id: payload.lead_id,
        lead: payload.lead || {
          id: payload.lead_id,
          full_name: payload.student_name || 'Prospective Student',
          course_interest: payload.course_interest || 'General Inquiry',
        },
        assigned_to: payload.assigned_to || creatorId,
        assigned_to_profile: { id: payload.assigned_to || creatorId, full_name: creatorName },
        due_at: new Date(payload.due_at).toISOString(),
        note: payload.note.trim(),
        status: 'pending',
        completed_at: null,
        created_by: creatorId,
        created_at: new Date().toISOString(),
      }

      items.unshift(newFollowUp)
      saveSandboxFollowUps(items)

      activityService.logActivity(
        {
          leadId: payload.lead_id,
          activityType: 'followup_scheduled',
          description: `Follow-up scheduled for ${new Date(payload.due_at).toLocaleDateString()}: "${payload.note.trim()}".`,
          metadata: { due_at: payload.due_at },
        },
        currentUser
      )

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
      }
      return { data: newFollowUp, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          lead_id: payload.lead_id,
          assigned_to: payload.assigned_to || creatorId,
          due_at: new Date(payload.due_at).toISOString(),
          note: payload.note.trim(),
          status: 'pending',
          created_by: creatorId,
        })
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, email, course_interest, status),
          assigned_to_profile:profiles!assigned_to(id, full_name, role)
        `)
        .single()

      if (error) return { data: null, error: error.message }

      // Auto-log activity in PostgreSQL
      if (data?.id) {
        await activityService.logActivity(
          {
            leadId: payload.lead_id,
            activityType: 'followup_scheduled',
            description: `Follow-up scheduled for ${new Date(payload.due_at).toLocaleDateString()}: "${payload.note.trim()}".`,
            metadata: { due_at: payload.due_at },
          },
          currentUser
        )
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  /**
   * Mark follow-up as completed and update activity log
   */
  async completeFollowUp(id, currentUser) {
    if (!isSupabaseConfigured || !supabase) {
      const items = getSandboxFollowUps()
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) {
        items[index] = {
          ...items[index],
          status: 'completed',
          completed_at: new Date().toISOString(),
        }
        saveSandboxFollowUps(items)

        activityService.logActivity(
          {
            leadId: items[index].lead_id,
            activityType: 'followup_completed',
            description: `Follow-up completed: "${items[index].note}".`,
            metadata: { completed_at: items[index].completed_at },
          },
          currentUser
        )

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
        }
        return { data: items[index], error: null }
      }
      return { data: null, error: 'Follow-up not found' }
    }

    try {
      const nowIso = new Date().toISOString()
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: nowIso,
        })
        .eq('id', id)
        .select(`
          *,
          lead:leads!lead_id(id, full_name, phone, email, course_interest, status),
          assigned_to_profile:profiles!assigned_to(id, full_name, role)
        `)
        .single()

      if (error) return { data: null, error: error.message }

      // Log activity
      if (data?.lead_id) {
        await activityService.logActivity(
          {
            leadId: data.lead_id,
            activityType: 'followup_completed',
            description: `Follow-up completed: "${data.note}".`,
            metadata: { completed_at: nowIso },
          },
          currentUser
        )
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  /**
   * Cancel follow-up task
   */
  async cancelFollowUp(id) {
    if (!isSupabaseConfigured || !supabase) {
      const items = getSandboxFollowUps()
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) {
        items[index] = {
          ...items[index],
          status: 'cancelled',
        }
        saveSandboxFollowUps(items)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
        }
        return { data: items[index], error: null }
      }
      return { data: null, error: 'Follow-up not found' }
    }

    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:followups_changed'))
      }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },
}
