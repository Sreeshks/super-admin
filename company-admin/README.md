# Multi-Tenant SaaS — Company Admin Panel

A modern, production-ready, responsive Company Admin Panel for multi-tenant business website management platforms, tailored for service-based businesses such as salons, spas, beauty parlours, wellness centres, hair studios, and skin care clinics.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TanStack Query**, it communicates with the asynchronous **Python FastAPI + PostgreSQL** backend via secured REST APIs with strict multi-tenant isolation.

---

## 1. Key Architectural Principles

1. **Strict Multi-Tenant Isolation**: The client never supplies or trusts a `tenant_id` query parameter or body payload. The backend resolves tenant context exclusively from the verified JWT token (`COMPANY_ADMIN` or `CONTENT_MANAGER` roles), guaranteeing complete data isolation.
2. **Zero Mock Replacement**: Every route, table, filter, modal, and action connects directly to the FastAPI `/api/v1` backend endpoints.
3. **Resilient Token Lifecycle**: Centralized Axios client handles automatic JWT refresh rotation upon detecting `401 Unauthorized`, seamlessly re-issuing expired access tokens and retrying queued requests before falling back to secure re-authentication.
4. **Optimistic Updates & Server-State Synchronization**: TanStack Query manages query caching, background invalidation, and server-side state synchronization.
5. **Linear/Stripe-Inspired Aesthetic**: High-density, clean design featuring charcoal typography, soft borders, modern modal dialogs, empty states, and responsive navigation drawers for mobile and tablet views.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State & Server Cache**: TanStack React Query v5
- **HTTP Client**: Axios with automatic JWT interceptors
- **Forms & Validation**: React Hook Form with Zod schemas
- **Icons**: Lucide React
- **Notifications**: Sonner toast system
- **Charts**: Recharts (Lead pipeline and enquiry analytics)
- **Testing**: Vitest + React Testing Library + JSDOM

---

## 3. Directory Structure

```
company-admin/
├── public/                 # Static assets and favicon
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/      # Secure Company Admin authentication
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/  # Analytics KPIs, enquiry charts & recent inquiries
│   │   │   ├── website/    # Storefront status, domain, and links
│   │   │   │   ├── sections/ # Section visibility toggles & ordering
│   │   │   │   └── preview/  # Live storefront iframe preview (desktop/tablet/mobile)
│   │   │   ├── services/   # Services catalog with search, category & pricing filters
│   │   │   ├── categories/ # Service category hierarchy & ordering
│   │   │   ├── offers/     # Special promotions, percentage/flat discounts & dates
│   │   │   ├── banners/    # Hero banner slider management
│   │   │   ├── gallery/    # Media asset library & direct upload
│   │   │   ├── social-media/ # Social links, WhatsApp booking, IG & YouTube showcases
│   │   │   ├── testimonials/ # Customer reviews and 5-star ratings
│   │   │   ├── faq/        # Frequently Asked Questions accordion manager
│   │   │   ├── blogs/      # Blog CMS with publication status & cover upload
│   │   │   ├── enquiries/  # Lead management data table (NEW, IN_PROGRESS, RESOLVED)
│   │   │   ├── locations/  # Multi-branch directory with primary flag & maps
│   │   │   ├── team/       # Admin sessions & RBAC permission matrix
│   │   │   ├── profile/    # Business profile, logo upload, address, working hours
│   │   │   ├── activity/   # Audit log timeline for tenant events
│   │   │   └── settings/   # Password reset, session revocation & custom domain info
│   │   └── page.tsx        # Automatic redirect to /dashboard
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, DashboardLayout
│   │   └── ui/             # Reusable Button, Input, Card, Badge, Dialog, Table, etc.
│   ├── lib/
│   │   ├── api/            # Modular backend API clients (auth, profile, services, content...)
│   │   ├── api-client.ts   # Central Axios client with token rotation
│   │   └── utils.ts        # Formatting utilities (currency, dates, bytes, classnames)
│   ├── providers/          # QueryClientProvider and AuthProvider
│   └── types/              # Comprehensive TypeScript interfaces matching backend models
├── test/                   # Vitest unit & component test suites
├── .env.example
├── .env.local
├── package.json
└── tsconfig.json
```

---

## 4. Environment Configuration

Create a `.env.local` file in the root of `company-admin`:

```bash
# FastAPI Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Public Storefront Base URL (for live website preview)
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000
```

---

## 5. Development & Verification

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
# Starts Turbopack dev server on http://localhost:3001
```

### Run Production Build
```bash
npm run build
# Compiles all 24 routes and runs complete TypeScript type-checking
```

### Run Unit & Component Tests
```bash
npm test
# Executes Vitest test suite with jsdom
```

---

## 6. Modules Overview

| Module | Route | Capabilities |
| :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | High-level metrics (Services, Active Offers, Inquiries, Locations, Blog Count), pipeline status breakdown chart, and recent customer leads. |
| **Website Control** | `/website` | Storefront publication state, quick navigation to layout controls, and subpath info. |
| **Section Manager** | `/website/sections` | Drag/button reordering and one-click toggle visibility for Hero, Services, About, Offers, Gallery, FAQ, Contact, etc. |
| **Live Preview** | `/website/preview` | Responsive responsive device preview (Desktop 1200px, Tablet 768px, Mobile 375px) embedding the public storefront. |
| **Services** | `/services` | Paginated catalog table with category filtering, search, pricing (regular vs sale price), duration, image upload, and status toggling. |
| **Categories** | `/categories` | Service category management with display order and image upload. |
| **Offers & Deals** | `/offers` | Percentage / fixed discount promotions, validity dates, banner graphics, and coupon codes. |
| **Hero Banners** | `/banners` | Responsive hero carousel slides with desktop/mobile images, headlines, and call-to-action buttons. |
| **Media Library** | `/gallery` | Asset upload engine supporting images/videos, size validation, preview grid, and quick clipboard URL copy. |
| **Social & Channels** | `/social-media` | WhatsApp direct booking number, Instagram highlights, YouTube showcases, and social profile links. |
| **Leads & Enquiries**| `/enquiries` | Customer booking requests with status transitions (`NEW` → `IN_PROGRESS` → `RESOLVED` → `SPAM`) and notes. |
| **Reviews & FAQ** | `/testimonials`, `/faq`| Social proof management with star ratings, author titles, and accordion FAQs. |
| **Blog CMS** | `/blogs` | Rich articles management with slug, excerpt, content, publication toggle, and cover image. |
| **Outlets & Branches**| `/locations` | Branch manager with primary location indicators, phone numbers, and Google Maps embed links. |
| **Identity & Settings**| `/profile`, `/settings`| Company logo upload, working hours, password updates with session revocation, and audit logs. |
