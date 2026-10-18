# BrightPath CRM — Master Execution Plan & Project Context

> **Source Documentation:** `BrightPath_CRM_Full_Master_Build_Prompt.docx`  
> **Development Model:** Incremental, Feature-by-Feature (Develop $\rightarrow$ Test Locally $\rightarrow$ Verify DB Persistence $\rightarrow$ Commit / Deploy Checkpoint $\rightarrow$ Live Re-test)  
> **Core Stack:** React 19 + TypeScript + Vite + Supabase (PostgreSQL 15+, Auth, RLS) + Vercel  
> **Repository:** `https://github.com/sachinadditionalwork-collab/brightpath-crm2.git`

---

## 1. Project Context & Non-Goals

### Business Scenario
**BrightPath Academy** is an education coaching institute handling student inquiries across multiple channels (website, phone calls, walk-ins, messaging, referrals). The CRM streamlines the inquiry-to-enrollment pipeline, prevents lost leads, enforces follow-up accountability, and provides transparent conversion metrics.

### User Personas & Permissions
1. **Administrator**:
   * Full system access.
   * Manages staff profiles and system settings.
   * *Security Invariant:* Roles cannot be elevated through client requests.
2. **Manager**:
   * Pipeline oversight across the entire team.
   * Monitors overdue follow-ups and team conversion rates.
   * Can reassign leads to any counsellor.
3. **Counsellor**:
   * Manages assigned or personally created leads.
   * Schedules and completes follow-ups.
   * Logs interaction notes and advances lead statuses.

### Explicit MVP Non-Goals
* No LMS (course portals, assignments, video streaming).
* No payment gateway or fee collection system.
* No complex ERP or full student information systems.
* No third-party WhatsApp or SMS gateway integrations (manual contact logging only).

---

## 2. System Architecture & Directory Blueprint

### 2.1 Architectural Data Flow
$$\text{Browser (React + TS + Vite)} \longrightarrow \text{Typed Services / Hooks} \longrightarrow \text{Supabase Client (PostgREST)} \longrightarrow \text{PostgreSQL (RLS)}$$

### 2.2 Directory Layout
```
brightpath-crm/
├── .env.example                       # Committed template with dummy keys
├── .gitignore                         # Hardened to ignore .env, .env*.local, dist, etc.
├── plan.md                            # This plan and execution contract
├── supabase/
│   ├── migrations/
│   │   └── 20261018_crm_core_schema.sql  # Idempotent migration with tables, RLS, functions
│   └── seed.sql                       # Fictional demo dataset for testing
├── src/
│   ├── components/                    # Reusable atomic UI components
│   │   ├── layout/                    # Sidebar, Navbar, MobileDrawer, AppLayout
│   │   ├── ui/                        # Button, Input, Modal, Badge, Table, StatCard, Toast
│   │   └── feedback/                  # LoadingSpinner, EmptyState, ErrorBoundary
│   ├── features/                      # Domain-specific feature modules
│   │   ├── auth/                      # Login, Profile, ProtectedRoute
│   │   ├── dashboard/                 # KPI cards, status/source charts, quick widgets
│   │   ├── leads/                     # Lead table, create/edit modal, detail drawer, filters
│   │   ├── followups/                 # Follow-up list, overdue indicator, schedule modal
│   │   └── settings/                  # User profile, team roster (view-only for MVP)
│   ├── hooks/                         # useAuth, useLeads, useFollowUps, useDashboard
│   ├── lib/
│   │   └── supabaseClient.ts          # Typed Supabase client with runtime env validation
│   ├── services/                      # Typed PostgREST queries (decoupled from UI)
│   │   ├── authService.ts
│   │   ├── leadService.ts
│   │   ├── followUpService.ts
│   │   └── activityService.ts
│   ├── types/                         # Database schema & domain TypeScript definitions
│   │   ├── database.ts
│   │   └── crm.ts
│   ├── utils/                         # Date helpers, conversion rate math, status styling
│   ├── App.tsx                        # Router configuration & route guards
│   └── main.tsx                       # React DOM root
```

