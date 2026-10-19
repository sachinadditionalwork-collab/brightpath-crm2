import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Strip /rest/v1 or trailing slashes if accidentally included in .env
const cleanUrl = rawUrl
  ? rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  : ''
const cleanKey = rawKey ? rawKey.trim() : ''

// Helper to determine if credentials are validly configured
export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  cleanKey &&
  cleanUrl.startsWith('https://') &&
  !cleanUrl.includes('your-project-id') &&
  !cleanKey.includes('your-anon-public-client-key')
)

// Safe Supabase client initialization
export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Diagnostic health check utility
 * Verifies connectivity to the Supabase PostgreSQL cluster and measures latency
 */
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      isConfigured: false,
      message: 'Supabase credentials are missing or set to placeholder values in .env',
      latencyMs: 0,
    }
  }

  const startTime = performance.now()
  try {
    // Attempt a lightweight query to test connection and RLS
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    const latencyMs = Math.round(performance.now() - startTime)

    if (error) {
      // If table doesn't exist yet, it's connected but needs migration
      if (error.code === '42P01' || error.message.includes('relation "public.profiles" does not exist')) {
        return {
          connected: true,
          isConfigured: true,
          needsMigration: true,
          message: 'Connected to Supabase project, but tables are not created yet. Please run migration SQL.',
          latencyMs,
        }
      }

      return {
        connected: false,
        isConfigured: true,
        message: `Connection error: ${error.message}`,
        latencyMs,
      }
    }

    return {
      connected: true,
      isConfigured: true,
      needsMigration: false,
      message: 'Successfully connected to Supabase PostgreSQL cluster with active RLS.',
      latencyMs,
    }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime)
    return {
      connected: false,
      isConfigured: true,
      message: err instanceof Error ? err.message : 'Unknown network failure connecting to Supabase',
      latencyMs,
    }
  }
}

/**
 * Diagnostic details helper for setup screens
 */
export function getSupabaseDetails() {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl || null,
    hasAnonKey: Boolean(supabaseAnonKey),
    maskedKey: supabaseAnonKey
      ? `${supabaseAnonKey.substring(0, 10)}••••••••${supabaseAnonKey.slice(-6)}`
      : null,
  }
}
