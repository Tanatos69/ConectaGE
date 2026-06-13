# Pages & Site Structure
**Project:** Classified Ads Marketplace — Guinea Ecuatorial  
**Contact model:** WhatsApp only (no internal messaging)  
**Document date:** May 2026

---

## Table of Contents
1. [Site Map Overview](#1-site-map-overview)
2. [Public Pages (no login required)](#2-public-pages-no-login-required)
3. [User Pages (login required)](#3-user-pages-login-required)
4. [Auth Pages](#4-auth-pages)
5. [Static / Legal Pages](#5-static--legal-pages)
6. [Admin Pages (moderator + super admin)](#6-admin-pages-moderator--super-admin)
7. [URL Structure Summary](#7-url-structure-summary)

---

## 1. Site Map Overview

```
/                           ← Home
/categorias                 ← All categories directory
/categoria/[slug]           ← Category listing page
/categoria/[slug]/[subslug] ← Subcategory listing page
/buscar                     ← Search results
/anuncios/[slug]            ← Listing detail page
/publicar                   ← Post a new listing (auth)
/planes                     ← Featured listing plans
/sobre-nosotros             ← About
/contacto                   ← Contact form
/ayuda                      ← Help / FAQ
/terminos                   ← Terms & Conditions
/privacidad                 ← Privacy Policy
/cookies                    ← Cookie Policy

── AUTH ──
/login                      ← Sign in
/registro                   ← Register
/recuperar-contrasena       ← Forgot password
/resetear-contrasena        ← Reset password (token link)

── USER DASHBOARD ──
/mi-cuenta                  ← Overview dashboard
/mi-cuenta/anuncios         ← My listings
/mi-cuenta/anuncios/[id]/editar  ← Edit a listing
/mi-cuenta/favoritos        ← Saved listings
/mi-cuenta/notificaciones   ← Notifications
/mi-cuenta/perfil           ← Profile settings

── PUBLIC PROFILES ──
/usuario/[username]         ← Seller public profile

── ADMIN ──
/admin                      ← Admin overview
/admin/moderacion           ← Pending listings queue
/admin/anuncios             ← All listings management
/admin/usuarios             ← User management
/admin/categorias           ← Category management
/admin/resenas              ← Review moderation
/admin/reportes             ← Flagged content
/admin/destacados           ← Featured listings
/admin/analiticas           ← Traffic & analytics
/admin/ajustes              ← Site settings
```

---

## 2. Public Pages (no login required)

---

### 2.1 Home `/`

**Purpose:** First impression, discovery entry point, trust-builder.

**Sections (top to bottom):**
1. **Top navigation bar**
   - Logo
   - Search bar (global, with category filter dropdown)
   - Language switcher (ES · FR · EN · PT · AR · ZH)
   - Login / Register buttons (or user avatar if logged in)
   - "+ Publicar Anuncio" CTA button

2. **Hero section**
   - Headline and subheadline
   - Large search bar with location selector
   - "Publicar gratis" + "Explorar categorías" buttons

3. **Category grid**
   - All 14 main categories with icon + name + listing count
   - "Ver todas las categorías" link

4. **Featured / Promoted listings strip**
   - Horizontal scroll of highlighted listings (paid promotion)
   - Badge: "⭐ Destacado"

5. **Recent listings grid**
   - Last 12 published listings across all categories
   - Card: thumbnail, title, price, city, time ago, category badge
   - Heart icon (save to favorites — triggers login if not authenticated)

6. **Stats bar**
   - Total active listings · Total registered users · Countries covered

7. **How it works**
   - 3 steps: Register → Post → Contact via WhatsApp

8. **Footer**
   - Links: About, Contact, Terms, Privacy, Cookies, Plans
   - Social media icons
   - WhatsApp floating button (fixed, bottom-right, whole site)

---

### 2.2 All Categories `/categorias`

**Purpose:** Full browsable directory of all categories and subcategories.

**Content:**
- Grid of all 14 main categories
- Each card expands to show subcategories on hover/click
- Listing count shown per category
- Click on a category → `/categoria/[slug]`

---

### 2.3 Category Page `/categoria/[slug]`

**Purpose:** Browse all listings within a main category.

**Layout:**
- Breadcrumb: Home > [Category Name]
- Subcategory pills/tabs (filter by subcategory inline)
- **Filter sidebar (desktop) / bottom sheet (mobile):**
  - Price range: min / max slider
  - Condition: New / Used / Refurbished (checkboxes)
  - City: dropdown
  - Date posted: Today / This week / This month
  - Sort: Newest / Price ↑ / Price ↓ / Most viewed
- Listing grid (3 columns desktop, 2 tablet, 1 mobile)
- Listing card contains: main image, title, price, city, time ago, category badge, heart icon
- Pagination (20 listings per page) or infinite scroll

---

### 2.4 Subcategory Page `/categoria/[slug]/[subslug]`

Same layout as Category Page with subcategory pre-selected.

- Breadcrumb: Home > [Category] > [Subcategory]
- Subcategory-specific custom field filters shown in sidebar (e.g. for Coches: fuel type, year range, transmission)

---

### 2.5 Search Results `/buscar?q=...&ciudad=...&cat=...`

**Purpose:** Show results for keyword search queries.

**Content:**
- Query shown: "Resultados para: [query]" with count
- Same filter sidebar as Category Page
- Empty state: "No encontramos anuncios para '[query]'" + suggestions to browse categories
- Related searches bar

---

### 2.6 Listing Detail `/anuncios/[slug]`

**Purpose:** Full information about a single listing. Primary conversion page.

**Layout (top to bottom):**

1. **Breadcrumb:** Home > [Category] > [Subcategory] > [Title]

2. **Image gallery**
   - Main image large
   - Thumbnail row below (up to 10 images)
   - Click → full-screen lightbox
   - Share button (WhatsApp, Facebook, copy link)

3. **Listing header**
   - Title
   - Price (bold, large) + currency
   - Condition badge (New / Used)
   - Date posted + city, region
   - Category badge
   - Views count
   - Heart icon (add to favorites)
   - Report listing button (small, discreet)

4. **Description**
   - Full text with paragraph formatting

5. **Category-specific details table**
   - E.g. for a car: Brand, Model, Year, Mileage, Fuel, Transmission
   - E.g. for real estate: Type, m², Rooms, Bathrooms, Floor, Garage
   - Rendered from `extra_fields` JSON

6. **Seller card**
   - Avatar + name
   - Member since
   - ⭐ Rating (e.g. 4.7 / 5 · 12 reseñas)
   - Verified Seller badge (if applicable)
   - Total active listings
   - Link to public profile: "Ver todos sus anuncios →"

7. **⭐ Reviews & Comments** *(before WhatsApp button)*
   - Average rating bar
   - Existing comments (reviewer name, rating stars, date, comment text, seller reply)
   - "Escribir una reseña" form (logged-in users only)
     - Star rating picker
     - Comment textarea (min 10 chars, max 500)
     - Submit button
   - If not logged in: "Inicia sesión para dejar una reseña"

8. **Contact section** *(after reviews)*
   - Large green **[💬 Contactar por WhatsApp]** button
     - Opens `wa.me/[number]?text=Hola, me interesa tu anuncio: [title] ([url])`
   - Optional phone number (if seller opted to show it)

9. **Related listings**
   - 4–6 listings from same category + same city
   - Same listing card format

---

### 2.7 Seller Public Profile `/usuario/[username]`

**Purpose:** Build trust — buyers can verify the seller.

**Content:**
- Avatar, name, city, member since
- Stats: active listings, average rating, total reviews
- Badges: ✅ Vendedor Verificado / 🏆 Negocio de Confianza
- Active listings grid (paginated, 12 per page)
- Reviews section (all approved reviews this seller has received)
- Report user button

---

### 2.8 Plans Page `/planes`

**Purpose:** Explain paid featured listing options.

**Content:**
- 3 plan cards: 7 days / 15 days / 30 days with price in XAF
- What "featured" means (appears at top, highlighted card)
- How to pay: bank transfer, mobile money — contact admin to activate
- FAQ: "¿Cuándo se activa mi anuncio destacado?"

---

## 3. User Pages (login required)

All routes under `/mi-cuenta` redirect to `/login` if not authenticated.

---

### 3.1 My Dashboard `/mi-cuenta`

**Purpose:** User's personal hub.

**Content:**
- Welcome: "Hola, [Name] 👋"
- KPI cards:
  - Active listings (click → my listings)
  - Pending listings
  - Saved favorites
  - Total views on my listings
- Quick actions bar: "+ Nuevo anuncio" / "Ver mis anuncios" / "Editar perfil"
- Recent notifications (last 3, with "Ver todas" link)
- My latest listings (last 5 in a compact table)

---

### 3.2 My Listings `/mi-cuenta/anuncios`

**Purpose:** Full management of all listings posted by the user.

**Content:**
- Status filter tabs: Todos · Publicados · Pendientes · Rechazados · Expirados
- Table per listing:
  - Thumbnail
  - Title
  - Category
  - Price
  - Status badge (color-coded)
  - Views
  - Date posted / expires
  - Actions: **Ver** · **Editar** · **Renovar** · **Eliminar** · **Destacar**
- If status is **Rechazado**: rejection reason shown inline in orange
- If status is **Expirado**: "Renovar" button prominently shown
- Pagination (10 per page)

---

### 3.3 Edit Listing `/mi-cuenta/anuncios/[id]/editar`

Same multi-step form as Post Listing, pre-filled with existing data.

- If listing is **Published** → editing re-submits to moderation (status → Pending)
- Banner shown: "Al guardar los cambios, tu anuncio volverá a revisión antes de publicarse."

---

### 3.4 Post New Listing `/publicar`

**Purpose:** Multi-step form to submit a new listing.

**Step flow:**

```
Step 1: Categoría
  └─ Select main category → select subcategory → confirm

Step 2: Información básica
  ├─ Title (required)
  ├─ Description (rich text, required)
  ├─ Price (required) + currency selector
  ├─ Price type: Fixed / Negotiable / Free / On Request
  └─ Condition: New / Used / Refurbished

Step 3: Detalles específicos  ← dynamic per category
  └─ (e.g. for Coches: Brand, Model, Year, Mileage, Fuel, Transmission)

Step 4: Ubicación
  ├─ Country (default: Guinea Ecuatorial)
  ├─ Region (dropdown based on country)
  └─ City (dropdown based on region)

Step 5: Fotos
  ├─ Drag-and-drop upload zone
  ├─ Up to 10 images (JPG, PNG, WebP, max 5MB each)
  ├─ Preview thumbnails with reorder + delete
  └─ First image = main image (drag to reorder)

Step 6: Contacto
  ├─ WhatsApp number (required; pre-filled from profile)
  ├─ Show phone number on listing? (toggle)
  └─ Optional plain phone number field (if toggle on)

Step 7: Revisión y envío
  ├─ Full preview of listing as it will appear
  ├─ Cloudflare Turnstile CAPTCHA
  └─ "Publicar anuncio" submit button
```

**Behavior:**
- Progress bar at top (Steps 1–7)
- Auto-save draft every 60 seconds
- "Guardar borrador" button always visible
- Can navigate back between steps without losing data
- On submit: status = Pending, user sees confirmation: "Tu anuncio está en revisión. Te notificaremos por email cuando sea aprobado."

---

### 3.5 My Favorites `/mi-cuenta/favoritos`

**Content:**
- Grid of all saved listings (same card format as search results)
- Remove from favorites button (trash icon on card)
- If listing is expired/removed: grayed card with "Este anuncio ya no está disponible" + "Eliminar de favoritos"
- Empty state with "Aún no tienes favoritos. ¡Explora anuncios!" + browse button

---

### 3.6 My Notifications `/mi-cuenta/notificaciones`

**Content:**
- Chronological list with unread (bold) vs read state
- Notification types:
  - ✅ Anuncio publicado: "Tu anuncio [title] ha sido aprobado"
  - ❌ Anuncio rechazado: "Tu anuncio [title] fue rechazado. Motivo: [reason]"
  - ⏰ Anuncio por expirar: "Tu anuncio [title] expira en 5 días"
  - ⭐ Nueva reseña: "Alguien dejó una reseña en tu anuncio [title]"
  - ✅ Reseña aprobada: "Tu reseña en [title] ha sido publicada"
- "Marcar todas como leídas" button
- Notifications older than 90 days auto-deleted

---

### 3.7 Profile Settings `/mi-cuenta/perfil`

**Sections:**

**Personal info:**
- Avatar (upload, crop, delete)
- Full name
- Username (used in public profile URL)
- Bio (max 300 chars)
- City + Country

**Contact info:**
- Phone number (required)
- WhatsApp number (required)
- Email address (optional)
- Visibility toggles: show phone on listings? show email on profile?

**Security:**
- Current password + New password + Confirm
- Connected social accounts: Google ✓ / Facebook ✓ — with disconnect button
- Two-factor authentication (optional for users, mandatory for admins)

**Notification preferences:**
- Email me when: listing approved · listing rejected · listing expiring · review posted
- Category subscription alerts (get notified of new listings in selected categories)

**Danger zone:**
- "Desactivar mi cuenta" (soft delete — hides listings, keeps data 30 days)
- "Eliminar mi cuenta permanentemente" (GDPR right to erasure — requires password confirmation)

---

## 4. Auth Pages

### 4.1 Login `/login`
- Email + password form
- "Continuar con Google" button
- "Continuar con Facebook" button
- "¿Olvidaste tu contraseña?" link
- "¿No tienes cuenta? Regístrate" link
- Redirect to previous page after login (or to `/mi-cuenta`)

### 4.2 Register `/registro`
- Phone number (required) — primary identifier
- Full name (required)
- WhatsApp number (optional, defaults to same as phone)
- Email (optional)
- Password (optional but recommended — prompt shown)
- City (required)
- Country (required, default: Guinea Ecuatorial)
- Notification category preferences (multi-select)
- Accept T&C checkbox (required)
- "Crear cuenta" button
- Social login: "Continuar con Google" / "Continuar con Facebook"
- If social login used → Profile Completion Screen (phone + city required, password optional)

### 4.3 Forgot Password `/recuperar-contrasena`
- Email input + "Enviar enlace de recuperación"
- Confirmation message: "Si existe una cuenta con ese correo, recibirás un enlace en breve"

### 4.4 Reset Password `/resetear-contrasena?token=...`
- New password + Confirm password
- Invalidates old password immediately
- Redirects to `/login` on success

---

## 5. Static / Legal Pages

| Page | URL | Content |
|---|---|---|
| About | `/sobre-nosotros` | Mission, team, contact info, social links |
| Contact | `/contacto` | Contact form (name, email, subject, message) + office address + WhatsApp |
| Help / FAQ | `/ayuda` | Accordion FAQ: how to post, how to contact seller, payment, moderation, account |
| Terms & Conditions | `/terminos` | Acceptable use, prohibited items, liability, dispute resolution |
| Privacy Policy | `/privacidad` | Data collected, usage, retention, GDPR rights, contact for data requests |
| Cookie Policy | `/cookies` | Cookie types, opt-out instructions |
| 404 | auto | "Página no encontrada" + search bar + home button |
| 500 | auto | "Error del servidor — estamos trabajando en ello" |

---

## 6. Admin Pages (moderator + super admin)

All `/admin/*` routes:
- Protected by NextAuth.js session check (role must be `moderator` or `super_admin`)
- Unauthorized access → redirect to `/login`
- Super Admin sees everything; Moderator cannot access `/admin/ajustes` or `/admin/usuarios` role changes

---

### 6.1 Admin Overview `/admin`

**Purpose:** Real-time snapshot of the platform.

**KPI cards (top row):**
- 👥 Total usuarios registrados (+ nuevos esta semana)
- 📋 Anuncios activos
- ⏳ Pendientes de revisión (with red badge if > 0)
- 👁 Visitas hoy

**Charts:**
- Line chart: visits per day (last 30 days)
- Bar chart: new users per week (last 8 weeks)
- Bar chart: new listings per day (last 14 days)

**Tables:**
- Latest 5 pending listings (quick approve/reject buttons inline)
- Latest 5 registered users
- Latest 5 reports

---

### 6.2 Moderation Queue `/admin/moderacion`

**Purpose:** Review and approve or reject user-submitted listings.

**Content:**
- Count badge: "14 anuncios pendientes"
- Sorted: oldest first (default) / flagged first
- Each listing card shows:
  - Thumbnail(s) + title + category + description preview
  - Seller info: username, rating, total approved listings, account age
  - Submission date
  - Auto-check flags (prohibited keywords? duplicate title?)
- **Actions per listing:**
  - ✅ Aprobar — publishes listing immediately
  - ✏️ Aprobar con edición — moderator edits before approving (e.g. fix category)
  - ❌ Rechazar — opens modal: mandatory rejection reason dropdown + optional text
  - 🚩 Marcar como spam — rejects + increments user spam count
- Bulk actions: select multiple → Aprobar todos / Rechazar todos

---

### 6.3 All Listings `/admin/anuncios`

**Content:**
- Searchable, filterable table: ID, thumbnail, title, user, category, status, price, city, date, views
- Status filter: All / Published / Pending / Rejected / Expired
- Category filter dropdown
- Date range filter
- Actions per row: View · Edit · Change status · Delete
- Bulk: Delete selected / Export to CSV

---

### 6.4 User Management `/admin/usuarios`

**Content:**
- Searchable table: avatar, name, phone, email, city, role, status, registered date, listings count
- Role filter: All / Subscriber / Verified Seller / Moderator / Super Admin
- Status filter: Active / Banned
- Per user actions:
  - View profile
  - Change role (subscriber → verified seller → moderator)
  - Ban user (with reason — user notified by email)
  - Unban user
  - View all listings by this user
  - Delete account (GDPR)
- Bulk: Export to CSV

---

### 6.5 Category Management `/admin/categorias`

**Content:**
- Tree view of all categories and subcategories with drag-and-drop reorder
- Per category actions: Edit (name in all 6 languages, icon, slug) / Hide / Delete
- "Añadir categoría" button → inline form (name per language, icon, parent category)
- "Añadir subcategoría" button under any category
- Toggle: is_active (hidden from public immediately)
- Field schema editor: define custom fields for this category (name, type, required, options)

---

### 6.6 Review Moderation `/admin/resenas`

**Content:**
- Pending reviews queue (same listing-card style)
- Each review shows: reviewer, listing, star rating, comment text, date
- Actions: ✅ Aprobar / ❌ Rechazar (with reason) / 🗑 Eliminar
- Bulk actions: Approve all / Reject all selected

---

### 6.7 Reports `/admin/reportes`

**Content:**
- Two tabs: Anuncios reportados / Usuarios reportados
- Each report shows: reporter, reported item, reason, date, current status
- Actions: Review listing · Ban user · Dismiss report · Resolve
- Auto-flag indicator: "⚠️ Este usuario tiene 3 reportes activos"

---

### 6.8 Featured Listings `/admin/destacados`

**Content:**
- Table of all featured listing requests: user, listing title, plan (7/15/30 days), amount, payment method, status (pending/confirmed/expired)
- Actions: Confirm payment → activates featured status with date range / Reject / Expire manually
- "Destacar anuncio manualmente" button (for admin-sponsored promotions, no payment)

---

### 6.9 Analytics `/admin/analiticas`

**Content:**
- Embedded Google Analytics 4 report (via GA4 Embed API) **or** custom charts pulling from:
  - `listing_views` table → views per listing, per category, per city
  - `whatsapp_clicks` table → WhatsApp button clicks per day
  - `users` table → registrations per day
  - `listings` table → posts per day, approval rate
- Date range picker
- Top 10 listings by views
- Top 5 cities by listing activity
- WhatsApp conversion rate (views vs clicks)

---

### 6.10 Site Settings `/admin/ajustes`

**Key/value store for site-wide configuration:**

| Setting | Default | Description |
|---|---|---|
| `site_whatsapp` | +240 XXX XXX XXX | Global floating WhatsApp number |
| `listing_expiry_days` | 60 | Days before a listing auto-expires |
| `max_images_per_listing` | 10 | Max photos per listing submission |
| `max_listings_per_day` | 3 | Rate limit per user per day |
| `moderation_required` | true | All listings require approval before publishing |
| `auto_approve_verified` | true | Verified Sellers bypass moderation queue |
| `maintenance_mode` | false | Show maintenance page to public |
| `featured_price_7d` | 5000 XAF | Price for 7-day featured listing |
| `featured_price_15d` | 8000 XAF | Price for 15-day featured listing |
| `featured_price_30d` | 12000 XAF | Price for 30-day featured listing |
| `default_language` | es | Default site language |
| `contact_email` | admin@site.com | Displayed on contact page |

---

## 7. URL Structure Summary

| Section | Total pages | Notes |
|---|---|---|
| Public browsing | 6 | Home, categories, search, listing detail, profile, plans |
| Auth | 4 | Login, register, forgot/reset password |
| User dashboard | 6 | Overview, listings, edit, favorites, notifications, profile |
| Static/legal | 7 | About, contact, FAQ, terms, privacy, cookies, error pages |
| Admin | 10 | Dashboard, moderation, listings, users, categories, reviews, reports, featured, analytics, settings |
| **Total** | **33 distinct pages/routes** | Dynamic routes (category, listing, user) generate unlimited actual pages |
