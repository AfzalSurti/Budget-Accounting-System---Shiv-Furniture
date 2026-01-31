# Features Documentation (Current Behavior)

Last updated: 2026-01-31

This document describes how the system works right now, based on the current code and routes.

## System Overview
- Frontend: Next.js app in `frontend/`.
- Backend: Express + Prisma + Postgres in `Backend/`.
- Auth: JWT stored in browser localStorage and sent as `Authorization: Bearer <token>` for API calls.
- Roles: Most master-data and report endpoints are ADMIN-only.
- Company-scoped data: `companyId` is required on most APIs.
- Auto-company creation: The backend currently upserts a company record when creating Contacts, Products, Budgets, and Cost Centers (Analytical Accounts), so the default company ID always exists.

## Environment and Configuration
Frontend (`frontend/config.ts`):
- `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_URL` -> API base (defaults to `http://localhost:4000`).
- `NEXT_PUBLIC_COMPANY_ID` -> company scope (defaults to `00000000-0000-0000-0000-000000000001`).

Backend (`Backend/.env` or `.env.example`):
- `PORT` defaults to 4000.
- `DATABASE_URL` for Postgres.
- `JWT_SECRET` required for auth.
- `CORS_ORIGIN` can be `*` or a list.

## Core Features (Real Data)

### Contacts (Frontend: `frontend/app/contacts/page.tsx`)
- Source of truth: `contacts`, `contact_tags`, `contact_tag_assignments`.
- Load: `GET /api/v1/contacts?companyId=...` (includes partner tags).
- Create: `POST /api/v1/contacts`.
  - Payload includes `companyId`, `contactType`, `displayName`, `email`, `phone`, `billingAddress`, `shippingAddress`, and optional `tags` (partner tags).
  - Backend upserts company if missing, then creates the contact and assigns tags.
- Update: `PUT /api/v1/contacts/:id` supports updating partner tags.
- UI shows live data, not mock data.
- Export PDF button opens a print window of the contact list (browser print-to-PDF).

### Products (Frontend: `frontend/app/products/page.tsx`)
- Source of truth: `products` and `product_categories`.
- Load: `GET /api/v1/products?companyId=...` (includes category name).
- Create: `POST /api/v1/products`.
  - Accepts `categoryName` for auto-upsert of category.
  - Backend upserts company if missing.
- Category list for admin rules: `GET /api/v1/product-categories?companyId=...`.

### Cost Centers / Analytical Accounts (Frontend: `frontend/app/analytics/page.tsx`)
- Source of truth: `analytic_accounts`.
- Load: `GET /api/v1/analytical-accounts?companyId=...`.
- Create/Update: `POST /api/v1/analytical-accounts`, `PUT /api/v1/analytical-accounts/:id`.
- Supports hierarchy via `parentId` (parent ? child).
- Server enforces the 5 default cost centers (Manufacturing, Sales, Admin, Operations, Capital) and archives deprecated placeholders.

### Auto-Analytical Models (Frontend: `frontend/app/admin/auto-analytical-models/page.tsx`)
- Source of truth: `auto_analytic_models`, `auto_analytic_rules`.
- Load: `GET /api/v1/auto-analytical-models?companyId=...`.
- Create: `POST /api/v1/auto-analytical-models`.
- Rules can match any combination of:
  - Partner (contact)
  - Partner Tag
  - Product
  - Product Category
- Matching logic:
  - Rule matches if at least one field matches the transaction line.
  - Highest matched fields count wins; ties broken by model priority then rule priority.
- Audit fields stored on line items:
  - `auto_analytic_model_id`
  - `auto_analytic_rule_id`
  - `matched_fields_count`

### Budgets & Revisions (Frontend: `frontend/app/budgets/page.tsx`)
- Source of truth: `budgets`, `budget_revisions`, `budget_lines`.
- Load: `GET /api/v1/budgets?companyId=...`.
  - Latest revision used for display.
