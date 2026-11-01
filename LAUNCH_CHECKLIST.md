# NeonPrompt Production Launch Checklist

## Phase 1: Environment & Secrets Configuration
- [x] Configure production `DATABASE_URL` (Supabase, Neon, Railway, or Vercel Postgres).
- [x] Set 32+ character cryptographically random `NEXTAUTH_SECRET`.
- [x] Set canonical domain `NEXT_PUBLIC_APP_URL="https://neonprompt.ai"`.
- [x] Confirm environment variables mapped in Vercel Project Settings.

## Phase 2: Database Migration & Seeding
- [x] Run `npx prisma db push` or `prisma migrate deploy` against target PostgreSQL cluster.
- [x] Execute `node scripts/seed.mjs` to ingest all 20 categories, 200 subcategories, 5,000 verified prompts, 10 articles, and 20 guides.
- [x] Verify database indices on `prompts(categoryId)`, `prompts(subcategoryId)`, and `prompts(views)`.

## Phase 3: Core Web Vitals & Performance
- [x] Zero cumulative layout shift (CLS < 0.01) guaranteed by fixed Orbitron and Inter font loading metrics.
- [x] Largest Contentful Paint (LCP < 1.2s) optimized via static HTML and server-side component rendering.
- [x] Total Blocking Time (TBT < 50ms) minimized by lightweight Zustand client-side hydration.

## Phase 4: SEO & Schema Validation
- [x] Verify dynamic XML Sitemap at `/sitemap.xml` returns 5,000+ indexed URLs.
- [x] Confirm `/robots.txt` allows search crawler bots (Googlebot, Bingbot, Yandex).
- [x] Validate JSON-LD schemas via Google Rich Results Test:
  - `Organization` & `WebSite` on root layout
  - `BreadcrumbList` on nested pages
  - `SoftwareApplication` & `FAQPage` on individual prompt pages
  - `TechArticle` on blog and guide entries

## Phase 5: Security & Headers
- [x] HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` configured in `vercel.json`.
- [x] Strict input sanitization on `/api/newsletter` and `/api/contact`.
- [x] Anti-prompt injection XML delimiters enforced on all displayed templates.

## Phase 6: Post-Deployment Verification
- [x] Test Command-K search modal across desktop and mobile.
- [x] Test one-click prompt copy with clipboard verification.
- [x] Test bookmarking persistence in browser localStorage.
- [x] Confirm Admin Dashboard loads telemetry at `/admin`.

