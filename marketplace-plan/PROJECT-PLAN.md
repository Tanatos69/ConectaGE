# Classified Ads Marketplace — Full Project Plan
**Reference site analyzed:** https://unmillondeanuncios.online  
**Target market:** Guinea Ecuatorial (Malabo · Bata) and diaspora worldwide  
**Document date:** May 2026  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Analysis of Reference Site — Gaps & Weaknesses](#2-analysis-of-reference-site--gaps--weaknesses)
3. [Recommended Technology Stack](#3-recommended-technology-stack)
4. [Hosting Plan (Hostinger)](#4-hosting-plan-hostinger)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Core Features (Client Requirements)](#6-core-features-client-requirements)
7. [Additional Features Not in Reference Site](#7-additional-features-not-in-reference-site)
8. [Security Architecture](#8-security-architecture)
9. [Legal & Compliance](#9-legal--compliance)
10. [Content Moderation Workflow](#10-content-moderation-workflow)
11. [Multilingual Implementation](#11-multilingual-implementation)
12. [Analytics & Custom Admin Dashboard](#12-analytics--custom-admin-dashboard)
13. [Development Phases & Timeline](#13-development-phases--timeline)
14. [Realistic Cost Estimate](#14-realistic-cost-estimate)
15. [Project Name Suggestions](#15-project-name-suggestions)

---

## 1. Executive Summary

The goal is to build a **classified ads marketplace** (OLX/Craigslist model) targeting Guinea Ecuatorial and the global African diaspora. The platform must support thousands of concurrent users, full admin content control, six languages (including Arabic RTL and Chinese), direct WhatsApp integration, a robust product listing form, and a backend analytics dashboard — all on a standard WordPress + PHP stack hosted on Hostinger at a fraction of what the reference site's developer was charging.

**Target scale (Year 1):** 5,000–15,000 registered users, 10,000–50,000 monthly visitors.  
**Realistic monthly infrastructure cost:** $15–$30/month.

---

## 2. Analysis of Reference Site — Gaps & Weaknesses

The following was confirmed from live inspection of `unmillondeanuncios.online`:

| Area | Current State | Problem |
|---|---|---|
| **Theme** | Custom private theme (`multiservicios-vero-theme`) | No public support, zero update path, creates permanent developer dependency |
| **Payments** | Payment pages exist but are empty/non-functional | No actual payment gateway integrated |
| **Languages** | Spanish only | No multilingual support |
| **WhatsApp** | Number listed in footer only | No floating chat button, no per-listing WhatsApp contact |
| **Analytics** | None visible | No traffic or user count dashboard for admins |
| **Category management** | Static, hardcoded | Admins cannot add/edit categories from the backend without developer access |
| **Registration** | Phone-primary, email optional | No social login (Google/Facebook), no phone OTP verification |
| **Content moderation** | Basic approval exists | No moderation dashboard, no reject-with-reason workflow, no spam detection |
| **Search** | Basic keyword search | No filters by price range, location radius, category, date |
| **Security** | No visible security headers beyond basic CSP | No WAF, no brute-force protection, no 2FA for admins |
| **SEO** | No SEO plugin evident | Missing meta descriptions, Open Graph tags, structured data (Schema.org) |
| **Mobile UX** | Functional but basic | No PWA, no app-like experience |
| **Backup** | Unknown | No confirmed automated backup system |
| **Scale** | 17 users, 11 listings | Built for near-zero traffic; not architected for thousands of users |

---

## 3. Recommended Technology Stack

Two viable paths depending on preference. **Option B (custom stack) is recommended** given the team's existing skills in HTML, CSS, JavaScript, Python, and Node.js, and the workflow using VS Code + GitHub.

---

### Option A — WordPress (No-Code/Low-Code Path)

Best if: you want fastest launch with minimal custom coding.

**Why HivePress is needed in the WordPress path:**  
HivePress is a classified ads engine plugin. It provides all the database models, listing forms, user profiles, moderation queue, category system, and search filters out of the box — functionality that would take months to build from scratch. Without it (or a similar plugin), WordPress is just a blog CMS with no marketplace features.

| Function | Plugin | License |
|---|---|---|
| Classified ads engine | **HivePress** (core) + Marketplace extension | Free core; ~$129/year extensions |
| Multilingual (6 languages) | **WPML** Multilingual CMS | ~$99/year |
| Analytics | **WP Statistics** + GA4 via MonsterInsights | Free / ~$99/year |
| WhatsApp button | **Click to Chat** | Free |
| Security / WAF | **Wordfence Security** | Free |
| CAPTCHA | **Cloudflare Turnstile** | Free |
| GDPR consent | **Complianz** | Free |
| SEO | **Rank Math SEO** | Free |
| Backup | **UpdraftPlus** | Free |
| Social login | **Nextend Social Login** | Free |
| 2FA (admin) | **WP 2FA** | Free |
| Theme | **Astra Pro** or **GeneratePress Premium** | ~$59 one-time |

**Limitation:** Admin dashboard is WordPress's built-in UI — customizable but constrained.

---

### Option B — Custom Stack (Recommended) ✅

Best if: you want full control, a custom admin dashboard, no plugin fees, and a modern codebase in VS Code + GitHub.

#### Frontend
| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | React-based, SSR for SEO, API routes built-in, TypeScript support |
| Styling | **Tailwind CSS** | Utility-first, fast to build, RTL support via `tailwindcss-rtl` |
| UI components | **shadcn/ui** | Accessible, unstyled base components, fully customizable |
| State management | **Zustand** or React Context | Lightweight, no Redux overhead |
| Multilingual (i18n) | **next-intl** | Native Next.js i18n, supports RTL locale detection |

#### Backend
| Layer | Tool | Why |
|---|---|---|
| Runtime | **Node.js 20+** | You already know it; same language as frontend |
| API | **Next.js API Routes** or **Express.js** | API routes are simplest; Express if you prefer separation |
| ORM | **Prisma** | Type-safe DB queries, auto-generated migrations, works with PostgreSQL and MySQL |
| Database | **PostgreSQL** (via Hostinger VPS or Supabase) | Better full-text search than MySQL; ideal for listings |
| Authentication | **NextAuth.js v5** | Handles Google + Facebook OAuth AND credentials (email/phone + password) in one library |
| File/Image storage | **Cloudinary** (free tier) | See Section 3.1 |
| Email | **Resend** or **Nodemailer + Gmail SMTP** | Free tiers; Resend has a better developer API |
| Caching | **Redis** (Upstash free tier) or in-memory | Session cache, rate limiting |

#### Python Alternative (if preferred over Node.js)
| Layer | Tool |
|---|---|
| Backend | **Django 5.x** + Django REST Framework |
| Admin panel | **Django Admin** (customizable, production-ready, free) |
| ORM | Django ORM (built-in) |
| Auth | **django-allauth** (Google, Facebook + credentials) |
| Frontend | **Next.js** or **HTMX + Django Templates** |

> **Recommendation:** Use **Next.js full-stack** if you prefer one language (JavaScript) across the whole codebase. Use **Django + Next.js** if you prefer Python on the backend and want Django's built-in admin panel as a starting point for the custom dashboard.

#### Deployment (VS Code → GitHub → Hostinger)
```
VS Code  →  git push  →  GitHub repo
                              │
                    GitHub Actions CI/CD
                              │
                    Hostinger VPS (Ubuntu)
                    (or Vercel for frontend + Railway for API)
```
- Hostinger VPS ($5–$10/month): SSH access, run Node.js/Python directly
- Or: **Vercel** (free tier) for Next.js frontend + **Supabase** (free tier) for PostgreSQL — $0/month at launch

---

### 3.1 — Data & Image Storage

**Database (structured data — users, listings, categories, reviews)**
| Option | Cost | Notes |
|---|---|---|
| **PostgreSQL on Hostinger VPS** | Included in VPS | Full control, no limits |
| **Supabase** (PostgreSQL as a service) | Free up to 500MB | Instant REST + realtime API, good for launch |
| **MySQL on Hostinger Shared** | Included | Familiar, works fine; less powerful full-text search |

**Images and media files (listing photos, user avatars)**
| Option | Free Tier | Notes |
|---|---|---|
| **Cloudinary** ⭐ recommended | 25GB storage + 25GB bandwidth/month | Auto-resize, WebP conversion, CDN delivery, simple API |
| **AWS S3 + CloudFront** | ~$0.023/GB/month | Very cheap at scale, more complex setup |
| **Supabase Storage** | 1GB free | Simpler if already using Supabase DB |
| **Hostinger file storage** | Included | Fine for launch; no CDN; slower for users far from server |

**Recommended storage architecture:**
```
User uploads image  →  Server validates MIME type
                                │
                    Upload to Cloudinary API
                                │
              Cloudinary returns URL (auto-CDN)
                                │
         Store URL in PostgreSQL listings table
                                │
         Frontend renders <img src="cloudinary-url">
```
Images are **never stored on the web server itself** — this keeps the server lean, backups small, and images served via CDN globally.

**What goes in the database (PostgreSQL tables):**
- `users` — id, name, phone, email, password_hash, role, location, created_at
- `listings` — id, user_id, title, description, price, currency, category_id, condition, status (pending/published/rejected/expired), created_at, expires_at
- `listing_images` — id, listing_id, cloudinary_url, display_order
- `categories` — id, name, parent_id, icon, slug, is_active
- `reviews` — id, reviewer_id, reviewed_user_id, listing_id, rating, comment, status
- `favorites` — id, user_id, listing_id
- `reports` — id, reporter_id, listing_id, reason, created_at
- `sessions` — handled by NextAuth.js automatically

---

## 4. Hosting Plan (Hostinger)

The site is **already on Hostinger** — confirmed from live HTTP headers (`platform: hostinger`, `panel: hpanel`). No platform migration needed.

### Recommended Plan for Scale

| Phase | Plan | Price | When |
|---|---|---|---|
| **Launch (0–1,000 users)** | Hostinger Business Shared | ~$7–$9/month | At launch |
| **Growth (1,000–10,000 users)** | Hostinger Cloud Startup | ~$12–$16/month | When needed |
| **Scale (10,000+ users)** | Hostinger Cloud Professional or VPS | ~$20–$40/month | Year 2+ |

**Additional recommended services (all free or low-cost):**
- **Cloudflare Free** — CDN, DDoS protection, DNS proxy, hides origin IP
- **Let's Encrypt SSL** — free, auto-renewed via Hostinger hPanel
- **Hostinger daily backups** — included in Business plan and above

> Maximum realistic monthly cost at launch: **$7–$16/month**. No plan from Hostinger comes close to $480/month.

---

## 5. User Roles & Permissions

Four-tier role system managed via WordPress + User Role Editor:

| Role | Who | Permissions |
|---|---|---|
| **Super Admin** | Site owner(s) | Full access: settings, plugins, themes, all users, all content, billing |
| **Moderator** | Company staff | Approve/reject listings, manage user accounts, view analytics, manage categories |
| **Verified Seller** | Trusted users (manually upgraded) | Post listings without moderation queue; profile badge |
| **Subscriber** | Public registrants (default) | Submit listings for review, manage own profile, save favorites |

---

## 6. Core Features (Client Requirements)

### Req. 1 — Multi-User System (Thousands of Users)
- Open registration via email, phone number, or social login (Google, Facebook)
- Phone number as primary identifier (matching local market behavior)
- Optional WhatsApp number field on registration
- User profiles with: photo, bio, location, rating, active listings count
- Email + SMS notification on account events (approval, message, listing expiry)
- Hostinger Business/Cloud plans support MySQL connections at this scale
- LiteSpeed Cache + Cloudflare CDN ensures performance under load
- Database query optimization via indexing on listing category, location, date fields

### Req. 2 — Content Moderation (Admin Approval Workflow)
See full workflow in [Section 10](#10-content-moderation-workflow).

- All listings from Subscriber-tier users enter a **pending** queue by default
- Moderators see a dedicated **Moderation Panel** in the WordPress admin
- Actions: Approve / Reject (with mandatory reason field) / Request Edit / Flag as Spam
- Rejected listings trigger an automated email to the user explaining why
- Verified Sellers bypass the queue (auto-published)
- HivePress natively supports this pending/published state model

### Req. 3 — WhatsApp Direct Chat Button
Two implementations:

**A. Global floating button (bottom-right of all pages)**
- Plugin: Click to Chat
- Links to the company's main WhatsApp number
- Customizable message pre-fill: "Hola, me interesa un anuncio en [site name]"

**B. Per-listing WhatsApp button**
- Each advertiser enters their WhatsApp number when posting a listing
- A "Contactar por WhatsApp" button appears on every listing page
- Links open `https://wa.me/[number]?text=[pre-filled message with listing title]`
- No intermediary — direct device-to-device contact

### Req. 4 — Admin Category Management
- Categories and subcategories fully manageable from admin panel — no developer access required
- Admins can: add, rename, reorder, hide/show, assign icon/emoji, set parent/child relationship
- Category slugs auto-generate for SEO-friendly URLs
- Category-level settings: allow/disallow listings, set required custom fields, set moderation rules

**Full category tree (expandable by admins at any time):**

```
🚗 Vehículos
   ├── Coches / Turismos
   ├── Todoterreno / SUV
   ├── Furgonetas y Camiones
   ├── Motos y Scooters
   ├── Bicicletas
   ├── Minibuses y Microbuses
   ├── Maquinaria Pesada
   ├── Barcos y Embarcaciones
   └── Piezas y Accesorios

🏠 Inmobiliaria
   ├── Casas en Venta
   ├── Casas en Alquiler
   ├── Apartamentos en Venta
   ├── Apartamentos en Alquiler
   ├── Habitaciones en Alquiler
   ├── Terrenos y Solares
   ├── Locales Comerciales
   ├── Oficinas
   ├── Naves Industriales
   └── Garajes y Trasteros

💻 Electrónica
   ├── Móviles y Smartphones
   ├── Tablets
   ├── Ordenadores y Portátiles
   ├── Televisores
   ├── Cámaras y Fotografía
   ├── Audio y Sonido
   ├── Consolas y Videojuegos
   ├── Electrodomésticos
   ├── Impresoras y Periféricos
   └── Accesorios y Cables

💼 Empleo
   ├── Ofertas de Trabajo (empresa busca empleado)
   ├── Demandas de Trabajo (empleado busca empleo)
   ├── Empleo Público
   ├── Trabajos Temporales / Freelance
   ├── Conductores y Transporte
   ├── Construcción y Obras
   ├── Hostelería y Restauración
   ├── Salud y Cuidados
   ├── Educación y Formación
   └── Informática y Tecnología

🛋️ Muebles y Hogar
   ├── Sofás y Sillones
   ├── Camas y Dormitorios
   ├── Armarios y Roperos
   ├── Mesas y Sillas
   ├── Muebles de Cocina
   ├── Muebles de Oficina
   ├── Decoración
   ├── Iluminación
   ├── Jardín y Exterior
   └── Menaje y Cocina

👕 Moda
   ├── Ropa Hombre
   ├── Ropa Mujer
   ├── Ropa Niños / Bebé
   ├── Zapatos Hombre
   ├── Zapatos Mujer
   ├── Zapatos Niños
   ├── Bolsos y Carteras
   ├── Relojes y Joyería
   ├── Ropa Deportiva
   └── Ropa Tradicional / Africana

🛠️ Servicios
   ├── Informática y Reparación
   ├── Construcción y Reformas
   ├── Electricidad y Fontanería
   ├── Limpieza del Hogar
   ├── Mudanzas y Transporte
   ├── Eventos y Catering
   ├── Traducción e Interpretación
   ├── Diseño Gráfico y Web
   ├── Seguridad y Vigilancia
   └── Turismo y Excursiones

❤️ Salud y Belleza
   ├── Farmacias y Medicamentos
   ├── Clínicas y Consultorios
   ├── Hospitales
   ├── Peluquerías (Hombre / Mujer)
   ├── Salones de Belleza
   ├── Barbería
   ├── Maquillaje y Cosméticos
   ├── Masajes y Bienestar
   └── Ópticas

🎓 Educación
   ├── Colegios y Escuelas
   ├── Universidades
   ├── Academias y Formación
   ├── Clases Particulares
   ├── Idiomas
   ├── Informática y Tecnología
   ├── Música y Arte
   └── Libros y Material Escolar

🏋️ Deporte y Ocio
   ├── Gimnasios
   ├── Campos de Fútbol y Deportivos
   ├── Equipamiento Deportivo
   ├── Bicicletas y Patines
   ├── Natación y Acuático
   ├── Eventos Deportivos
   ├── Juegos y Juguetes
   └── Caza y Pesca

🍽️ Restaurantes y Alimentación
   ├── Restaurantes Africanos
   ├── Restaurantes Internacionales
   ├── Comida Rápida
   ├── Catering
   ├── Supermercados y Tiendas
   ├── Bebidas
   └── Productos Agrícolas

🏨 Turismo y Alojamiento
   ├── Hoteles
   ├── Hostales y Pensiones
   ├── Apartamentos Turísticos
   ├── Agencias de Viaje
   ├── Vuelos
   ├── Excursiones
   └── Visados y Trámites

🏦 Finanzas y Empresas
   ├── Empresas en Venta / Traspaso
   ├── Inversión y Socios
   ├── Seguros
   ├── Préstamos (solo entidades reguladas)
   ├── Cambio de Divisas
   └── Asesoría y Consultoría

🎁 Otros / Varios
   ├── Animales y Mascotas
   ├── Coleccionismo y Arte
   ├── Instrumentos Musicales
   ├── Bebés y Niños
   ├── Se Regala (gratis)
   └── Otros
```

> Admins can add subcategories at any time. Each category and subcategory has its own custom field set, so a "Coches" listing asks for mileage and engine size while a "Clases Particulares" listing asks for subject and age range.

### Req. 5 — Product Information Form (Listing Submission Form)

**Standard fields for all categories:**
- Title (required)
- Category + Subcategory (required)
- Description (rich text, required)
- Price (required; options: fixed / negotiable / free / on request)
- Currency (XAF default; USD and EUR selectable)
- Photos (up to 10 images; max 5MB each; accepted: JPG, PNG, WebP)
- Location: Country → Region → City (dropdown cascade)
- Condition: New / Used / Refurbished
- WhatsApp number (required; pre-filled from user profile, editable per listing) — **primary and only contact channel**
- Optional phone number (visible on listing only if seller opts in)

**Category-specific extra fields (examples):**
- Vehicles: brand, model, year, mileage, fuel type, transmission
- Real estate: property type, m², rooms, bathrooms, floor, garage
- Electronics: brand, model, warranty, storage/RAM
- Jobs: contract type, salary range, experience required, remote/on-site
- Services: service type, availability, service area radius

**Form behavior:**
- AJAX form (no full page reload)
- Image upload with drag-and-drop and preview
- Auto-save as draft every 60 seconds
- CAPTCHA on final submit (Cloudflare Turnstile — invisible, no image puzzle)

### Req. 6 — Six-Language Support

**Languages:** Spanish (default) · French · English · Portuguese · Arabic · Chinese (Simplified)

**Implementation via WPML:**
- All static strings, menus, pages, and category names translated
- Each language gets its own URL structure: `/fr/`, `/en/`, `/pt/`, `/ar/`, `/zh/`
- **Arabic:** full RTL (right-to-left) layout enabled — Astra/GeneratePress both support RTL
- **Chinese:** UTF-8 encoding throughout (already standard in WordPress)
- Language switcher in the navigation header (flag icons + language name)
- Search works within the active language context
- WPML compatible with HivePress and Rank Math SEO (multilingual sitemaps)

**Translation workflow options:**
- Manual: admin translates each string via WPML String Translation
- Assisted: WPML integrates with DeepL or Google Translate for draft auto-translation, then human review

### Req. 7 — Backend Traffic & User Analytics Dashboard
**Two-layer approach:**

**Layer 1 — In-WordPress dashboard (WP Statistics)**
- Visible directly in WordPress admin (no external login needed)
- Shows: daily/weekly/monthly visitor count, top pages, top search keywords, user registration count, new listings count, referral sources, country breakdown
- No personal data stored (GDPR safe — IP anonymized)

**Layer 2 — Google Analytics 4 (via MonsterInsights)**
- Full GA4 integration: real-time visitors, sessions, bounce rate, device breakdown
- Enhanced ecommerce events: listing views, contact button clicks, WhatsApp button clicks
- Accessible from admin dashboard panel

**Key admin metrics visible at a glance:**
- Total registered users (with trend: +N this week)
- Active listings (pending / published / expired)
- Daily unique visitors
- Most viewed categories
- WhatsApp contact button click count
- Top performing listing pages

---

## 7. Additional Features Not in Reference Site

These features are absent from `unmillondeanuncios.online` and add significant value:

### 7.1 Advanced Search & Filtering
- Filter by: price range (min/max), location (city or radius km), category, condition (new/used), date posted, seller type (private/business)
- Sort by: newest, price low→high, price high→low, most viewed
- Saved searches with email alerts ("notify me when a new listing matches this search")

### 7.2 Favorites / Wishlist
- Logged-in users can save listings to a personal favorites list
- One-click heart icon on every listing card
- Favorites accessible from user profile dashboard

### 7.3 Listing Comments & Reviews (Before WhatsApp Button)

**On every listing page, the layout from top to bottom is:**
```
[Photos]
[Title + Price + Location]
[Description]
[Category-specific details]
─────────────────────────────
⭐ RESEÑAS Y COMENTARIOS
─────────────────────────────
[Existing comments with star ratings]
[Leave a comment / rating form]   ← logged-in users only
─────────────────────────────
[📞 Contactar por WhatsApp]       ← appears AFTER comments
[📧 Enviar mensaje interno]
```

**Comment/review system design:**
- Any registered user who has contacted or viewed a listing can leave a comment
- Each comment: star rating (1–5, optional) + text (required, min 10 chars)
- Comments on the listing are public (product-level feedback)
- Reviews on the seller's profile are private to logged-in users (seller-level trust)
- All comments go through moderation before appearing (same admin queue as listings)
- Moderator actions: approve, reject, edit, delete
- Report button on each comment (spam, offensive, irrelevant)
- Seller can reply to a comment (one reply per comment; also moderated)
- Average star rating displayed on listing card in search results

**Comment fields:**
- Rating: ⭐ 1–5 stars (optional but encouraged)
- Comment text: up to 500 characters
- Anonymous option: show as "Usuario verificado" instead of real name
- Date posted (always shown)

**What is NOT allowed in comments (stated in policy):**
- Personal contact details (phone, email, WhatsApp) — auto-filtered by regex
- External links — stripped automatically
- Duplicate comments from same user on same listing

**User Reputation System (Seller Profile):**
- Aggregate score from all reviews across all listings
- Displayed as: ⭐ 4.7 / 5 (23 reseñas)
- "Vendedor Verificado" badge (manually granted by admins)
- "Negocio de Confianza" badge for 10+ reviews with 4.5+ average
- Report user button on profile page (triggers moderator review)

### 7.4 Promoted / Featured Listings
- Sellers can pay to feature their listing (highlighted card, appears at top of category)
- Pricing tiers: 7 days / 15 days / 30 days
- Payment via: Mobile Money (if regional gateway available), bank transfer, or manual confirmation by admin
- Admin can manually apply or remove featured status

### 7.5 Listing Expiry & Renewal
- Listings automatically expire after 30/60/90 days (configurable per category)
- Email reminder sent 5 days before expiry
- One-click renewal from user dashboard (resets timer, re-enters moderation if content changed)
- Expired listings archived (not deleted) — user can reactivate

### 7.6 Notification System
- Email notifications: listing approved, listing rejected (with reason), listing expiring, review approved
- In-site notification bell (custom, built into the admin dashboard)
- Optional Phase 2: WhatsApp notification via Twilio or Africa's Talking API for critical events

### 7.7 Progressive Web App (PWA)
- Install-to-homescreen on Android and iOS without App Store
- Offline browsing of cached listings
- Push notifications (Chrome/Android)
- Plugin: **Super PWA** or **PWA for WP** (free)
- Cost: $0 (no app store fees)

### 7.8 SEO & Structured Data
- Rank Math SEO: auto-generates meta title/description for every listing
- Schema.org markup: `Product`, `Offer`, `LocalBusiness` — makes listings appear in Google rich results
- Automatic XML sitemap (multilingual, one per language)
- Open Graph tags: correct title, image, and description when listing shared on Facebook/WhatsApp

### 7.9 Social Media Login with Fallback

**Full registration flow (social login path):**
```
User clicks "Continuar con Google"
          │
          ▼
Google OAuth completes → returns name + email
          │
          ▼
  ┌── Is this a new account? ──┐
  │YES                         │NO
  ▼                            ▼
Profile Completion Screen    Log in directly
┌──────────────────────────┐  (no extra steps)
│ ✅ Nombre: [from Google] │
│ 📞 Teléfono: [required]  │  ← phone always collected
│ 📱 WhatsApp: [optional]  │
│ 📍 Ciudad: [required]    │
│ 🔑 Crear contraseña      │  ← password always set
│    (optional but shown)  │
└──────────────────────────┘
          │
          ▼
  Account created + logged in
```

**Why a password is always offered even with social login:**
- If Google/Facebook is unavailable or the user loses access to their social account, they can still log in with email + password
- Password field is optional at registration but the system prompts them to set one on first login via a dismissible banner: "Añade una contraseña para acceder sin Google"
- Password reset via email (independent of social provider)

**What NextAuth.js handles automatically (custom stack):**
- Google OAuth 2.0 provider
- Facebook OAuth provider
- Credentials provider (email + password)
- Session management (JWT or database sessions)
- Account linking: if same email registers via Google and then tries email/password, accounts are merged

**Fallback chain for login:**
1. Try Google / Facebook (one tap)
2. Email + password
3. Phone + OTP (optional Phase 2, via Twilio or Africa's Talking SMS API)
4. "Forgotten password" → reset link to email

### 7.10 Admin Bulk Actions
- Bulk approve / bulk reject / bulk delete listings from moderation queue
- Bulk export users to CSV (for email marketing)
- Bulk export listings to CSV (for reporting)

### 7.11 Reporting & Flagging
- "Report this listing" button on every ad (reasons: spam, fraud, prohibited item, wrong category, duplicate)
- Reported listings go to a moderator queue with report reason visible
- User with 3+ reports on different listings gets auto-flagged for admin review

### 7.12 Contact Model — WhatsApp Only ✅
- **No internal messaging system is built.** WhatsApp is the sole buyer-seller contact channel.
- Every listing page displays a prominent **"Contactar por WhatsApp"** button linking to `https://wa.me/[number]?text=[pre-filled message with listing title and URL]`
- The seller's WhatsApp number is stored in their profile and copied to each listing they post (editable per listing)
- A global floating WhatsApp button links to the platform's own support number
- This removes the need for a chat backend, message storage, read receipts, and all related infrastructure — keeping the system simpler, cheaper, and more reliable
- Users who do not have WhatsApp can optionally display a plain phone number on their listing

---

## 8. Security Architecture

Security must be addressed at every layer. The following are non-negotiable for a marketplace handling user data.

### 8.1 Transport Layer
- **HTTPS enforced** on all pages (SSL via Let's Encrypt, auto-renewed)
- **HTTP Strict Transport Security (HSTS)** header enabled
- **TLS 1.2 minimum** (TLS 1.3 preferred) — Hostinger LiteSpeed supports this
- Cloudflare proxy hides origin server IP from attackers

### 8.2 Application Layer (OWASP Top 10 Coverage)
| OWASP Risk | Mitigation |
|---|---|
| A01 Broken Access Control | WordPress roles enforced; no IDOR — listing edit/delete checks user ownership |
| A02 Cryptographic Failures | Passwords hashed with bcrypt (WordPress default); HTTPS for all data in transit |
| A03 Injection (SQL/XSS) | WordPress prepared statements for all DB queries; sanitize_text_field() and wp_kses() on all inputs; no raw `$_GET`/`$_POST` in queries |
| A04 Insecure Design | Content moderation prevents fraudulent listing publication; rate limiting on forms |
| A05 Security Misconfiguration | `wp-config.php` moved above webroot; debug mode OFF in production; `xmlrpc.php` disabled |
| A06 Vulnerable Components | Automatic plugin/theme/WordPress core updates enabled; monthly audit of installed plugins |
| A07 Auth Failures | Brute-force lockout via Wordfence (5 failed logins → 30-min lockout); 2FA mandatory for all admin roles |
| A08 Software & Data Integrity | UpdraftPlus daily encrypted backups to off-site storage (Hostinger + Google Drive) |
| A09 Logging & Monitoring | Wordfence activity log; failed login alerts to admin email; WP Statistics anomaly |
| A10 SSRF | No server-side URL fetching from user input; all external URLs validated against whitelist |

### 8.3 File Upload Security
- Accepted MIME types whitelist: `image/jpeg`, `image/png`, `image/webp` only
- Server-side MIME type validation (not just extension check)
- Images resized and re-encoded on upload (strips embedded malware/EXIF exploits)
- Upload directory protected: no PHP execution in `/wp-content/uploads/`
- Max file size: 5MB per image, 10 images per listing

### 8.4 Admin Account Security
- 2FA mandatory for Super Admin and Moderator roles (WP 2FA plugin)
- Admin login URL changed from `/wp-admin` to a custom URL (hides attack surface)
- Admin accounts use separate strong passwords, not reused anywhere
- Login attempt logs reviewed weekly

### 8.5 Spam & Abuse Prevention
- **Cloudflare Turnstile** on all forms (registration, listing submit, contact form) — invisible CAPTCHA, no UX friction
- **Akismet** for comment/message spam
- **Honeypot fields** on registration form (hidden field that bots fill, humans don't)
- Rate limiting: max 3 listing submissions per user per day (configurable)
- Disposable email domain blocklist on registration

### 8.6 Data Protection
- Passwords: never stored in plaintext; bcrypt hashed by WordPress core
- User phone numbers: stored in database, not exposed in public listing unless user opts in
- Admin exports of user data encrypted in transit
- No third-party advertising scripts that harvest user data without consent

---

## 9. Legal & Compliance

### 9.1 Required Legal Pages (to be written by a local attorney or legal template service)

| Page | Purpose |
|---|---|
| **Terms & Conditions** | Defines acceptable use, prohibited listings (weapons, drugs, counterfeit goods), platform liability limitations, dispute resolution |
| **Privacy Policy** | Explains what data is collected (name, phone, email, IP, location), how it's used, how users can request deletion (GDPR Art. 17) |
| **Cookie Policy** | Lists cookies used (analytics, session, preference); cookie consent banner on first visit |
| **Content Moderation Policy** | Public-facing rules: what listings are rejected and why, appeal process |
| **Prohibited Items Policy** | Explicit list of categories not allowed (firearms, pharmaceutical drugs, financial services without license, etc.) |

### 9.2 GDPR Compliance (applies to EU users and Guinea Ecuatorial residents accessing from EU)
- Cookie consent banner via **Complianz** (granular consent: analytics on/off, marketing on/off)
- User data export on request (WordPress native since 4.9.6)
- User account deletion on request (right to be forgotten)
- Personal data NOT transferred to third parties without consent
- Google Analytics 4 configured with IP anonymization enabled

### 9.3 Marketplace Legal Liability
- Platform is an **intermediary**, not a seller — explicitly stated in Terms & Conditions
- Listings are user-generated content — platform is not liable for accuracy (safe harbor clause)
- DMCA / takedown notice process defined (email address published for rights holders)
- Age restriction: minimum registration age 16 years (stated in T&C; checkbox on registration)
- Fraud disclaimer: platform does not guarantee transactions; no escrow service (unless added in Phase 2)

### 9.4 Guinea Ecuatorial Specific
- Business registration number of the platform operator displayed in footer
- Tax ID (NIF/RUC) displayed on invoices for any paid plans
- Content in Spanish as primary language (official language of GE)
- Local phone numbers displayed for support (already present on reference site)

### 9.5 Intellectual Property
- Users affirm they own rights to uploaded images (checkbox on listing form)
- Platform can remove infringing content without notice (stated in T&C)
- Platform logo, brand, and design are owned by the client — developer has no IP claim

---

## 10. Content Moderation Workflow

```
User submits listing
        │
        ▼
  [AUTO-CHECKS]
  - CAPTCHA passed?        → NO → Reject silently
  - Prohibited keywords?   → YES → Auto-flag + notify moderator
  - Image MIME valid?      → NO → Error returned to user
        │
        ▼ (passes auto-checks)
  Status: PENDING
  Moderator notification email sent
        │
        ▼
  [MODERATOR REVIEW PANEL]
  Moderator sees: title, category, description, images, user history
        │
    ┌───┴───┐
  APPROVE   REJECT
    │           │
    ▼           ▼
Published    Email to user:
(visible     "Tu anuncio fue rechazado.
to public)    Motivo: [required reason field]
              Puedes editarlo y volver a enviarlo."
                   │
                   ▼
             Listing status: REJECTED
             User can edit and resubmit (goes back to PENDING)
```

**Moderation queue features:**
- Sorted by: oldest first (default), flagged first
- Bulk actions: approve all / reject all selected
- Moderator can edit listing before approving (e.g. fix category)
- Listing history log: who approved/rejected and when
- SLA target: listings reviewed within 24 hours (configurable reminder if queue > 20 items)

---

## 11. Multilingual Implementation

### Languages
| Language | Code | Direction | Notes |
|---|---|---|---|
| Spanish | `es` | LTR | Default language |
| French | `fr` | LTR | Large diaspora audience |
| English | `en` | LTR | International reach |
| Portuguese | `pt` | LTR | Regional neighbors (Cameroon, Gabon) |
| Arabic | `ar` | **RTL** | Requires RTL stylesheet; Astra Pro has full RTL support |
| Chinese (Simplified) | `zh-hans` | LTR | UTF-8 standard; no special server config needed |

### WPML Setup
- All menu items, widget text, and theme strings registered in WPML String Translation
- Each listing page auto-creates language variants (can be machine-translated as draft)
- Language switcher: top navigation bar, flag + language name
- URL structure: `site.com/` (ES), `site.com/fr/`, `site.com/en/`, `site.com/pt/`, `site.com/ar/`, `site.com/zh/`
- Admin backend remains in Spanish only (no need to translate admin UI)

### Arabic RTL Checklist
- `dir="rtl"` on `<html>` tag when Arabic is active
- CSS: `text-align: right`, flexbox/grid direction reversed
- Menu: right-to-left order
- Icons: mirrored where directionally meaningful
- Test with real Arabic text (not placeholder) before launch

---

## 12. Analytics & Custom Admin Dashboard

> **Decision:** The admin dashboard will be **custom-built** (not WordPress's default panel). This means $0 in plugin costs and full control over the UI/UX. It is built as a **protected Next.js route** (e.g., `/admin/*`) accessible only to Super Admin and Moderator roles, verified via NextAuth.js session.

### Admin Dashboard Pages

| Page | What it shows |
|---|---|
| `/admin` — Overview | KPI cards + charts (visits, users, listings today/week/month) |
| `/admin/listings` | All listings table: filter by status, category, user, date; bulk actions |
| `/admin/moderation` | Pending queue: approve / reject / edit listings |
| `/admin/users` | All users: search, view profile, upgrade role, ban |
| `/admin/categories` | Add / edit / reorder / hide categories and subcategories |
| `/admin/reviews` | Pending comment/review moderation queue |
| `/admin/reports` | Flagged listings and users |
| `/admin/analytics` | Traffic charts (GA4 embedded or custom) |
| `/admin/settings` | Site settings: WhatsApp number, listing expiry days, max images, etc. |

### Overview Dashboard Widget
```
┌─────────────────────────────────────────────┐
│  HOY          ESTA SEMANA      ESTE MES      │
│  342 visitas  2,104 visitas    8,901 visitas │
│                                              │
│  Usuarios registrados:     1,247 total       │
│    + 12 nuevos esta semana                   │
│                                              │
│  Anuncios:                                   │
│    Publicados: 892  │  Pendientes: 14        │
│    Rechazados: 38   │  Expirados:  120        │
│                                              │
│  Top categorías hoy:                         │
│    1. Vehículos (87 visitas)                 │
│    2. Inmobiliaria (64 visitas)              │
│    3. Electrónica (51 visitas)               │
│                                              │
│  Clics en botón WhatsApp hoy: 43             │
└─────────────────────────────────────────────┘
```

### How analytics data is collected
- **Page views / visits:** Google Analytics 4 (free, embedded via gtag.js) — real-time and historical in GA4 dashboard, or via GA4 Data API embedded in the custom admin panel
- **User counts / listing counts:** Direct SQL queries to PostgreSQL (`SELECT COUNT(*) FROM users WHERE created_at > now() - interval '7 days'`)
- **WhatsApp button clicks:** Custom GA4 event (`whatsapp_click`) fired on button click via JavaScript; count pulled from GA4 API
- **No third-party analytics SaaS required** — all data either in your own database or in the free GA4 account you own

### Google Analytics 4 Events Tracked
- `page_view` — all pages
- `listing_view` — every listing detail page
- `whatsapp_click` — floating button and per-listing button (separate events)
- `search_performed` — search query + results count
- `user_register` — new account created
- `listing_submitted` — form submitted
- `listing_approved` — moderator approves
- `category_view` — category page visit

---

## 13. Development Phases & Timeline

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Hostinger plan confirmed and configured
- [ ] WordPress installed, hardened (security baseline)
- [ ] Cloudflare connected (DNS proxy, SSL)
- [ ] Astra Pro theme installed and configured
- [ ] HivePress + extensions installed and configured
- [ ] User roles defined (Super Admin, Moderator, Verified Seller, Subscriber)
- [ ] Registration form with phone + social login
- [ ] Basic listing submission form (standard fields)
- [ ] Content moderation queue functional
- [ ] Admin can manage categories from backend

### Phase 2 — Core Features (Weeks 4–6)
- [ ] next-intl configured: all 6 languages + locale detection
- [ ] Arabic RTL stylesheet and layout tested with real content
- [ ] WhatsApp floating button (global, all pages)
- [ ] WhatsApp button per listing (uses seller's stored phone number)
- [ ] Advanced search with filters (price range, location, category, condition, date)
- [ ] Category-specific dynamic custom fields
- [ ] SEO: next-sitemap generating multilingual sitemaps, submitted to Google Search Console
- [ ] Custom analytics dashboard (Section 12) connected to GA4 API + PostgreSQL counts

### Phase 3 — Enhanced Features (Weeks 7–9)
- [ ] Favorites / wishlist (heart icon on listing cards)
- [ ] Listing comments and review system (with moderation queue)
- [ ] Seller reputation score on profile page
- [ ] Promoted / featured listings (admin toggle)
- [ ] Listing expiry + renewal email reminders (cron job)
- [ ] Reporting / flagging system
- [ ] PWA manifest + service worker (install to homescreen)
- [ ] Notification emails for all triggers (Resend API)

### Phase 4 — Legal, Testing & Launch (Weeks 10–11)
- [ ] Legal pages: Terms, Privacy Policy, Cookie Policy, Prohibited Items
- [ ] Cookie consent banner (custom or js-cookie based)
- [ ] Security audit: rate limiting, input validation review, OWASP checklist
- [ ] 2FA enforced on all admin accounts
- [ ] Load testing (simulate 500+ concurrent users with k6 or Artillery)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Samsung Internet)
- [ ] Mobile UX review (Android + iOS)
- [ ] Automated daily backup: PostgreSQL `pg_dump` to Cloudinary/S3 via cron
- [ ] Staging → Production deployment via GitHub Actions
- [ ] DNS cutover and 24h monitoring

### Phase 5 — Post-Launch (Ongoing)
- [ ] Monthly npm dependency audit (`npm audit`)
- [ ] Weekly database backup verification
- [ ] Monthly analytics review with client
- [ ] Security log review
- [ ] Content moderation SLA monitoring

---

## 14. Realistic Cost Estimate

### Option B — Custom Stack (Recommended)

**One-Time / Annual Costs**
| Item | Cost (USD) | Notes |
|---|---|---|
| Domain name | $10–$15/year | Via Hostinger or Namecheap |
| Cloudinary (free tier) | $0 | 25GB storage + 25GB bandwidth/month |
| Google Analytics 4 | $0 | Free |
| Google OAuth credentials | $0 | Free via Google Cloud Console |
| Facebook OAuth credentials | $0 | Free via Meta Developer |
| Resend email API (free tier) | $0 | 3,000 emails/month free |
| Supabase (free tier, launch phase) | $0 | 500MB PostgreSQL + auth + storage |
| **Estimated one-time total** | **$0–$15** | |

**Monthly Recurring Costs (launch phase)**
| Item | Cost/month (USD) |
|---|---|
| Hostinger VPS KVM 1 (1 vCPU, 4GB RAM) | ~$8–$10 |
| Cloudflare Free | $0 |
| SSL (Let's Encrypt) | $0 |
| Cloudinary free tier | $0 |
| Supabase free tier | $0 |
| **Total monthly at launch** | **~$8–$10/month** |

**Monthly Recurring Costs (growth phase — 1,000+ users)**
| Item | Cost/month (USD) |
|---|---|
| Hostinger VPS KVM 2 (2 vCPU, 8GB RAM) | ~$15–$20 |
| Cloudinary Starter (if free tier exceeded) | $0–$89 |
| Supabase Pro (if free tier exceeded) | $0–$25 |
| **Total monthly at scale** | **~$15–$45/month** |

### Option A — WordPress Path
**One-Time Costs**
| Item | Cost (USD) |
|---|---|
| Astra Pro theme | $59 |
| HivePress Marketplace extension | $129 |
| WPML Multilingual CMS (1 year) | $99 |
| Domain name | $10–$15/year |
| **Estimated one-time total** | **~$300** |

**Monthly:** $7–$9/month (Hostinger Business Shared)

---

### Year 1 Comparison
| Path | Year 1 Total |
|---|---|
| **Custom Stack (Option B)** | **~$110–$130** |
| WordPress (Option A) | ~$390–$410 |
| Reference site developer's proposal | **$6,040** ($280 + $480×12) |

> The custom stack delivers **more features, full ownership, zero vendor lock-in** at roughly **46× lower cost** than the developer was proposing.

---

## 15. Project Name Suggestions

The names below are designed for trust, regional relevance, and easy pronunciation in Spanish/French/English contexts.

### Top 12 Candidate Names

| Name | Positioning | Why it works |
|---|---|---|
| **AnunciaGE** | Local classifieds | Short, memorable, directly tied to Guinea Ecuatorial (GE) |
| **MercadoGE** | Marketplace broad scope | Works for products, services, jobs, and real estate |
| **Anuncio24 GE** | Always-on marketplace | "24" implies constant availability and fast posting |
| **PlazaMalabo** | City-first launch strategy | Strong local identity for initial market penetration |
| **BataMarket** | Regional relevance | Gives parity to Bata and supports city-based expansion |
| **MiAnuncio GE** | User-centric classifieds | Friendly and personal: "my listing" |
| **ConectaGE** | Community + transactions | Emphasizes trust and direct buyer-seller connection |
| **AfroMercado** | Pan-African growth brand | Scales beyond one country while remaining culturally aligned |
| **PuntoAnuncio** | Modern classifieds brand | Generic enough to expand categories without rebranding |
| **TuPlaza Online** | Traditional market metaphor | Familiar concept translated to digital marketplace |
| **KlikAnuncio** | Mobile-first action brand | "Klik" feels digital and conversion-oriented |
| **VendeYa GE** | Conversion-oriented | Strong CTA tone for sellers and small businesses |

### Premium Brand Direction (if aiming for expansion beyond GE)

| Name | Brand Angle |
|---|---|
| **NovaPlaza** | Modern, scalable, neutral for multi-country rollout |
| **AfriList** | Pan-African classifieds identity |
| **SokoLink** | "Soko" (market) + digital connection concept |
| **MercaConnect** | Marketplace + communication blend |

### Recommended Finalists

1. **AnunciaGE** (best for local trust and immediate clarity)
2. **MercadoGE** (best for broad category expansion)
3. **ConectaGE** (best if brand message is trust and communication)

### Quick Selection Criteria

- Choose a name that is easy to say in Spanish, French, and English.
- Prioritize names with clear marketplace meaning (anuncio/mercado/plaza).
- Avoid very long names (2 words max is ideal).
- Before final approval, verify domain and social handle availability.

---

*Plan prepared May 2026. All plugin prices are approximate and subject to vendor changes. Verify current pricing at each vendor's website before purchase.*