- Create budget:
  - `POST /api/v1/budgets` with name, period start/end, status, and allocations per cost center.
- Revise budget:
  - `PUT /api/v1/budgets/:id` creates a new revision with new line allocations.
- Uniqueness enforcement:
  - Prevents creating budgets for the same cost centers within the same period.
- Budget vs Actual:
  - `GET /api/v1/reports/budget-vs-actual` computes budgeted vs actual using posted invoices and bills.
- Charts use live API data (no mock values).

### Sales Workflow
- Sales Orders: `draft ? confirmed ? done` (cancel allowed).
- Invoice generation from Sales Orders supported in backend.
- Status transitions enforced server-side.
- Cost center assignment is at line level; auto-analytic assignment applied when missing.

### Purchase Workflow
- Purchase Orders: `draft ? confirmed ? done` (cancel allowed).
- Vendor Bills can reference Purchase Orders.
- Status transitions enforced server-side.
- Cost center assignment is at line level; auto-analytic assignment applied when missing.

### Invoices & Vendor Bills
- Totals computed from line items on creation.
- Payment state is derived from payment allocations (not manually set).
- Status transitions enforced server-side.

### Payments & Reconciliation
- Source of truth: `payments`, `payment_allocations`, `customer_invoice_payments`, `vendor_bill_payments`.
- Payments can apply to multiple invoices/bills; partial payments supported.
- Derived statuses:
  - `paid` if paid amount = total
  - `partially_paid` if 0 < paid amount < total
  - `not_paid` otherwise
- Applied only to POSTED invoices/bills.

### Portal Views
- Portal users can only see their own documents.
- Portal payments are validated server-side to ensure target documents belong to the portal user.

### Reports & Dashboards
- `GET /api/v1/reports/dashboard/summary` for key metrics.
- `GET /api/v1/reports/dashboard/trends` returns monthly budget/actual/forecast values.
- Dashboard charts use API data (no mock budget data).

## Pages with Mock or Static Data (Not Yet Fully Wired)
- Some marketing-style widgets and AI insight cards are static in the dashboard.
- Some admin pages still use static cards (non-SRS-critical).

## API Overview (Current Routes)
Base: `/api/v1`

Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Master Data
- Contacts: `/contacts` (GET, POST), `/contacts/:id` (GET, PUT, DELETE)
- Contact Tags: `/contact-tags` (GET, POST)
- Products: `/products` (GET, POST), `/products/:id` (GET, PUT, DELETE)
- Product Categories: `/product-categories` (GET)
- Analytical Accounts (Cost Centers): `/analytical-accounts` (GET, POST), `/analytical-accounts/:id` (GET, PUT, DELETE)
- Budgets: `/budgets` (GET, POST), `/budgets/:id` (GET, PUT, DELETE)
- Auto-Analytical Models: `/auto-analytical-models` (GET, POST, PUT, DELETE)

Transactions and Documents
- `GET/POST /transactions`
- `GET /sales-orders`, `GET /purchase-orders`, `GET /vendor-bills`, `GET /invoices`, `GET /payments`

Reports
- `GET /reports/budget-vs-actual`
- `GET /reports/budget-achievement`
- `GET /reports/dashboard/summary`
- `GET /reports/dashboard/top-over-budget`
- `GET /reports/dashboard/top-under-budget`
- `GET /reports/dashboard/trends`

Portal
- `GET /portal/invoices`
- `GET /portal/bills`
- `GET /portal/purchase-orders`
- `GET /portal/payments`
- `POST /portal/payments`

## Notes and Constraints
- The frontend expects `{ success: true, data: ... }`.
- Master-data and report routes are ADMIN-protected (JWT required).
- Budget actuals come only from posted invoices and bills.
- Auto-analytical matching is deterministic and auditable.

## Where to Update This Doc
- Update this file when wiring new pages to the backend or when changing API contracts.