---

## 3. Database Schema & Row-Level Security (RLS)

### 3.1 Entity Relations
* **`profiles`**: Linked to `auth.users(id)`. Contains `full_name`, `role` (`admin`, `manager`, `counsellor`), timestamps.
* **`leads`**: Central inquiry records. Contains `full_name`, `email` (nullable), `phone`, `course_interest`, `source`, `status` (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`), `lost_reason` (nullable, required if `Lost`), `assigned_to` $\rightarrow$ `profiles(id)`, `created_by` $\rightarrow$ `profiles(id)`, `notes`.
* **`follow_ups`**: Scheduled tasks linked to `leads(id)`. Contains `assigned_to`, `due_at`, `note`, `status` (`pending`, `completed`, `cancelled`), `completed_at`.
* **`activities`**: Audit log linked to `leads(id)`. Contains `actor_id` $\rightarrow$ `profiles(id)`, `activity_type`, `description`, `metadata` (JSONB).

### 3.2 Security & RLS Invariants
* **RLS Enabled**: On all 4 tables (`profiles`, `leads`, `follow_ups`, `activities`).
* **Role Invariants**:
  * Counsellors can only SELECT/UPDATE leads where `assigned_to = auth.uid()` OR `created_by = auth.uid()`.
  * Managers and Admins can SELECT/UPDATE all leads.
  * `SECURITY DEFINER` function `public.get_user_role()` prevents recursive RLS loops when checking roles.
  * No user can update their own `role` column via client requests.
  * All client requests communicate via the public `anon` key. Secrets (service role keys) are **never** present in frontend code.

---

## 4. Phase-by-Phase Implementation Roadmap

Every feature follows this continuous loop:
$$\text{Develop} \longrightarrow \text{Test Locally} \longrightarrow \text{Verify DB Persistence} \longrightarrow \text{Commit \& Deploy Checkpoint} \longrightarrow \text{Retest Live} \longrightarrow \text{Next Feature}$$

---

### [x] Phase 1: Security Baseline, Tooling & Application Shell (Completed)
* **Features to Implement:**
  * Update `.gitignore` to ignore `.env`, `.env*.local`, `dist`.
  * Install dependencies: `@supabase/supabase-js`, `react-router-dom`, `lucide-react`.
  * Remove default Vite counter template and redundant `index copy.html`.
  * Setup Design System: Navy (`#0f172a`), slate neutrals, semantic status colors.
  * Build application layout: Desktop Sidebar, Mobile Drawer, Top Bar, Route Outlets.
  * Setup route shells: `/` (Dashboard), `/leads` (Leads), `/followups` (Follow-ups), `/settings` (Settings), `/login` (Login).
* **Testing & Verification:**
  * `npm run build` succeeds cleanly.
  * `npm run lint` passes without errors.
  * Verify mobile sidebar toggle collapses smoothly at `< 768px`.
* **Deployment Checkpoint:**
  * Git commit: `feat: establish project shell, design system and router baseline`.
  * Push to GitHub and check Vercel preview.

---

### [ ] Phase 2: Supabase Client, Environment Validation & DB Schema
* **Features to Implement:**
  * Create `src/lib/supabaseClient.ts` with runtime environment validation.
  * Create friendly fallback view `SetupGuideView` shown if `.env` keys are missing.
  * Create `.env.example` with placeholders.
  * Create `supabase/migrations/20261018_crm_core_schema.sql` (Tables, constraints, indexes, RLS, functions, auto-profile trigger).
  * Provide idempotent seed data (`supabase/seed.sql`).
* **Testing & Verification:**
  * Migration executed in Supabase SQL Editor.
  * Test query confirms database connectivity and active RLS.
* **Deployment Checkpoint:**
  * Git commit: `feat: configure supabase client and database migration schema`.
  * Push to GitHub.

---

### [ ] Phase 3: Authentication, Session Management & Role Lifecycle
* **Features to Implement:**
  * Implement `src/services/authService.ts` and `src/hooks/useAuth.tsx`.
  * Build modern split-screen Login page (`/login`) with input validation and error feedback.
  * Implement `ProtectedRoute` with session restore on reload and automatic redirection.
  * Document Admin bootstrap SQL query for initial account setup.
* **Testing & Verification:**
  * Verify login with valid and invalid credentials.
  * Verify session persists across page reloads without UI flickering.
  * Verify sign-out clears user context and redirects to `/login`.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement supabase auth, session persistence and route guards`.
  * Push to GitHub and test live login.

---

### [ ] Phase 4: Lead Management — CRUD, Listing, Search & Filters
* **Features to Implement:**
  * Implement `src/services/leadService.ts`.
  * Build Lead Management view (`/leads`):
    * Data table with columns: Name, Phone, Email, Course, Source, Status Badge, Assignee, Created Date.
    * Real-time search filter (matches name, phone, or email).
    * Multi-filter controls: Status dropdown, Source dropdown, Assignee dropdown, Reset button.
    * Pagination / slice controls.
  * Build "Create Lead" modal with required field checks (Name, Phone, Course, Source).
* **Testing & Verification:**
  * Create lead $\rightarrow$ appears immediately in list.
  * Hard page refresh $\rightarrow$ data persists from Supabase.
  * Test combined search and status filters.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement lead listing, creation modal and multi-filter queries`.
  * Push to GitHub and retest on live site.

---

### [ ] Phase 5: Lead Detail Drawer, Status Progression & "Lost Reason" Validation
* **Features to Implement:**
  * Build `LeadDetailDrawer` slide-over view on lead row click.
  * Status Pipeline Stepper (`New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted` / `Lost`).
  * Mandatory "Lost Reason" prompt modal before allowing status change to `Lost`.
  * Lead reassignment control (enabled for Manager/Admin).
  * Automatic audit trail creation in `activities` table on any status or assignee update.
* **Testing & Verification:**
  * Transition lead from `New` to `Contacted` $\rightarrow$ status updates and activity logs.
  * Set `Lost` without reason $\rightarrow$ blocked by client and DB constraint.
  * Provide lost reason $\rightarrow$ persists `lost_reason` to database.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement lead detail drawer, status workflow and lost reason validation`.
  * Push to GitHub.

---

### [ ] Phase 6: Follow-up Scheduling Engine & Overdue Tracking
* **Features to Implement:**
  * Implement `src/services/followUpService.ts`.
  * Build "Schedule Follow-up" modal (due date/time picker, note, assignee).
  * Build Follow-up Center (`/followups`):
    * Tabs: `Overdue`, `Today`, `Upcoming`, `Completed`.
    * **Overdue Logic**: Computed as `due_at < NOW() AND status = 'pending'`. Rendered with warning visual treatment.
    * Action button: "Mark Completed" (sets `completed_at = NOW()`, status to `completed`, removes from overdue).
    * Deep link: "View Lead" opens the lead detail drawer directly.
* **Testing & Verification:**
  * Create follow-up with past timestamp $\rightarrow$ appears in Overdue tab.
  * Mark complete $\rightarrow$ shifts to Completed tab and updates overdue count.
  * Verify persistence on reload.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement follow-up engine, due date logic and overdue categorization`.
  * Push and test live.

---

### [ ] Phase 7: Lead Activity History & Timeline
* **Features to Implement:**
  * Implement `src/services/activityService.ts`.
  * Build `ActivityTimeline` component within `LeadDetailDrawer`:
    * Chronological list with distinct icons for creation, status updates, follow-ups, and notes.
    * Displays actor name, readable description, and timestamps in local browser timezone.
  * "Add Quick Note" form to log manual interactions.
* **Testing & Verification:**
  * Perform actions (status change, follow-up scheduled, note added) $\rightarrow$ verify timeline updates in real-time.
  * Verify entries exist in Supabase `activities` table.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement immutable lead activity history timeline`.
  * Push to GitHub.

---

### [ ] Phase 8: Analytics Dashboard & Metric Reconciliation
* **Features to Implement:**
  * Implement `src/services/dashboardService.ts`:
    * Total Leads: Count of accessible leads.
    * New Leads: Leads where `status = 'New'`.
    * Converted Leads: Leads where `status = 'Converted'`.
    * Overdue Follow-ups: Pending follow-ups where `due_at < NOW()`.
    * Conversion Rate: $(\text{Converted} / \text{Total}) \times 100$ with zero-division safeguard.
  * Metric widgets: KPI cards, leads by status distribution, leads by source breakdown, quick urgent follow-ups list.
  * Reconcile numbers with lead and follow-up list views.
* **Testing & Verification:**
  * Dashboard total leads count matches `/leads` count exactly.
  * Overdue follow-up count matches `/followups` overdue tab count exactly.
* **Deployment Checkpoint:**
  * Git commit: `feat: implement analytics dashboard with unified metric reconciliation`.
  * Push to GitHub.

---

### [ ] Phase 9: Role-Based Access Control (RBAC) & Security Audit
* **Features to Implement:**
  * Test and enforce multi-role view boundaries:
    * Counsellor: Restricted to assigned and self-created leads.
    * Manager / Admin: Global team visibility and re-assignment.
  * Audit RLS policies directly using two separate auth accounts.
  * Verify user cannot self-promote to `admin` through frontend requests.
* **Testing & Verification:**
  * Verify Counsellor A cannot see Counsellor B's unassigned leads.
  * Verify Manager account sees all team leads.
* **Deployment Checkpoint:**
  * Git commit: `security: enforce and verify role-based access control and rls boundaries`.
  * Push to GitHub.

---

### [ ] Phase 10: Responsiveness, Accessibility & Production Build
* **Features to Implement:**
  * Mobile adaptation: Tables switch to stacked cards; drawers adapt to full-screen modals.
  * Accessibility (a11y): Visible focus rings, keyboard navigation, ARIA attributes, color-blind safe badges.
  * Production build optimization: zero TypeScript or Vite bundle warnings.
* **Testing & Verification:**
  * `npm run build` succeeds cleanly.
  * `npm run lint` passes with 0 errors.
  * Verify mobile viewport navigation in browser emulator.
* **Deployment Checkpoint:**
  * Git commit: `polish: mobile responsiveness, accessibility and build validation`.
  * Push to GitHub.

---

### [ ] Phase 11: Production Vercel Deployment & Handover
* **Features to Implement:**
  * Link GitHub repo to Vercel production project.
  * Configure environment variables in Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  * Author comprehensive `README.md` (architecture, setup guide, testing checklist, limitations).
  * Execute live production smoke test on public Vercel domain.
* **Testing & Verification:**
  * End-to-end live test: Sign in $\rightarrow$ Create Lead $\rightarrow$ Schedule Follow-up $\rightarrow$ Mark Complete $\rightarrow$ Verify Dashboard.
* **Deployment Checkpoint:**
  * Final commit and tag: `v1.0.0-mvp`.

---

## 5. Required Environment Variables

```env
# .env (Local development - do NOT commit)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-client-anon-key
```

---

## 6. Risk Mitigation Matrix

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Accidental secret leak to Git** | High | `.gitignore` updated to block `.env*`. Only `.env.example` committed. |
| **Supabase RLS infinite recursion** | High | Use a `SECURITY DEFINER` function (`get_user_role()`) to query `profiles` safely. |
| **Division by zero in conversion rate** | Medium | Implement zero-check: `totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0`. |
| **Client role self-elevation** | High | RLS `WITH CHECK` and DB triggers prevent updating `role` via standard authenticated client requests. |
