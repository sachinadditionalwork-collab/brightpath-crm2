import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Activity History Service
 * Provides an immutable chronological audit trail of all lead lifecycle events:
 * - lead_created
 * - status_changed
 * - note_added
 * - followup_scheduled
 * - followup_completed
 * - lead_reassigned
 */

const STORAGE_KEY = 'brightpath_sandbox_activities'

// Realistic initial timeline history for demo leads in sandbox mode
const INITIAL_DEMO_ACTIVITIES = [
  // Rohan Mehra (lead-001)
  {
    id: 'act-001',
    lead_id: 'lead-001',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'lead_created',
    description: 'Inquiry registered by Anjali Gupta via Website form.',
    metadata: { source: 'Website', course_interest: 'Data Science & AI' },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-002',
    lead_id: 'lead-001',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'followup_scheduled',
    description: 'Initial counseling call scheduled: Discuss Python prerequisites and weekend batch timings.',
    metadata: { due_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString() },
    created_at: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
  },

  // Sneha Rao (lead-002)
  {
    id: 'act-003',
    lead_id: 'lead-002',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'lead_created',
    description: 'Walk-in inquiry registered by Anjali Gupta.',
    metadata: { source: 'Walk-in', course_interest: 'Full Stack Development' },
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-004',
    lead_id: 'lead-002',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'status_changed',
    description: "Pipeline stage advanced from 'New' to 'Contacted'.",
    metadata: { old_status: 'New', new_status: 'Contacted' },
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-005',
    lead_id: 'lead-002',
    actor_id: 'demo-manager-uuid',
    actor_profile: { id: 'demo-manager-uuid', full_name: 'Vikram Singh', role: 'manager' },
    activity_type: 'note_added',
    description: 'Visited campus. Discussed curriculum, lab facilities, and picked up syllabus brochure.',
    metadata: {},
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-006',
    lead_id: 'lead-002',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'followup_scheduled',
    description: 'Campus visit follow-up: Clarify live project assignments and placement track details.',
    metadata: { due_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString() },
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },

  // Aarav Sharma (lead-003)
  {
    id: 'act-007',
    lead_id: 'lead-003',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'lead_created',
    description: 'Referral inquiry registered: Referred by alumni Rahul.',
    metadata: { source: 'Referral', course_interest: 'Cloud Engineering' },
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-008',
    lead_id: 'lead-003',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'status_changed',
    description: "Pipeline stage advanced from 'New' to 'Contacted'.",
    metadata: { old_status: 'New', new_status: 'Contacted' },
    created_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-009',
    lead_id: 'lead-003',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'status_changed',
    description: "Candidate qualified for Cloud batch. Stage advanced to 'Qualified'.",
    metadata: { old_status: 'Contacted', new_status: 'Qualified' },
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-010',
    lead_id: 'lead-003',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'followup_scheduled',
    description: 'Follow-up scheduled regarding batch timing & scholarship options.',
    metadata: { due_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString() },
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },

  // Priya Patel (lead-004)
  {
    id: 'act-011',
    lead_id: 'lead-004',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'lead_created',
    description: 'Inquiry registered from Social Media campaign.',
    metadata: { source: 'Social Media', course_interest: 'UI/UX Design' },
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-012',
    lead_id: 'lead-004',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'followup_completed',
    description: 'Follow-up completed: Send welcome onboarding pack and classroom badge details.',
    metadata: {},
    created_at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-013',
    lead_id: 'lead-004',
    actor_id: 'demo-manager-uuid',
    actor_profile: { id: 'demo-manager-uuid', full_name: 'Vikram Singh', role: 'manager' },
    activity_type: 'status_changed',
    description: "Admission enrollment confirmed! Stage updated to 'Converted'.",
    metadata: { old_status: 'Qualified', new_status: 'Converted' },
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },

  // Kabir Sen (lead-005)
  {
    id: 'act-014',
    lead_id: 'lead-005',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'lead_created',
    description: 'Phone counseling inquiry registered.',
    metadata: { source: 'Phone Call', course_interest: 'Data Science & AI' },
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-015',
    lead_id: 'lead-005',
    actor_id: 'demo-counsellor-uuid',
    actor_profile: { id: 'demo-counsellor-uuid', full_name: 'Anjali Gupta', role: 'counsellor' },
    activity_type: 'status_changed',
    description: "Marked as Lost. Reason: Relocating to another city for work.",
    metadata: { old_status: 'Contacted', new_status: 'Lost', lost_reason: 'Relocating to another city for work' },
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
]

function getSandboxActivities() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ACTIVITIES))
    return INITIAL_DEMO_ACTIVITIES
  }
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_DEMO_ACTIVITIES
  }
}

function saveSandboxActivities(activities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
}

export const activityService = {
  /**
   * Fetch activity timeline for a given lead
   */
  async fetchActivities(leadId) {
    if (!leadId) return { data: [], error: 'Lead ID is required.' }

    if (!isSupabaseConfigured || !supabase) {
      const all = getSandboxActivities()
      const filtered = all
        .filter((act) => act.lead_id === leadId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return { data: filtered, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) return { data: [], error: error.message }
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: err.message }
    }
  },

  /**
   * Log a new activity event (immutable audit entry)
   */
  async logActivity({ leadId, activityType, description, metadata = {} }, currentUser) {
    const actorId = currentUser?.id || 'demo-counsellor-uuid'
    const actorName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Staff Member'
    const actorRole = currentUser?.role || 'counsellor'

    if (!isSupabaseConfigured || !supabase) {
      const items = getSandboxActivities()
      const newActivity = {
        id: `act-${Date.now()}`,
        lead_id: leadId,
        actor_id: actorId,
        actor_profile: { id: actorId, full_name: actorName, role: actorRole },
        activity_type: activityType,
        description: description.trim(),
        metadata,
        created_at: new Date().toISOString(),
      }

      items.unshift(newActivity)
      saveSandboxActivities(items)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:activities_changed', { detail: { leadId } }))
      }

      return { data: newActivity, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          actor_id: actorId,
          activity_type: activityType,
          description: description.trim(),
          metadata,
        })
        .select(`
          *,
          actor_profile:profiles!actor_id(id, full_name, role)
        `)
        .single()

      if (error) return { data: null, error: error.message }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightpath:activities_changed', { detail: { leadId } }))
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  /**
   * Quick note helper: logs a note_added activity
   */
  async addNote(leadId, noteText, currentUser) {
    if (!noteText?.trim()) return { data: null, error: 'Note text cannot be empty.' }
    return this.logActivity(
      {
        leadId,
        activityType: 'note_added',
        description: noteText.trim(),
        metadata: {},
      },
      currentUser
    )
  },
}
