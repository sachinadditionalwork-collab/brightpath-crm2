-- ==============================================================================
-- BRIGHTPATH CRM — DEMO SEED DATA SCRIPT
-- Purpose: Populate realistic prospective student inquiries, follow-ups & activities
-- Note: Run this in Supabase SQL Editor AFTER at least one user has signed up
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_lead_1 UUID;
    v_lead_2 UUID;
    v_lead_3 UUID;
    v_lead_4 UUID;
    v_lead_5 UUID;
BEGIN
    -- 1. Grab the first active profile ID (or current auth.uid())
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

    -- Guard: Ensure a user exists first
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No profile found in public.profiles. Please sign up or create a user in Supabase Auth first.';
        RETURN;
    END IF;

    -- 2. Insert Sample Leads
    INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
    VALUES
        (gen_random_uuid(), 'Rohan Mehra', 'rohan.mehra@example.com', '+91 98765 43210', 'Data Science & AI', 'Website', 'New', v_user_id, v_user_id, 'Inquired via website form regarding weekend batches and placement assistance.')
    RETURNING id INTO v_lead_1;

    INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
    VALUES
        (gen_random_uuid(), 'Sneha Rao', 'sneha.rao@example.com', '+91 98234 56789', 'Full Stack Development', 'Walk-in', 'Contacted', v_user_id, v_user_id, 'Visited campus. Discussed curriculum and took institute brochure.')
    RETURNING id INTO v_lead_2;

    INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
    VALUES
        (gen_random_uuid(), 'Aarav Sharma', 'aarav.sharma@example.com', '+91 97123 45678', 'Cloud Engineering', 'Referral', 'Qualified', v_user_id, v_user_id, 'Referred by alumni Rahul. Working professional looking for upskilling.')
    RETURNING id INTO v_lead_3;

    INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
    VALUES
        (gen_random_uuid(), 'Priya Patel', 'priya.patel@example.com', '+91 99887 76655', 'UI/UX Design', 'Social Media', 'Converted', v_user_id, v_user_id, 'Enrolled in Spring cohort. Admission fee receipt acknowledged.')
    RETURNING id INTO v_lead_4;

    INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes)
    VALUES
        (gen_random_uuid(), 'Kabir Sen', 'kabir.sen@example.com', '+91 98112 23344', 'Data Science & AI', 'Phone Call', 'Lost', 'Relocating to another city for work', v_user_id, v_user_id, 'Unable to join offline batch due to sudden relocation.')
    RETURNING id INTO v_lead_5;

    -- 3. Insert Follow-ups
    -- 3.1 Overdue Follow-up (due yesterday)
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
    VALUES
        (v_lead_3, v_user_id, now() - INTERVAL '1 day', 'Call regarding weekend cohort batch schedule and scholarship eligibility.', 'pending', v_user_id);

    -- 3.2 Due Today Follow-up
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
    VALUES
        (v_lead_2, v_user_id, now() + INTERVAL '2 hours', 'Follow up after campus visit to answer curriculum queries.', 'pending', v_user_id);

    -- 3.3 Upcoming Follow-up (due in 3 days)
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
    VALUES
        (v_lead_1, v_user_id, now() + INTERVAL '3 days', 'Initial discovery consultation call.', 'pending', v_user_id);

    -- 3.4 Completed Follow-up
    INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by)
    VALUES
        (v_lead_4, v_user_id, now() - INTERVAL '4 days', 'Confirm seat reservation and welcome orientation details.', 'completed', now() - INTERVAL '3 days', v_user_id);

    -- 4. Insert Activities (Audit Log)
    INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
    VALUES
        (v_lead_1, v_user_id, 'lead_created', 'New inquiry created from Website form.'),
        (v_lead_2, v_user_id, 'lead_created', 'Walk-in student record registered.'),
        (v_lead_2, v_user_id, 'status_changed', 'Status transitioned from New to Contacted.'),
        (v_lead_4, v_user_id, 'status_changed', 'Status updated to Converted upon enrollment confirmation.'),
        (v_lead_4, v_user_id, 'followup_completed', 'Follow-up task marked completed.');

    RAISE NOTICE 'Seed data successfully loaded for profile ID: %', v_user_id;
END $$;
