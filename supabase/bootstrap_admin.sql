-- ==============================================================================
-- BRIGHTPATH CRM — ADMINISTRATOR BOOTSTRAP PROCEDURE
-- Purpose: Safely promote a staff member's account to 'admin'
-- Security Rule: Role promotion MUST happen through database procedures,
--                never via client-side frontend requests.
-- ==============================================================================

-- INSTRUCTIONS:
-- 1. Sign up your account first through the BrightPath CRM web UI (or Supabase Auth).
-- 2. Open your Supabase Dashboard -> SQL Editor.
-- 3. Replace 'your-email@brightpath.edu' below with your actual account email.
-- 4. Execute the SQL command below:

UPDATE public.profiles
SET role = 'admin',
    updated_at = now()
WHERE id = (
    SELECT id
    FROM auth.users
    WHERE email = 'admin@brightpath.edu'  -- <-- REPLACE WITH YOUR EMAIL HERE
);

-- VERIFICATION QUERY:
-- Confirm your profile now shows role = 'admin'
SELECT p.id, p.full_name, p.role, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@brightpath.edu';  -- <-- REPLACE WITH YOUR EMAIL HERE
