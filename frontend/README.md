# Multi-Tenant SaaS — Premium Public Website Frontend

A production-ready, dynamic public website frontend engine designed for multi-tenant service businesses (Salons, Spas, Beauty Parlours, Wellness Centres, Hair Studios, Skin Care Clinics, Bridal Studios).

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TanStack Query**, one single frontend codebase serves thousands of independent, uniquely branded business storefronts dynamically resolving content from the asynchronous **FastAPI + PostgreSQL** backend.

---

## 1. Multi-Tenant Architecture & Domain Resolution

The application supports two primary access patterns without ever mixing tenant content or exposing private credentials:

1. **Platform Subpath / Slug URL**:
   - `https://platform.com/[slug]`
   - Examples: `platform.com/luxe-salon`, `platform.com/glow-beauty`, `platform.com/royal-spa`
2. **Verified Custom Domains**:
   - `https://www.luxesalon.com`, `https://glowbeauty.com`
   - Next.js middleware inspects the `Host` header, queries the backend domain verification endpoint (`/api/v1/public/websites/resolve/domain?domain=...`), and internally rewrites requests to `/[slug]/...` while preserving the clean custom domain in the visitor's browser.
   - Generates canonical URLs to prevent duplicate SEO indexing between subpath and custom domain versions.

---

## 2. Dynamic Branding System

Every business automatically receives its own dynamic theme powered by CSS variables:

- `--brand-primary`: Brand tone (Obsidian Charcoal, Jade Green, Wine Crimson, Midnight Navy)
- `--brand-secondary`: Accent tone (Warm Gold, Fresh Sage, Rose Coral, Sky Azure)
- `--brand-accent`: Highlights & badges
- `--brand-background` & `--brand-surface`: Clean luxury backdrop
- `--brand-text` & `--brand-text-muted`: Typographic hierarchy

Custom branding or automated luxury presets adapt according to the business type category (`salon`, `spa`, `beauty`, `wellness`) or individual business profile data.

---

## 3. Dynamic Section Rendering Engine

The backend allows company administrators to enable, disable, and vertically reorder homepage sections. The `<SectionRenderer />` reads this configuration dynamically:

- **Respects Order**: Sections render according to `display_order.asc()`.
- **Enforces Visibility**: Disabled sections (`enabled: false`) are completely omitted from the DOM and navigation menu.
- **Resilient**: Gracefully handles unconfigured or partially populated sections without throwing errors.

### Reusable Homepage Sections:
1. **Hero Banner** (`<HeroSection />`): Photographic luxury hero with responsive mobile/desktop banner images, headlines, and booking CTAs.
2. **About Us** (`<AboutSection />`): Editorial narrative, company heritage, certified technician statistics, and mission.
3. **Service Categories** (`<CategorySection />`): Visual catalogue cards linking to category-filtered services.
4. **Featured Services** (`<FeaturedServicesSection />`): Signature treatments with duration, regular vs sale pricing, and detail links.
5. **Special Offers** (`<OffersSection />`): Valid promotional packages, discount tags (Percentage or Flat ₹), coupon codes, and expiration countdowns.
6. **Gallery** (`<GallerySection />`): High-resolution atmosphere masonry grid with accessible full-screen image lightbox.
7. **Instagram Feed** (`<InstagramSection />`): Highlights and direct links to client transformations.
8. **YouTube Showcase** (`<YouTubeSection />`): Treatment walkthroughs with embedded responsive video player modal.
9. **Testimonials** (`<TestimonialsSection />`): Client endorsements with 5-star ratings, quotes, and client titles.
10. **Frequently Asked Questions** (`<FAQSection />`): Accordion answers regarding treatments, bookings, and policies.
11. **Wellness Journal / Blog** (`<BlogSection />`): Latest published articles and beauty regimes.
12. **Contact & Booking** (`<ContactSection />`): Click-to-call, WhatsApp direct booking, studio hours, address, and interactive enquiry form.

---

## 4. Complete Application Routes

| Route | Functionality |
| :--- | :--- |
| `/[slug]` | Dynamic Homepage driven by the Section Rendering Engine |
| `/[slug]/about` | Full company story, philosophy, certified standards, and values |
| `/[slug]/services` | Server-side paginated treatment catalog (search, category tabs, pricing, duration) |
| `/[slug]/services/[serviceSlug]` | Comprehensive service details, preparation advice, related treatments, and booking CTA |
| `/[slug]/offers` | Active limited-time promotions, coupon codes, and privilege packages |
| `/[slug]/gallery` | Studio photography with interactive modal lightbox |
| `/[slug]/blog` | Journal listing with editorial articles, tags, authors, and dates |
| `/[slug]/blog/[blogSlug]` | Full rich article detail page with XSS-sanitized HTML and Article schema |
| `/[slug]/contact` | Direct phone, WhatsApp booking, Google Maps, and validated enquiry form |
| `/[slug]/locations` | Multi-branch outlet directory with primary flagship indicator and directions |
| `/sitemap.xml` | Dynamic XML sitemap for search engine crawlers |
| `/robots.txt` | Standard robots directive |

---

## 5. SEO Optimization & Schema.org Structured Data

- **Dynamic Metadata**: Generates Open Graph, Twitter cards, canonical tags, and favicons from the verified company profile.
- **Rich Snippets (JSON-LD)**:
  - `BeautySalon` or `HealthAndBeautyBusiness` schema with address, coordinates, and contact details.
  - `Service` schema with active pricing and offer availability.
  - `FAQPage` schema for search engine rich results.
  - `Article` schema for published blog guides.

---

## 6. Development & Verification

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Run Development Server
```bash
npm run dev
# Starts on http://localhost:3000
```

### Run Production Build
```bash
npm run build
# Compiles dynamic on-demand routes, static pages, and verifies TypeScript types
```

### Run Vitest Test Suite
```bash
npm test
# Executes unit & component tests across branding, SEO, section rendering, and enquiry forms
```
