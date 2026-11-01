# NeonPrompt — AI Prompt Library & Engineering Platform
## Product Requirements Document (PRD)

---

### 1. Executive Summary
**NeonPrompt** is a production-grade, cyberpunk-styled (Neon Glow) AI prompt intelligence platform and prompt engineering repository. It is engineered for prompt engineers, AI developers, marketers, creators, researchers, and enterprises who require high-performance, battle-tested system prompts, few-shot templates, and production chain-of-thought workflows across ChatGPT, Claude 3.5, Gemini 1.5/2.0, Midjourney v6, DALL-E 3, and specialized enterprise domains.

---

### 2. Core Personas
1. **The Senior Software Architect & AI Engineer:** Needs battle-tested prompts for code refactoring, AST transforms, architecture diagrams, unit testing, and API generation with strict JSON schemas.
2. **The Growth Marketer & Copywriter:** Requires conversion-optimized copywriting frameworks (PAS, AIDA, BAB), programmatic SEO templates, and high-CTR ad creative generators.
3. **The Creative Director & Generative Artist:** Demands precision Midjourney and DALL-E parameter sets (aspect ratios, lighting seeds, camera lenses, stylized rendering).
4. **The Enterprise Executive & Founder:** Needs high-leverage strategic prompts for board decks, business plans, financial projections, investor updates, and market sizing.

---

### 3. Visual Identity & Brand System: "Neon Glow"
- **Primary Color:** `#FF00FF` (Electric Magenta / Cyber Pink)
- **Secondary Color:** `#00FFFF` (Hyper Cyan / Aqua Neon)
- **Accent Color:** `#39FF14` (Radioactive Green / Terminal Lime)
- **Background:** `#0A0A0A` (Deep Obsidian Void)
- **Surface:** `#121212` (Smoked Glass Dark)
- **Surface Elevated:** `#18181B` / `#222226`
- **Typography:**
  - Headings: `Orbitron` (Futuristic geometric sans-serif)
  - Body: `Inter` (Ultra-legible neo-grotesque interface typeface)
- **Aesthetic Principles:**
  - Glowing multi-layered neon drop shadows
  - Glassmorphic card surfaces with fine 1px-2px borders (`rgba(255, 255, 255, 0.08)` to neon accent)
  - Subtle cybernetic grid overlays and animated ambient radial light bursts
  - Instant micro-interactions: copy animations, glowing hover rings, smooth tab transitions

---

### 4. Information Architecture & Site Map
```
/                                   -> Homepage (Hero, Matrix Search, Featured, Categories, Trending, CTA)
/prompts                            -> Directory with Global Multi-Facet Filter (Models, Difficulty, Category)
/prompts/[slug]                     -> Single Prompt Detail (Full Prompt, Token count, Output, Copy, FAQ, Schema)
/categories                         -> 20 Core AI & Industry Categories
/categories/[category]              -> Category Landing with 10 Subcategories & Featured Prompts
/categories/[category]/[subcategory]-> Subcategory Archive with 25 Prompts
/collections                        -> Curated stacks (e.g. "SaaS Founder", "Growth Hacker", "DevOps Ninja")
/collections/[slug]                 -> Curated Collection Detail
/blog                               -> 10 Long-Form Master Articles (3,000+ words each)
/blog/[slug]                        -> In-Depth Article with Sticky TOC, Case Studies, Schemas
/guides                             -> 20 Strategic AI Guides (5,000+ words each)
/guides/[slug]                      -> Guide Engine with Frameworks, Checklists, Interactive Templates
/tools                              -> Interactive Cyberpunk Prompt Builder, Token Estimator & Optimizer
/about                              -> Brand Story, Engineering Philosophy & Roadmap
/contact                            -> Neon Terminal Contact Interface
/faq                                -> 100 Searchable FAQs across 10 Distinct Categories
/privacy                            -> Comprehensive GDPR/CCPA Privacy Policy
/terms                              -> Production Terms of Service & Commercial Usage Rights
/bookmarks                          -> Client & Server Synchronized Saved Prompts
/admin                              -> Full CMS Dashboard (Prompts, Articles, Users, SEO, Analytics)
```

---

### 5. Technical Specifications
- **Framework:** Next.js 15 (App Router, Server Components, Streaming, Server Actions)
- **Language:** TypeScript 5.7+ (Strict Mode)
- **Styling:** Tailwind CSS 3.4+ with custom Neon glow extensions
- **Database:** Prisma ORM with SQLite for instant local out-of-the-box operation and PostgreSQL DDL migrations for enterprise cloud deployment
- **State Management:** Zustand with LocalStorage hydration for instant guest bookmarking
- **Motion:** Framer Motion 12 for spring transitions and neon glow breathing
- **Icons:** Lucide React
- **SEO:** Automated dynamic `sitemap.xml`, `robots.txt`, JSON-LD Structured Data (SoftwareApplication, Article, BreadcrumbList, FAQPage)

