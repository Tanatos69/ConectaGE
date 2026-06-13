# Database Schema
**Project:** Classified Ads Marketplace — Guinea Ecuatorial  
**Engine:** PostgreSQL 16+  
**ORM:** Prisma (for Next.js stack)  
**Document date:** May 2026

---

## Table of Contents
1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [Tables](#2-tables)
3. [Full SQL Schema](#3-full-sql-schema)
4. [Indexes](#4-indexes)
5. [Seed Data — Default Categories](#5-seed-data--default-categories)
6. [Design Decisions & Notes](#6-design-decisions--notes)

---

## 1. Entity Relationship Overview

```
┌──────────┐       ┌──────────────┐       ┌────────────┐
│  users   │──────<│   listings   │>──────│ categories │
└──────────┘       └──────────────┘       └────────────┘
     │                    │                     │
     │                    │                     │ (self-join)
     │            ┌───────┴────────┐            │
     │            │ listing_images │         parent_id
     │            └────────────────┘
     │
     ├──────────< accounts        (OAuth providers — NextAuth)
     ├──────────< sessions        (session tokens — NextAuth)
     ├──────────< favorites       (saved listings)
     ├──────────< reviews         (ratings on listings/sellers)
     ├──────────< reports         (flagged listings/users)
     ├──────────< notifications   (in-app alerts)
     ├──────────< whatsapp_clicks (analytics)
     └──────────< featured_plans  (paid promotions)

listings ──────────< listing_views     (analytics)
listings ──────────< whatsapp_clicks   (analytics)
categories ────────< category_fields   (custom field definitions)
```

---

## 2. Tables

| Table | Purpose |
|---|---|
| `users` | All registered users (subscribers, moderators, admins) |
| `accounts` | OAuth provider links per user (NextAuth.js) |
| `sessions` | Active login sessions (NextAuth.js) |
| `categories` | Main categories and subcategories (self-referencing) |
| `category_fields` | Custom field definitions per category (e.g. "Brand", "Year") |
| `listings` | All classified ads posted by users |
| `listing_images` | Photos attached to a listing (stored on Cloudinary) |
| `reviews` | Comments and star ratings on listings / sellers |
| `favorites` | User-saved listings |
| `reports` | Flagged listings or users |
| `notifications` | In-app notification feed per user |
| `listing_views` | Per-listing page view log (for analytics) |
| `whatsapp_clicks` | Per-listing WhatsApp button click log (for analytics) |
| `featured_plans` | Paid featured listing requests and status |
| `site_settings` | Key-value store for site-wide configuration |

---

## 3. Full SQL Schema

```sql
-- ============================================================
--  EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for trigram full-text search


-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  username          VARCHAR(50)  UNIQUE,                      -- used in /usuario/[username]
  phone             VARCHAR(25)  UNIQUE NOT NULL,             -- primary identifier
  whatsapp          VARCHAR(25),                              -- shown on listings
  email             VARCHAR(255) UNIQUE,
  email_verified_at TIMESTAMP,
  password_hash     VARCHAR(255),                             -- nullable (social-only users)
  avatar_url        VARCHAR(500),                             -- Cloudinary URL
  bio               TEXT,
  country           VARCHAR(100) DEFAULT 'Guinea Ecuatorial',
  city              VARCHAR(100),
  role              VARCHAR(20)  NOT NULL DEFAULT 'subscriber',
                                -- subscriber | verified_seller | moderator | super_admin
  is_active         BOOLEAN     DEFAULT true,
  is_banned         BOOLEAN     DEFAULT false,
  ban_reason        TEXT,
  spam_report_count INT         DEFAULT 0,
  total_listings    INT         DEFAULT 0,                    -- denormalized counter
  average_rating    DECIMAL(3,2) DEFAULT 0.00,               -- denormalized
  total_reviews     INT         DEFAULT 0,                   -- denormalized
  created_at        TIMESTAMP   DEFAULT NOW(),
  updated_at        TIMESTAMP   DEFAULT NOW()
);


-- ============================================================
--  ACCOUNTS  (NextAuth.js — OAuth provider links)
-- ============================================================
CREATE TABLE accounts (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider             VARCHAR(50) NOT NULL,                  -- google | facebook | credentials
  provider_account_id  VARCHAR(255) NOT NULL,
  access_token         TEXT,
  refresh_token        TEXT,
  expires_at           BIGINT,
  token_type           VARCHAR(50),
  scope                TEXT,
  id_token             TEXT,
  created_at           TIMESTAMP   DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);


-- ============================================================
--  SESSIONS  (NextAuth.js)
-- ============================================================
CREATE TABLE sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires       TIMESTAMP   NOT NULL
);


-- ============================================================
--  VERIFICATION TOKENS  (NextAuth.js — email/magic link)
-- ============================================================
CREATE TABLE verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires    TIMESTAMP    NOT NULL,
  PRIMARY KEY (identifier, token)
);


-- ============================================================
--  CATEGORIES  (self-referencing tree)
-- ============================================================
CREATE TABLE categories (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(100) UNIQUE NOT NULL,
  icon         VARCHAR(10),                                   -- emoji
  parent_id    UUID         REFERENCES categories(id) ON DELETE SET NULL,
  sort_order   SMALLINT     DEFAULT 0,
  is_active    BOOLEAN      DEFAULT true,
  -- name in all 6 supported languages
  name_es      VARCHAR(100) NOT NULL,
  name_fr      VARCHAR(100),
  name_en      VARCHAR(100),
  name_pt      VARCHAR(100),
  name_ar      VARCHAR(100),
  name_zh      VARCHAR(100),
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);


-- ============================================================
--  CATEGORY FIELDS  (custom field definitions per category)
--  Defines what extra fields appear on the listing form
--  for a given category (e.g. Brand, Model, Year for Vehicles)
-- ============================================================
CREATE TABLE category_fields (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID         NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  field_key     VARCHAR(50)  NOT NULL,                        -- internal key, e.g. "brand"
  label_es      VARCHAR(100) NOT NULL,
  label_fr      VARCHAR(100),
  label_en      VARCHAR(100),
  label_pt      VARCHAR(100),
  label_ar      VARCHAR(100),
  label_zh      VARCHAR(100),
  field_type    VARCHAR(20)  NOT NULL,
                -- text | number | select | multiselect | boolean | date
  options       JSONB,                                        -- for select/multiselect: ["Toyota","Honda",...]
  is_required   BOOLEAN      DEFAULT false,
  is_filterable BOOLEAN      DEFAULT false,                   -- show in search filters sidebar
  sort_order    SMALLINT     DEFAULT 0,
  UNIQUE (category_id, field_key)
);


-- ============================================================
--  LISTINGS
-- ============================================================
CREATE TABLE listings (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id      UUID          NOT NULL REFERENCES categories(id),
  title            VARCHAR(255)  NOT NULL,
  slug             VARCHAR(320)  UNIQUE NOT NULL,             -- title-slug + short uuid suffix
  description      TEXT          NOT NULL,
  price            DECIMAL(14,2),
  price_type       VARCHAR(20)   DEFAULT 'fixed',
                   -- fixed | negotiable | free | on_request
  currency         VARCHAR(5)    DEFAULT 'XAF',
  condition        VARCHAR(20),
                   -- new | used | refurbished
  country          VARCHAR(100)  DEFAULT 'Guinea Ecuatorial',
  region           VARCHAR(100),
  city             VARCHAR(100),
  whatsapp_number  VARCHAR(25)   NOT NULL,                    -- required — primary contact
  show_phone       BOOLEAN       DEFAULT false,
  phone_number     VARCHAR(25),                               -- optional, shown only if show_phone = true
  extra_fields     JSONB,                                     -- stores category-specific field values
                                                              -- e.g. {"brand":"Toyota","year":2019}
  status           VARCHAR(20)   DEFAULT 'pending',
                   -- pending | published | rejected | expired | archived
  rejection_reason TEXT,
  approved_by      UUID          REFERENCES users(id),
  approved_at      TIMESTAMP,
  is_featured      BOOLEAN       DEFAULT false,
  featured_until   TIMESTAMP,
  views_count      INT           DEFAULT 0,                   -- denormalized counter
  favorites_count  INT           DEFAULT 0,                   -- denormalized counter
  average_rating   DECIMAL(3,2)  DEFAULT 0.00,               -- denormalized
  reviews_count    INT           DEFAULT 0,                   -- denormalized
  expires_at       TIMESTAMP,
  published_at     TIMESTAMP,
  created_at       TIMESTAMP     DEFAULT NOW(),
  updated_at       TIMESTAMP     DEFAULT NOW()
);


-- ============================================================
--  LISTING IMAGES
-- ============================================================
CREATE TABLE listing_images (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  cloudinary_url      VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(255),                         -- needed for Cloudinary deletion API
  display_order       SMALLINT    DEFAULT 0,                 -- 0 = main/cover image
  created_at          TIMESTAMP   DEFAULT NOW()
);


-- ============================================================
--  REVIEWS  (comments + star ratings on listings / sellers)
-- ============================================================
CREATE TABLE reviews (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID        REFERENCES listings(id) ON DELETE SET NULL,
  reviewer_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating            SMALLINT    CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT        NOT NULL CHECK (char_length(comment) >= 10),
  status            VARCHAR(20) DEFAULT 'pending',
                    -- pending | approved | rejected
  rejection_reason  TEXT,
  seller_reply      TEXT,
  seller_reply_at   TIMESTAMP,
  created_at        TIMESTAMP   DEFAULT NOW(),
  updated_at        TIMESTAMP   DEFAULT NOW(),
  UNIQUE (reviewer_id, listing_id)                           -- one review per user per listing
);


-- ============================================================
--  FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID      NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);


-- ============================================================
--  REPORTS  (flagged listings or users)
-- ============================================================
CREATE TABLE reports (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id       UUID        REFERENCES listings(id) ON DELETE CASCADE,
  reported_user_id UUID        REFERENCES users(id) ON DELETE CASCADE,
  reason           VARCHAR(50) NOT NULL,
                   -- spam | fraud | prohibited_item | wrong_category | duplicate | offensive
  description      TEXT,
  status           VARCHAR(20) DEFAULT 'pending',
                   -- pending | reviewed | resolved | dismissed
  resolved_by      UUID        REFERENCES users(id),
  resolved_at      TIMESTAMP,
  created_at       TIMESTAMP   DEFAULT NOW(),
  CHECK (listing_id IS NOT NULL OR reported_user_id IS NOT NULL)
);


-- ============================================================
--  NOTIFICATIONS  (in-app feed per user)
-- ============================================================
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
             -- listing_approved | listing_rejected | listing_expiring
             -- review_received  | review_approved  | featured_expired
             -- account_banned   | new_report_resolved
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  link       VARCHAR(500),                                    -- e.g. /mi-cuenta/anuncios
  is_read    BOOLEAN     DEFAULT false,
  created_at TIMESTAMP   DEFAULT NOW()
);


-- ============================================================
--  LISTING VIEWS  (analytics — page view log)
-- ============================================================
CREATE TABLE listing_views (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_ip_hash  VARCHAR(64),                               -- SHA-256 hashed IP (GDPR safe)
  user_agent_hash VARCHAR(64),
  created_at      TIMESTAMP   DEFAULT NOW()
);


-- ============================================================
--  WHATSAPP CLICKS  (analytics — conversion tracking)
-- ============================================================
CREATE TABLE whatsapp_clicks (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID      NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  clicker_ip_hash VARCHAR(64),
  created_at     TIMESTAMP DEFAULT NOW()
);


-- ============================================================
--  FEATURED PLANS  (paid listing promotion)
-- ============================================================
CREATE TABLE featured_plans (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID         NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_days       SMALLINT     NOT NULL CHECK (plan_days IN (7, 15, 30)),
  amount          DECIMAL(12,2),
  currency        VARCHAR(5)   DEFAULT 'XAF',
  payment_method  VARCHAR(50), -- bank_transfer | mobile_money | admin_manual
  payment_status  VARCHAR(20)  DEFAULT 'pending',
                  -- pending | confirmed | rejected | expired
  confirmed_by    UUID         REFERENCES users(id),
  confirmed_at    TIMESTAMP,
  starts_at       TIMESTAMP,
  ends_at         TIMESTAMP,
  created_at      TIMESTAMP    DEFAULT NOW()
);


-- ============================================================
--  SITE SETTINGS  (key-value configuration store)
-- ============================================================
CREATE TABLE site_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Indexes

```sql
-- ── listings ────────────────────────────────────────────────
CREATE INDEX idx_listings_user_id    ON listings(user_id);
CREATE INDEX idx_listings_category   ON listings(category_id);
CREATE INDEX idx_listings_status     ON listings(status);
CREATE INDEX idx_listings_city       ON listings(city);
CREATE INDEX idx_listings_featured   ON listings(is_featured, featured_until)
  WHERE is_featured = true;
CREATE INDEX idx_listings_expires    ON listings(expires_at)
  WHERE status = 'published';
CREATE INDEX idx_listings_created    ON listings(created_at DESC);
CREATE INDEX idx_listings_price      ON listings(price)
  WHERE price IS NOT NULL;

-- Full-text search across title + description (Spanish stemming)
CREATE INDEX idx_listings_fts ON listings
  USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(description, '')));

-- JSONB index for extra_fields filtering (e.g. filter by brand, year)
CREATE INDEX idx_listings_extra_fields ON listings USING GIN (extra_fields);

-- ── reviews ─────────────────────────────────────────────────
CREATE INDEX idx_reviews_listing     ON reviews(listing_id);
CREATE INDEX idx_reviews_reviewed    ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_status      ON reviews(status);

-- ── favorites ───────────────────────────────────────────────
CREATE INDEX idx_favorites_user      ON favorites(user_id);
CREATE INDEX idx_favorites_listing   ON favorites(listing_id);

-- ── notifications ───────────────────────────────────────────
CREATE INDEX idx_notifications_user  ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_date  ON notifications(created_at DESC);

-- ── listing_views ────────────────────────────────────────────
CREATE INDEX idx_views_listing_date  ON listing_views(listing_id, created_at DESC);

-- ── whatsapp_clicks ──────────────────────────────────────────
CREATE INDEX idx_wa_clicks_listing   ON whatsapp_clicks(listing_id, created_at DESC);

-- ── users ───────────────────────────────────────────────────
CREATE INDEX idx_users_role          ON users(role);
CREATE INDEX idx_users_city          ON users(city);
CREATE INDEX idx_users_phone         ON users(phone);

-- ── category_fields ──────────────────────────────────────────
CREATE INDEX idx_cat_fields_cat      ON category_fields(category_id);

-- ── listing_images ───────────────────────────────────────────
CREATE INDEX idx_images_listing      ON listing_images(listing_id, display_order);
```

---

## 5. Seed Data — Default Categories

```sql
-- ── Main categories (parent_id = NULL) ─────────────────────

INSERT INTO categories (slug, icon, sort_order, name_es, name_fr, name_en, name_pt, name_ar, name_zh) VALUES
  ('vehiculos',    '🚗', 1,  'Vehículos',              'Véhicules',          'Vehicles',             'Veículos',            'مركبات',              '交通工具'),
  ('inmobiliaria', '🏠', 2,  'Inmobiliaria',            'Immobilier',         'Real Estate',          'Imobiliária',         'عقارات',              '房地产'),
  ('electronica',  '💻', 3,  'Electrónica',             'Électronique',       'Electronics',          'Eletrônica',          'إلكترونيات',          '电子产品'),
  ('empleo',       '💼', 4,  'Empleo',                  'Emploi',             'Jobs',                 'Emprego',             'وظائف',               '工作'),
  ('muebles',      '🛋️', 5,  'Muebles y Hogar',         'Meubles & Maison',   'Furniture & Home',     'Móveis e Casa',       'أثاث ومنزل',          '家具'),
  ('moda',         '👕', 6,  'Moda',                    'Mode',               'Fashion',              'Moda',                'أزياء',               '时尚'),
  ('servicios',    '🛠️', 7,  'Servicios',               'Services',           'Services',             'Serviços',            'خدمات',               '服务'),
  ('salud',        '❤️', 8,  'Salud y Belleza',          'Santé & Beauté',     'Health & Beauty',      'Saúde e Beleza',      'صحة وجمال',           '健康美容'),
  ('educacion',    '🎓', 9,  'Educación',               'Éducation',          'Education',            'Educação',            'تعليم',               '教育'),
  ('deporte',      '🏋️', 10, 'Deporte y Ocio',          'Sport & Loisirs',    'Sport & Leisure',      'Desporto e Lazer',    'رياضة',               '体育休闲'),
  ('restaurantes', '🍽️', 11, 'Restaurantes y Comida',   'Restaurants',        'Food & Restaurants',   'Restaurantes',        'مطاعم وطعام',         '餐饮'),
  ('turismo',      '🏨', 12, 'Turismo y Alojamiento',   'Tourisme',           'Tourism & Lodging',    'Turismo',             'سياحة وإقامة',        '旅游住宿'),
  ('finanzas',     '🏦', 13, 'Finanzas y Empresas',     'Finances',           'Finance & Business',   'Finanças',            'مال وأعمال',          '金融商业'),
  ('varios',       '🎁', 14, 'Otros / Varios',          'Divers',             'Miscellaneous',        'Outros',              'متفرقات',             '其他');


-- ── Sample subcategories for Vehículos ──────────────────────

-- Get the vehiculos id first in a real migration; using a subquery here:
INSERT INTO categories (slug, icon, parent_id, sort_order, name_es, name_fr, name_en, name_pt, name_ar, name_zh)
SELECT
  v.slug, v.icon,
  (SELECT id FROM categories WHERE slug = 'vehiculos'),
  v.sort_order, v.name_es, v.name_fr, v.name_en, v.name_pt, v.name_ar, v.name_zh
FROM (VALUES
  ('coches',       '🚙', 1, 'Coches / Turismos',    'Voitures',       'Cars',              'Carros',           'سيارات',       '轿车'),
  ('todoterreno',  '🚐', 2, 'Todoterreno / SUV',    'SUV',            'SUV',               'SUV',              'دفع رباعي',    'SUV'),
  ('furgonetas',   '🚚', 3, 'Furgonetas y Camiones','Camions',        'Vans & Trucks',     'Caminhões',        'شاحنات',       '厢式车'),
  ('motos',        '🏍️', 4, 'Motos y Scooters',     'Motos',          'Motorcycles',       'Motos',            'دراجات نارية', '摩托车'),
  ('bicicletas',   '🚲', 5, 'Bicicletas',           'Vélos',          'Bicycles',          'Bicicletas',       'دراجات هوائية','自行车'),
  ('minibuses',    '🚌', 6, 'Minibuses',            'Minibus',        'Minibuses',         'Miniônibus',       'حافلات صغيرة', '小巴'),
  ('maquinaria',   '🏗️', 7, 'Maquinaria Pesada',   'Machinerie',     'Heavy Machinery',   'Maquinaria',       'آلات ثقيلة',   '重型机械'),
  ('piezas-auto',  '🔧', 8, 'Piezas y Accesorios', 'Pièces Auto',    'Parts & Accessories','Peças Auto',      'قطع غيار',     '汽车配件')
) AS v(slug, icon, sort_order, name_es, name_fr, name_en, name_pt, name_ar, name_zh);


-- ── Sample custom fields for Coches subcategory ─────────────

INSERT INTO category_fields (category_id, field_key, label_es, label_en, field_type, options, is_required, is_filterable, sort_order)
SELECT
  (SELECT id FROM categories WHERE slug = 'coches'),
  f.field_key, f.label_es, f.label_en, f.field_type, f.options::jsonb, f.is_required, f.is_filterable, f.sort_order
FROM (VALUES
  ('brand',        'Marca',        'Brand',        'select',   '["Toyota","Honda","Hyundai","Nissan","Mercedes","BMW","Ford","Peugeot","Renault","Otro"]', true,  true,  1),
  ('model',        'Modelo',       'Model',        'text',     NULL,                                                                                       true,  false, 2),
  ('year',         'Año',          'Year',         'number',   NULL,                                                                                       true,  true,  3),
  ('mileage_km',   'Kilometraje',  'Mileage (km)', 'number',   NULL,                                                                                       false, true,  4),
  ('fuel_type',    'Combustible',  'Fuel Type',    'select',   '["Gasolina","Diésel","Híbrido","Eléctrico","GLP"]',                                        false, true,  5),
  ('transmission', 'Transmisión',  'Transmission', 'select',   '["Manual","Automático"]',                                                                  false, true,  6),
  ('doors',        'Puertas',      'Doors',        'select',   '["2","3","4","5"]',                                                                        false, false, 7),
  ('color',        'Color',        'Color',        'text',     NULL,                                                                                       false, false, 8)
) AS f(field_key, label_es, label_en, field_type, options, is_required, is_filterable, sort_order);


-- ── Default site settings ────────────────────────────────────

INSERT INTO site_settings (key, value) VALUES
  ('site_whatsapp',        '+240555000000'),
  ('listing_expiry_days',  '60'),
  ('max_images_per_listing','10'),
  ('max_listings_per_day', '3'),
  ('moderation_required',  'true'),
  ('auto_approve_verified','true'),
  ('maintenance_mode',     'false'),
  ('featured_price_7d',    '5000'),
  ('featured_price_15d',   '8000'),
  ('featured_price_30d',   '12000'),
  ('default_language',     'es'),
  ('contact_email',        'admin@yoursite.com');
```

---

## 6. Design Decisions & Notes

### Why JSONB for `extra_fields` on listings?
Category-specific attributes (car brand, real estate m², electronics warranty) differ completely between categories. Using JSONB:
- One `listings` table handles all categories with no NULLs in unused columns
- PostgreSQL's GIN index on JSONB allows filtering by any field key at query time
- Schema changes (new field for a category) only require a new row in `category_fields`, not an ALTER TABLE
- Prisma can query JSONB fields with `path` filters

### Why denormalized counters?
`views_count`, `favorites_count`, `average_rating`, `reviews_count` on `listings`, and `total_listings`, `average_rating` on `users` are stored directly rather than counted with JOINs on every page load. They are updated with a PostgreSQL trigger or application-level code on each relevant INSERT/UPDATE. This avoids expensive COUNT(*) queries on high-traffic listing pages.

### Why hashed IPs in analytics tables?
`listing_views.viewer_ip_hash` and `whatsapp_clicks.clicker_ip_hash` store `SHA-256(ip_address)` instead of the raw IP. This makes it impossible to reverse-identify individual users from the analytics data, satisfying GDPR Article 25 (data protection by design), while still allowing deduplication (same IP = same hash → don't count twice per listing per day).

### Session strategy (NextAuth.js)
Using **database sessions** (not JWT) because:
- Admins can be force-logged-out instantly by deleting their session row
- Session data is not exposed in cookies (only a random token is)
- Required for the custom `/admin` dashboard to verify roles server-side

### Soft delete vs hard delete
- Users: `is_active = false` (soft) initially; permanent delete purges all rows (GDPR right to erasure)
- Listings: status `archived` instead of DELETE — allows audit trail and re-activation
- Reviews: never hard-deleted by users; only admins can hard-delete

### `slug` generation for listings
Format: `[title-slugified]-[6-char-random-hex]`  
Example: `toyota-corolla-2019-a3f7c2`  
The suffix prevents slug collisions when two users post the same title.
