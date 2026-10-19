-- ==============================================================================
-- BRIGHTPATH CRM — CORE DATABASE SCHEMA MIGRATION
-- Specification: BrightPath CRM Master Architecture (PostgreSQL 15+ / Supabase)
-- Author: Senior Engineering Team
-- Date: 2026-10-18
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 PROFILES TABLE (Mirrors auth.users with CRM roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 LEADS TABLE (Central student inquiries)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    course_interest TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Other')),
    status TEXT NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New',
    lost_reason TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 FOLLOW_UPS TABLE (Scheduled counseling calls & appointments)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    due_at TIMESTAMPTZ NOT NULL,
    note TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 ACTIVITIES TABLE (Immutable audit timeline)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('lead_created', 'status_changed', 'note_added', 'followup_scheduled', 'followup_completed', 'lead_reassigned')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_to ON public.follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_at ON public.follow_ups(due_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ==============================================================================
-- 4. SECURITY DEFINER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 4.1 Anti-Recursion Role Checker
-- Using SECURITY DEFINER and a fixed search_path prevents RLS infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 4.2 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_leads_updated_at ON public.leads;
CREATE TRIGGER tr_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.3 Auto-create profile trigger on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'counsellor'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 5.1 Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5.2 PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Any authenticated user can read profiles (needed for assigning leads and displaying team members)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile (full_name), but CANNOT elevate their role
DROP POLICY IF EXISTS "Users can update own profile name" ON public.profiles;
CREATE POLICY "Users can update own profile name"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 5.3 LEADS POLICIES
-- ------------------------------------------------------------------------------
-- SELECT: Counsellor sees own/assigned leads. Manager & Admin see all leads.
DROP POLICY IF EXISTS "Users can view accessible leads" ON public.leads;
CREATE POLICY "Users can view accessible leads"
    ON public.leads FOR SELECT
    TO authenticated
    USING (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR public.get_user_role() IN ('manager', 'admin')
    );

-- INSERT: Any authenticated staff member can create leads
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
CREATE POLICY "Authenticated users can insert leads"
    ON public.leads FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- UPDATE: Counsellor can update own/assigned leads. Manager & Admin can update any lead.
DROP POLICY IF EXISTS "Users can update accessible leads" ON public.leads;
CREATE POLICY "Users can update accessible leads"
    ON public.leads FOR UPDATE
    TO authenticated
    USING (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR public.get_user_role() IN ('manager', 'admin')
    )
    WITH CHECK (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR public.get_user_role() IN ('manager', 'admin')
    );

-- DELETE: Only Administrators can delete leads
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
CREATE POLICY "Only admins can delete leads"
    ON public.leads FOR DELETE
    TO authenticated
    USING (public.get_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 5.4 FOLLOW_UPS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view follow-ups for leads they have access to
DROP POLICY IF EXISTS "Users can view accessible follow-ups" ON public.follow_ups;
CREATE POLICY "Users can view accessible follow-ups"
    ON public.follow_ups FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = follow_ups.lead_id
            AND (
                leads.assigned_to = auth.uid()
                OR leads.created_by = auth.uid()
                OR public.get_user_role() IN ('manager', 'admin')
            )
        )
    );

-- Users can insert follow-ups for accessible leads
DROP POLICY IF EXISTS "Users can insert follow-ups" ON public.follow_ups;
CREATE POLICY "Users can insert follow-ups"
    ON public.follow_ups FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = follow_ups.lead_id
            AND (
                leads.assigned_to = auth.uid()
                OR leads.created_by = auth.uid()
                OR public.get_user_role() IN ('manager', 'admin')
            )
        )
    );

-- Users can update follow-ups for accessible leads
DROP POLICY IF EXISTS "Users can update follow-ups" ON public.follow_ups;
CREATE POLICY "Users can update follow-ups"
    ON public.follow_ups FOR UPDATE
    TO authenticated
    USING (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR public.get_user_role() IN ('manager', 'admin')
    );

-- ------------------------------------------------------------------------------
-- 5.5 ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------
-- Users can view activity history for accessible leads
DROP POLICY IF EXISTS "Users can view lead activities" ON public.activities;
CREATE POLICY "Users can view lead activities"
    ON public.activities FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            WHERE leads.id = activities.lead_id
            AND (
                leads.assigned_to = auth.uid()
                OR leads.created_by = auth.uid()
                OR public.get_user_role() IN ('manager', 'admin')
            )
        )
    );

-- Authenticated users can insert activities
DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
CREATE POLICY "Users can insert activities"
    ON public.activities FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());
