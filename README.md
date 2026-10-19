# BrightPath CRM — Admissions & Student Inquiry Pipeline Platform

[![Production Release](https://img.shields.io/badge/Release-v1.0.0--MVP-059669?style=flat-square&logo=git)](https://github.com/sachinadditionalwork-collab/brightpath-crm2)
[![React 19](https://img.shields.io/badge/React-19.2-2563eb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Database-PostgreSQL%2015%20%2B%20RLS-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-475569?style=flat-square)](LICENSE)

> **BrightPath Academy** is a premier coaching institute specializing in career-focused programs (Data Science & AI, Full Stack Development, Cloud Engineering, Cyber Security, UI/UX Design, and Executive MBA).  
> **BrightPath CRM** is the institute's mission-critical admissions platform designed to capture prospective student inquiries, enforce counselor follow-up accountability, safeguard pipeline data via Row-Level Security (RLS), and provide transparent conversion metrics.

---

## Table of Contents
1. [Architectural Overview](#1-architectural-overview)
2. [Dual-Mode Execution (Sandbox vs. Supabase)](#2-dual-mode-execution-sandbox-vs-supabase)
3. [Database Schema & Row-Level Security (RLS)](#3-database-schema--row-level-security-rls)
4. [User Personas & Role-Based Access Control (RBAC)](#4-user-personas--role-based-access-control-rbac)
5. [Core Feature Modules](#5-core-feature-modules)
6. [Design System & Aesthetics](#6-design-system--aesthetics)
7. [Accessibility & Mobile Responsiveness](#7-accessibility--mobile-responsiveness)
8. [Local Development & Setup Guide](#8-local-development--setup-guide)
9. [Supabase Database Deployment Guide](#9-supabase-database-deployment-guide)
10. [Vercel Production Deployment](#10-vercel-production-deployment)
11. [Verification & Audit Checklist](#11-verification--audit-checklist)

---

## 1. Architectural Overview

BrightPath CRM follows a decoupled, service-oriented client architecture with strict type boundaries and zero direct database queries inside UI components:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Client Browser (React 19 SPA)                        │
│                                                                                │
│   ┌────────────────┐   ┌─────────────────┐   ┌─────────────────────────────┐   │
│   │ Dashboard View │   │ Lead Table/Crud │   │ Follow-up Task Center (Tabs)│   │
│   └───────┬────────┘   └────────┬────────┘   └──────────────┬──────────────┘   │
│           │                     │                           │                  │
│   ┌───────┴────────┐   ┌────────┴────────┐   ┌──────────────┴──────────────┐   │
│   │  useDashboard  │   │    useLeads     │   │        useFollowUps         │   │
│   └───────┬────────┘   └────────┬────────┘   └──────────────┬──────────────┘   │
│           │                     │                           │                  │
│   ┌───────┴─────────────────────┴───────────────────────────┴──────────────┐   │
│   │               Decoupled Service Layer (Async Operations)                │   │
│   │    authService.js  •  leadService.js  •  followUpService.js • activity  │   │
│   └─────────────────────────────┬──────────────────────────────────────────┘   │
└─────────────────────────────────┼──────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          │                                               │
   [Keys Configured?]                             [Missing / Unsaved Keys]
          │                                               │
          ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│       Live Supabase API       │               │      Resilient Sandbox        │
│   PostgREST HTTPS Queries     │               │   LocalStorage Multi-Role     │
│   PostgreSQL 15+ Engine       │               │   Instant Demo Evaluation     │
│   Row-Level Security (RLS)    │               │   No API Setup Required       │
└───────────────────────────────┘               └───────────────────────────────┘
```

---

## 2. Dual-Mode Execution (Sandbox vs. Supabase)

BrightPath CRM includes an invariant fallback engine guaranteeing that the CRM **runs out-of-the-box without crashing or throwing blank white screens**:

| Dimension | Sandbox Mode (Default) | Live Supabase Mode |
| :--- | :--- | :--- |
| **Activation** | Active when `.env` is absent or contains placeholder keys | Automatically switches when valid `.env` credentials are saved |
| **Data Persistence** | Browser `localStorage` with initial multi-role seed data | Persistent cloud PostgreSQL 15 database hosted on Supabase |
| **RBAC Enforcement** | Simulated across Admin, Manager, and Counsellor personas | Cryptographically signed JWT tokens and PostgreSQL RLS policies |
| **Diagnostic Banner** | Top diagnostic strip with 1-click Supabase connection guide | Clean production navbar with active database indicator |
| **Live Sync** | Custom DOM event bus (`brightpath:followups_changed`, etc.) | PostgREST synchronous queries with optimistic UI updating |

---

## 3. Database Schema & Row-Level Security (RLS)

All database migrations and seed files are stored in the `/supabase` directory:
- [supabase/migrations/20261018_crm_core_schema.sql](file:///e:/Be10x/brightpath-crm/supabase/migrations/20261018_crm_core_schema.sql)
- [supabase/seed.sql](file:///e:/Be10x/brightpath-crm/supabase/seed.sql)
- [supabase/security_audit.sql](file:///e:/Be10x/brightpath-crm/supabase/security_audit.sql)

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ LEADS : "assigned_to / created_by"
    PROFILES ||--o{ FOLLOW_UPS : "assigned_to / created_by"
    PROFILES ||--o{ ACTIVITIES : "actor_id"
    LEADS ||--o{ FOLLOW_UPS : "lead_id"
    LEADS ||--o{ ACTIVITIES : "lead_id"

    PROFILES {
        uuid id PK "references auth.users"
        text full_name
        text role "counsellor | manager | admin"
        timestamptz created_at
        timestamptz updated_at
    }

    LEADS {
        uuid id PK
        text full_name
        text email "nullable"
        text phone
        text course_interest
        text source "Website | Phone Call | Walk-in | Referral | Social Media"
        text status "New | Contacted | Qualified | Converted | Lost"
        text lost_reason "nullable (mandatory if status = Lost)"
        uuid assigned_to FK "references profiles(id)"
        uuid created_by FK "references profiles(id)"
        text notes "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    FOLLOW_UPS {
        uuid id PK
        uuid lead_id FK "references leads(id)"
        uuid assigned_to FK "references profiles(id)"
        timestamptz due_at
        text note
        text status "pending | completed | cancelled"
        timestamptz completed_at "nullable"
        uuid created_by FK "references profiles(id)"
        timestamptz created_at
    }

    ACTIVITIES {
        uuid id PK
        uuid lead_id FK "references leads(id)"
        uuid actor_id FK "references profiles(id)"
        text activity_type "lead_created | status_changed | note_added | followup_scheduled | followup_completed | lead_reassigned"
        text description
        jsonb metadata
        timestamptz created_at
    }
```

### 3.2 Row-Level Security (RLS) Invariants

1. **RLS Enabled Globally**: Enabled on all four tables (`profiles`, `leads`, `follow_ups`, `activities`).
2. **Infinite Recursion Prevention**:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_user_role()
   RETURNS text
   LANGUAGE sql
   SECURITY DEFINER
   SET search_path = public
   STABLE
   AS $$
     SELECT role FROM public.profiles WHERE id = auth.uid();
   $$;
   ```
3. **Counsellor Boundary Isolation**:
   ```sql
   CREATE POLICY "leads_counsellor_select" ON public.leads
     FOR SELECT
     TO authenticated
     USING (
       public.get_user_role() IN ('admin', 'manager')
       OR assigned_to = auth.uid()
       OR created_by = auth.uid()
     );
   ```
4. **Self-Promotion Guard**:
   Client requests are blocked from modifying their own `role` column via:
   - RLS policy: `WITH CHECK (role = public.get_user_role())`
   - PostgreSQL trigger: `prevent_self_role_elevation()` documented in `supabase/security_audit.sql`.

---

## 4. User Personas & Role-Based Access Control (RBAC)

BrightPath CRM includes three pre-configured personas for testing multi-role workflows:

| Persona | Name | Role | Email | Pipeline Visibility | Reassignment Authority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Rajesh Sharma | `admin` | `admin@brightpath.edu` | Global (All Leads) | Full Reassignment |
| **Admissions Manager** | Vikram Singh | `manager` | `manager@brightpath.edu` | Global (All Leads) | Full Reassignment |
| **Senior Counsellor** | Anjali Gupta | `counsellor` | `counsellor@brightpath.edu` | Scoped (Assigned / Created) | Locked Dropdown |

> **Interactive Persona Simulator**: Visit the **Settings** view (`/settings`) to switch between personas with a single click, inspect real-time security invariant audit tests, and verify boundary isolation.

---

## 5. Core Feature Modules

### 5.1 Analytics & KPI Dashboard (`/`)
- **Live Reconciled Metrics**: Total Inquiries, New Uncontacted Leads, Admissions Converted, Overdue Follow-ups, and Conversion Rate %.
- **Mathematical Zero-Division Guard**: Safeguarded against division by zero:
  $$\text{Conversion Rate} = \begin{cases} \left(\frac{\text{Converted}}{\text{Total}}\right) \times 100 & \text{if Total} > 0 \\ 0.0\% & \text{otherwise} \end{cases}$$
- **Visual Distributions**: Pipeline progression distribution bars and channel breakdown chart.
- **Actionable Follow-up Schedule**: Today's and overdue consultations preview with 1-click completion.
- **Recent Inquiries Feed**: Deep links directly into the slide-over drawer.

### 5.2 Student Leads Engine (`/leads`)
- **Debounced Search (250ms)**: Real-time filtering across student names, phone numbers, and email addresses.
- **Multi-Filter Dropdowns**: Filter by pipeline stage (`New`, `Contacted`, `Qualified`, `Converted`, `Lost`) and source channel.
- **Client-Side & Server Pagination**: 10, 25, or 50 records per page with active range indicators.
- **Create Lead Modal**: Mandatory phone number (minimum 10 digits) and full name validation with animated error shaking.

### 5.3 Slide-Over Detail Drawer & Progression
- **Pipeline Progression**: Visual interactive stages allowing single-click progression from `New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted`.
- **Mandatory Lost Reason**: Marking an inquiry as `Lost` enforces selection of a category reason (budget constraint, schedule mismatch, competitor, etc.) with custom notes.
- **Counselor Reassignment**: Dynamically enabled for Managers and Admins, disabled for Counsellors.
- **Embedded Follow-up Scheduler**: Preset buttons ("Tomorrow 10 AM", "Tomorrow 3 PM", "In 2 Days", "Next Week") for lightning-fast consultation booking.
- **Activity Timeline**: Full chronological audit trail of all status updates, notes, and reassignment logs.

### 5.4 Follow-up Task Center (`/followups`)
- **Real-Time Classification**: Categorized into 4 tabs:
  - `OVERDUE` (`due_at < NOW() AND status = 'pending'`)
  - `TODAY` (`due_at` occurs on current calendar day)
  - `UPCOMING` (`due_at > TODAY AND status = 'pending'`)
  - `COMPLETED` (`status = 'completed'`)
- **Badge Notification Counters**: Colored badges on tab headers and sidebar reflecting exact overdue counts.
- **1-Click Mark Done**: Instantly closes tasks and synchronizes counts across the entire application.

---

## 6. Design System & Aesthetics

BrightPath CRM features a bespoke enterprise aesthetic tailored specifically for high-volume admissions counseling:
- **Obsidian & Deep Slate Surfaces**: Rich obsidian dark sidebar (`#090d16`), slate neutrals (`#0f172a`, `#1e293b`), and clean white card surfaces (`#ffffff`).
- **Curated Color Tokens**: Sky blue for `New`, violet for `Contacted`, warm amber for `Qualified`, emerald for `Converted`, and deep rose for `Lost`/`Overdue`.
- **Fluid Micro-Animations**: GPU-accelerated spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`) for drawer slides, modal reveals, and status badge transitions.
- **Typography Hierarchy**: Crisp Inter sans-serif paired with JetBrains Mono for system IDs and dates.

---

## 7. Accessibility & Mobile Responsiveness

- **Universal Focus Rings**: Explicit `:focus-visible` outline rules (`2px solid #2563eb; outline-offset: 2px`).
- **Vestibular Motion Accommodations**: `@media (prefers-reduced-motion: reduce)` dampens all animations to `0.01ms` for sensitive users.
- **ARIA Dialog Compliance**:
  - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` on all modal containers and drawers.
  - Full `htmlFor` $\leftrightarrow$ `id` pairing on all form inputs and textareas.
  - Escape key handlers across all overlay dialogs.
- **Mobile Breakpoint Optimization (`< 640px`)**:
  - Slide-over drawer expands to `100vw` full screen.
  - Modals resize to `calc(100vw - 1.5rem)` and `94vh` max-height.
  - Page header title and action buttons stack cleanly.
  - Stat cards transition to a clean single-column layout.
  - Tables and tabs scroll smoothly with horizontal touch gestures.

---

## 8. Local Development & Setup Guide

### 8.1 Prerequisites
- **Node.js**: `v18.0.0` or higher (verified on Node 20 / 22)
- **npm**: `v9.0.0` or higher

### 8.2 Installation & Startup

```bash
# 1. Clone repository
git clone https://github.com/sachinadditionalwork-collab/brightpath-crm2.git
cd brightpath-crm2

# 2. Install dependencies
npm install

# 3. (Optional) Configure live Supabase credentials
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start local Vite development server
npm run dev
```

Navigate to `http://localhost:5173/` in your browser. The CRM will launch immediately in sandbox evaluation mode if `.env` is unconfigured.

### 8.3 Quality & Build Scripts

```bash
# Run ESLint validation (enforcing React 19 purity and zero warnings)
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 9. Supabase Database Deployment Guide

To link BrightPath CRM to your own Supabase project:

1. **Create Supabase Project**:
   Log in to [supabase.com](https://supabase.com) and create a new project named `brightpath-crm`. Note your database region and database password.

2. **Execute Database Migration**:
   Navigate to the **SQL Editor** in your Supabase dashboard:
   - Copy the contents of [`supabase/migrations/20261018_crm_core_schema.sql`](file:///e:/Be10x/brightpath-crm/supabase/migrations/20261018_crm_core_schema.sql).
   - Paste into the SQL editor and click **Run**. This creates the tables, triggers, functions, and RLS policies.

3. **Populate Seed Data**:
   - In the SQL Editor, copy and run [`supabase/seed.sql`](file:///e:/Be10x/brightpath-crm/supabase/seed.sql). This registers the initial demo inquiries and follow-ups.

4. **Apply Self-Promotion Defense Trigger**:
   - Run the audit script in [`supabase/security_audit.sql`](file:///e:/Be10x/brightpath-crm/supabase/security_audit.sql) to enforce the role elevation guard.

5. **Copy Project Keys to `.env`**:
   In your Supabase project, navigate to **Project Settings** $\rightarrow$ **API**:
   - Copy **Project URL** $\rightarrow$ set as `VITE_SUPABASE_URL`.
   - Copy **anon public API Key** $\rightarrow$ set as `VITE_SUPABASE_ANON_KEY`.

---

## 10. Vercel Production Deployment

BrightPath CRM includes [`vercel.json`](file:///e:/Be10x/brightpath-crm/vercel.json) pre-configured for client-side single page app routing:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploying via Vercel Dashboard:
1. Push the repository to GitHub.
2. In Vercel, click **Add New Project** and select `brightpath-crm2`.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-public-client-anon-key`
4. Click **Deploy**. Vercel will execute `npm run build` and publish your live production URL.

---

## 11. Verification & Audit Checklist

- [x] **Zero ESLint Warnings**: Verified clean across all 2000+ modules with `eslint .`.
- [x] **Production Bundle**: Built in 1.16s generating optimized chunks (`dist/assets/`).
- [x] **SPA Routing Rewrites**: Verified with `vercel.json`.
- [x] **Keyboard Accessibility**: Escape key listeners implemented on all 5 dialog components.
- [x] **ARIA Semantics**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `htmlFor`/`id` on form controls.
- [x] **Mobile Responsiveness**: Verified down to 360px viewport widths with responsive drawer and stacked cards.
- [x] **Mathematical Reconciliations**: 1:1 parity between KPI cards, pipeline tables, and follow-up center counts.
- [x] **Multi-Role RBAC**: Audited boundary isolation between Counsellor, Manager, and Administrator.

---

**BrightPath Academy CRM** — Built with React 19 & Supabase. Production Ready.
