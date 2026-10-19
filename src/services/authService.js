import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Authentication Service
 * Decoupled data layer interfacing with Supabase Auth and the 'profiles' PostgreSQL table.
 */

// Demo fallback user for local sandbox when Supabase credentials are not yet configured
const DEMO_USERS = {
  'admin@brightpath.edu': {
    id: 'demo-admin-uuid',
    email: 'admin@brightpath.edu',
    full_name: 'Dr. Rajesh Sharma',
    role: 'admin',
  },
  'manager@brightpath.edu': {
    id: 'demo-manager-uuid',
    email: 'manager@brightpath.edu',
    full_name: 'Vikram Singh',
    role: 'manager',
  },
  'counsellor@brightpath.edu': {
    id: 'demo-counsellor-uuid',
    email: 'counsellor@brightpath.edu',
    full_name: 'Anjali Gupta',
    role: 'counsellor',
  },
}

export const authService = {
  /**
   * Sign in with Email and Password
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      // Sandbox fallback mode
      const normalizedEmail = email.trim().toLowerCase()
      const demoUser = DEMO_USERS[normalizedEmail]

      if (demoUser && password.length >= 6) {
        localStorage.setItem('brightpath_demo_user', JSON.stringify(demoUser))
        return { user: { id: demoUser.id, email: demoUser.email }, profile: demoUser, error: null }
      }

      // Default demo profile if unknown email used in sandbox
      if (password.length >= 6) {
        const fallbackProfile = {
          id: 'demo-user-custom',
          email: normalizedEmail,
          full_name: normalizedEmail.split('@')[0],
          role: 'counsellor',
        }
        localStorage.setItem('brightpath_demo_user', JSON.stringify(fallbackProfile))
        return { user: { id: fallbackProfile.id, email: fallbackProfile.email }, profile: fallbackProfile, error: null }
      }

      return { user: null, profile: null, error: new Error('Password must be at least 6 characters.') }
    }

    // Live Supabase Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) return { user: null, profile: null, error }

    // Fetch associated profile
    const profile = await this.getUserProfile(data.user.id)
    return { user: data.user, profile, error: null }
  },

  /**
   * Sign up a new staff member or counselor
   */
  async signUp(email, password, fullName) {
    if (!isSupabaseConfigured || !supabase) {
      const demoUser = {
        id: `demo-${Date.now()}`,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role: 'counsellor',
      }
      localStorage.setItem('brightpath_demo_user', JSON.stringify(demoUser))
      return { user: { id: demoUser.id, email: demoUser.email }, profile: demoUser, error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (error) return { user: null, profile: null, error }

    // Profile will be auto-created by PostgreSQL trigger 'on_auth_user_created'
    let profile = null
    if (data.user) {
      profile = await this.getUserProfile(data.user.id)
    }

    return { user: data.user, profile, error: null }
  },

  /**
   * Terminate active session
   */
  async signOut() {
    localStorage.removeItem('brightpath_demo_user')
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
  },

  /**
   * Retrieve active session
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem('brightpath_demo_user')
      if (stored) {
        const demoUser = JSON.parse(stored)
        return {
          session: { user: { id: demoUser.id, email: demoUser.email } },
          profile: demoUser,
        }
      }
      return { session: null, profile: null }
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return { session: null, profile: null }

    const profile = await this.getUserProfile(session.user.id)
    return { session, profile }
  },

  /**
   * Query profiles table for role and full name
   */
  async getUserProfile(userId) {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem('brightpath_demo_user')
      return stored ? JSON.parse(stored) : null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        // Fallback profile if row is not yet propagated
        return {
          id: userId,
          full_name: 'Staff Member',
          role: 'counsellor',
        }
      }

      return data
    } catch {
      return {
        id: userId,
        full_name: 'Staff Member',
        role: 'counsellor',
      }
    }
  },

  /**
   * Subscribe to auth state events (sign in, token refresh, sign out)
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) {
      // In sandbox mode, no external event listener needed
      return { unsubscribe: () => {} }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      let profile = null
      if (session?.user) {
        profile = await this.getUserProfile(session.user.id)
      }
      callback(event, session, profile)
    })

    return subscription
  },
}
