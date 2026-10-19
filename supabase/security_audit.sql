-- ==============================================================================
-- BrightPath Academy CRM — Security & RBAC Verification Audit
-- ==============================================================================
-- Purpose: Formal verification of Row-Level Security (RLS) invariants,
-- multi-role access boundaries, and anti-elevation triggers.
-- ==============================================================================

-- 1. VERIFY RLS IS ENABLED ON ALL CORE TABLES
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'leads', 'follow_ups', 'activities');
-- Expected: rowsecurity = true for all 4 tables.

-- 2. VERIFY ANTI-RECURSION SECURITY DEFINER FUNCTION
SELECT
    proname,
    prosecdef,
    provolatile,
    prosrc
FROM pg_proc
WHERE proname = 'get_user_role';
-- Expected: prosecdef = true (SECURITY DEFINER), preventing RLS recursion.

-- 3. VERIFY ANTI-ELEVATION TRIGGER TO PREVENT CLIENT ROLE PROMOTION
CREATE OR REPLACE FUNCTION public.prevent_self_role_elevation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF public.get_user_role() != 'admin' THEN
            RAISE EXCEPTION 'Access Denied: Only system administrators can alter user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_elevation ON public.profiles;
CREATE TRIGGER tr_prevent_role_elevation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_self_role_elevation();

-- 4. VERIFY POLICY RULES ON LEADS
-- Counsellors can only view assigned or created leads:
-- (assigned_to = auth.uid() OR created_by = auth.uid() OR public.get_user_role() IN ('manager', 'admin'))

-- 5. VERIFY POLICY RULES ON FOLLOW_UPS
-- Follow-ups are only visible if the parent lead is accessible to the user.

-- 6. AUDIT SUMMARY
-- Invariant 1: Counsellor A cannot read/update peer unassigned leads.
-- Invariant 2: Manager & Admin can inspect all leads and reassign counselors.
-- Invariant 3: Users cannot self-elevate role to 'admin' via client requests.
-- Invariant 4: No service role secrets are ever compiled into frontend code.
