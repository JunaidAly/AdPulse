# AdPulse — Publisher Revenue Dashboard (Frontend)

A production-quality **React frontend** for a Google Ad Manager publisher revenue
dashboard. Multi-tenant SaaS: publishers sign in to see their own sites'
performance; admins manage all users, sites, and payouts.

> **Frontend only.** There is no real backend. All data comes from an in-memory
> mock service layer that is designed to be swapped for Firebase with **zero
> changes** to Redux slices or React components.

## Tech stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) for components
- **Redux Toolkit** (`features/<name>/` slice pattern) for state
- **React Router v6** with role-based route guards
- **Recharts** for charts, **lucide-react** for icons, **date-fns** for dates
- **react-hook-form + zod** for form validation, **sonner** for toasts

## Getting started

```bash
npm install --legacy-peer-deps   # legacy flag: tailwindcss-animate peer range
npm run dev                      # start Vite dev server
npm run build                    # typecheck + production build
npm run typecheck                # tsc --noEmit
```

### Demo accounts (any password works)

| Email                | Role      | Notes                               |
| -------------------- | --------- | ----------------------------------- |
| `admin@demo.com`     | admin     | Sees network totals + Admin section |
| `publisher@demo.com` | publisher | Owns 2 sites, 80% share             |

Any other email logs in as a fresh publisher. Sessions live in Redux only (no
`localStorage`), so a refresh returns you to the login screen.

## Architecture: the service layer is the only data boundary

```
services/mock/*  →  Redux slice (createAsyncThunk)  →  React component
```

Components and slices **never** generate mock data and never see business rules
like the revenue-share multiplier. Everything flows through `src/services`:

- **`services/api.ts`** — TypeScript interfaces + domain types. The contract.
  `AuthService`, `ReportsService`, `SitesService`, `PayoutsService`, `UsersService`.
- **`services/mock/*`** — the current in-memory implementation.
  - `seed.ts` — deterministic (seeded PRNG) data: 5 users, 8 sites, 90 days of
    daily metrics per site with weekly seasonality (weekend dips), plus payouts.
  - `db.ts` — the mutable in-memory store + an artificial 300–600 ms delay on
    every call so loading skeletons are exercised.
  - `mockReports.ts` — aggregation **and the revenue-share business rule**.
  - `mockAuth.ts`, `mockSites.ts`, `mockPayouts.ts`, `mockUsers.ts`.
- **`services/index.ts`** — exports the active `services` object. This is the
  single import surface for the rest of the app.

### Money is always integer cents

Revenue is stored, passed around, and computed as **integer cents**. It is
converted to a display string **only** in `lib/format.ts` (`formatCurrency`).
eCPM and CTR are always **recomputed** from adjusted absolute numbers — never
scaled directly.

### Revenue-share simulation (critical business rule)

Each publisher has a `revenueShare` (e.g. `0.80`). Applied **only** inside
`mockReports.ts`, exactly as the real backend will:

1. Multiply impressions, clicks, and revenue by the share; round impressions and
   clicks to integers.
2. **Recompute** eCPM and CTR from the adjusted numbers.
3. Admin requests bypass the multiplier (share = `1.0`) and see 100% raw data.

The admin "Edit user" dialog previews this live: _Raw revenue this month → what
the user sees_.

## Swapping the mock for Firebase (next phase)

1. Add `src/services/firebase/*` — implement the same interfaces from
   `services/api.ts` (`AuthService`, `ReportsService`, …) against Firestore /
   Firebase Auth / Cloud Functions.
2. Apply the revenue-share rule server-side (Cloud Function / security rules) so
   publishers can never query raw numbers — the frontend already assumes the
   service returns already-adjusted values.
3. In `services/index.ts`, swap the imports:

   ```ts
   // from
   import { mockReports } from "./mock/mockReports";
   // to
   import { firebaseReports } from "./firebase/firebaseReports";
   export const services = { reports: firebaseReports, /* … */ };
   ```

No slice or component changes are required.

## Project structure

```
src/
├── app/            store.ts, hooks.ts, router.tsx (role guards)
├── components/
│   ├── ui/         shadcn/ui primitives
│   ├── layout/     AppSidebar, AppLayout, PageHeader, UserMenu
│   ├── common/     StatCard, DateRangePicker, EmptyState, LoadingSkeleton, RoleGate, StatusBadge
│   └── charts/     RevenueAreaChart, ImpressionsBarChart
├── features/
│   ├── auth/       Login, Register, ForgotPassword + authSlice
│   ├── dashboard/  DashboardPage + panels
│   ├── reports/    ReportsPage + table + reportsSlice
│   ├── sites/      SitesPage, AddSiteDialog + sitesSlice
│   ├── payments/   PaymentsPage, PayoutMethodForm + paymentsSlice
│   ├── profile/    ProfilePage + forms
│   └── admin/      Overview, Users, Sites, Payouts + usersSlice + dialogs
├── services/       api.ts, mock/*, index.ts  ← the only data boundary
├── lib/            utils.ts, format.ts, constants.ts
└── hooks/          useAuth.ts, useDateRange.ts
```

## Roles & routing

- Unauthenticated users are redirected to `/login`.
- `/admin/*` is admin-only; publishers are redirected to `/dashboard`.
- Admins see the publisher pages (as network totals) **and** the Admin nav group.