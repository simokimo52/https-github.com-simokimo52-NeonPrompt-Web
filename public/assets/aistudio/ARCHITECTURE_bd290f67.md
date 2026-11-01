# NeonPrompt Architecture & Engineering Blueprint

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["Client Browser (Next.js 15 App Router / React 19)"]
    CDN["Edge CDN & Static Asset Optimizer"]
    Middleware["Next.js Route Middleware (Security, Analytics, Auth)"]
    AppRouter["App Router (RSC & Client Components)"]
    APIRoutes["Server Actions & Route Handlers (/api/*)"]
    DataLayer["Data Repository Layer (data/ repository + Prisma Client)"]
    DB[("PostgreSQL / SQLite Storage Engine")]

    Client --> CDN
    CDN --> Middleware
    Middleware --> AppRouter
    AppRouter --> APIRoutes
    APIRoutes --> DataLayer
    AppRouter --> DataLayer
    DataLayer --> DB
```

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    Category ||--o{ Subcategory : contains
    Category ||--o{ Prompt : categorizes
    Subcategory ||--o{ Prompt : groups
    Prompt ||--o{ PromptFaq : has
    Prompt ||--o{ CollectionPrompt : included_in
    PromptCollection ||--o{ CollectionPrompt : contains
    User ||--o{ Bookmark : saves
    User ||--o{ Favorite : likes
    User ||--o{ Comment : writes
    User ||--o{ Rating : rates
    Prompt ||--o{ Bookmark : bookmarked_by
    Prompt ||--o{ Favorite : favorited_by
    Prompt ||--o{ Comment : receives
    Prompt ||--o{ Rating : evaluated_by
    Article ||--o{ ArticleFaq : contains
    Guide }|--|| User : created_by
```

---

## 3. SEO Strategy & Technical Foundations
- **Dynamic Meta Generation:** Every category, subcategory, prompt, guide, and article dynamically synthesizes:
  - Canonical URL tags
  - Open Graph title, description, image, and type (`article`, `website`)
  - Twitter Card: `summary_large_image`
  - High-precision keyword tags
- **JSON-LD Schemas:**
  - `BreadcrumbList` on every nested page
  - `FAQPage` schema on prompt pages, FAQ directory, articles, and guides
  - `Article` and `TechArticle` schema on blog and guide entries
  - `SoftwareApplication` and `CreativeWork` schemas on prompt cards
- **Web Vitals & Performance:**
  - Zero layout shift (CLS < 0.01) with pre-allocated font sizing
  - Critical CSS inline via Tailwind CSS
  - Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR)
  - Edge caching with stale-while-revalidate for search endpoints

