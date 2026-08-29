-- ============================================================================
-- GEMarket — categories move from hardcoded TypeScript into a real table.
-- Run manually in Supabase Studio → SQL Editor, after 0010.
--
-- Self-referencing tree (top-level categories have parent_id null,
-- subcategories point at their parent's id). Seed data below is
-- transcribed byte-for-byte from apps/web/src/lib/categories.ts and
-- lib/subcategories.ts so every existing listing's category_slug/
-- subcategory_slug (soft references, not a hard FK — kept that way here
-- too) keeps resolving to the same row it always meant.
--
-- Slug collision note: "restaurantes" is used BOTH as a top-level category
-- slug AND as the slug of its own first subcategory (harmless today since
-- category_slug/subcategory_slug are separate listings columns — real once
-- both live in one table). A plain `unique(slug)` would reject this seed.
-- Fixed with unique(parent_id, slug) — but that alone still allows two
-- DIFFERENT top-level categories (parent_id both null) to share a slug,
-- since SQL never treats two NULLs as equal in a uniqueness check — so a
-- separate partial index enforces top-level slugs are unique among
-- themselves, independent of the parent-scoped constraint.
-- ============================================================================

create table public.categories (
  id         uuid         primary key default gen_random_uuid(),
  slug       text         not null,
  parent_id  uuid         references public.categories (id) on delete cascade,
  name       text         not null,
  -- FontAwesome icon *name* string (e.g. "faCar"), matching the app's
  -- existing iconName convention. Null for subcategories — they render as
  -- plain text pills today, no icon.
  icon       text,
  sort_order smallint     not null default 0,
  is_active  boolean      not null default true,
  created_at timestamptz  not null default now(),
  unique (parent_id, slug)
);

create unique index categories_top_level_slug_idx
  on public.categories (slug)
  where parent_id is null;

create index categories_parent_idx on public.categories (parent_id);

alter table public.categories enable row level security;

create policy "categories_public_select" on public.categories
  for select using (true);

-- No insert/update/delete policy on purpose: only the service-role admin
-- actions write here — same "absence of a policy = service-role-only"
-- idiom already used for tiendas inserts and seller_requests updates.

-- ── Seed: 14 top-level categories ───────────────────────────────────────────

insert into public.categories (slug, name, icon, sort_order) values
  ('vehiculos',    'Vehículos',              'faCar',           0),
  ('inmobiliaria', 'Inmobiliaria',           'faHouse',         1),
  ('electronica',  'Electrónica',            'faLaptop',        2),
  ('empleo',       'Empleo',                 'faBriefcase',     3),
  ('muebles',      'Muebles y Hogar',        'faCouch',         4),
  ('moda',         'Moda',                   'faShirt',         5),
  ('servicios',    'Servicios',              'faWrench',        6),
  ('salud',        'Salud y Belleza',        'faHeartPulse',    7),
  ('educacion',    'Educación',              'faGraduationCap', 8),
  ('deporte',      'Deporte y Ocio',         'faDumbbell',      9),
  ('restaurantes', 'Restaurantes',           'faUtensils',      10),
  ('turismo',      'Turismo',                'faHotel',         11),
  ('finanzas',     'Finanzas y Empresas',    'faLandmark',      12),
  ('varios',       'Otros / Varios',         'faBoxOpen',       13);

-- ── Seed: subcategories, one insert per parent (subquery-per-parent) ───────

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'vehiculos' and parent_id is null), v.name, v.sort_order
from (values
  ('coches-4x4', 'Coches y 4×4', 0),
  ('motos-scooters', 'Motos y Scooters', 1),
  ('camiones-furgonetas', 'Camiones y Furgonetas', 2),
  ('autobuses', 'Autobuses', 3),
  ('barcos', 'Barcos', 4),
  ('maquinaria', 'Maquinaria y Equipos', 5),
  ('repuestos', 'Repuestos y Accesorios', 6)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'inmobiliaria' and parent_id is null), v.name, v.sort_order
from (values
  ('pisos-apartamentos', 'Pisos y Apartamentos', 0),
  ('casas-chalets', 'Casas y Chalets', 1),
  ('locales-oficinas', 'Locales y Oficinas', 2),
  ('terrenos', 'Terrenos y Solares', 3),
  ('garajes', 'Garajes y Aparcamientos', 4),
  ('habitaciones', 'Habitaciones', 5)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'electronica' and parent_id is null), v.name, v.sort_order
from (values
  ('telefonos-tablets', 'Teléfonos y Tablets', 0),
  ('ordenadores', 'Ordenadores y Portátiles', 1),
  ('tv-audio', 'TV, Vídeo y Audio', 2),
  ('camaras', 'Cámaras y Fotografía', 3),
  ('consolas', 'Consolas y Videojuegos', 4),
  ('electrodomesticos', 'Electrodomésticos', 5)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'empleo' and parent_id is null), v.name, v.sort_order
from (values
  ('ofertas', 'Ofertas de Trabajo', 0),
  ('busqueda', 'Búsqueda de Trabajo', 1),
  ('practicas', 'Prácticas y Becas', 2)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'muebles' and parent_id is null), v.name, v.sort_order
from (values
  ('salon-comedor', 'Salón y Comedor', 0),
  ('dormitorio', 'Dormitorio', 1),
  ('cocina', 'Cocina', 2),
  ('jardin-terraza', 'Jardín y Terraza', 3),
  ('decoracion', 'Decoración', 4),
  ('otros-hogar', 'Otros Hogar', 5)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'moda' and parent_id is null), v.name, v.sort_order
from (values
  ('ropa-hombre', 'Ropa de Hombre', 0),
  ('ropa-mujer', 'Ropa de Mujer', 1),
  ('ropa-nino', 'Ropa de Niño', 2),
  ('calzado', 'Calzado', 3),
  ('bolsos-accesorios', 'Bolsos y Accesorios', 4)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'servicios' and parent_id is null), v.name, v.sort_order
from (values
  ('informatica', 'Informática y Tecnología', 0),
  ('construccion', 'Construcción y Reformas', 1),
  ('limpieza', 'Limpieza y Mantenimiento', 2),
  ('transporte', 'Transporte y Mudanzas', 3),
  ('clases', 'Clases y Formación', 4),
  ('otros-servicios', 'Otros Servicios', 5)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'salud' and parent_id is null), v.name, v.sort_order
from (values
  ('medicamentos', 'Medicamentos y Farmacia', 0),
  ('equipos-medicos', 'Equipos Médicos', 1),
  ('bienestar', 'Bienestar y Spa', 2),
  ('dietetica', 'Dietética y Nutrición', 3)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'educacion' and parent_id is null), v.name, v.sort_order
from (values
  ('clases-particulares', 'Clases Particulares', 0),
  ('idiomas', 'Idiomas', 1),
  ('libros-material', 'Libros y Material', 2),
  ('formacion-profesional', 'Formación Profesional', 3)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'deporte' and parent_id is null), v.name, v.sort_order
from (values
  ('futbol', 'Fútbol y Rugby', 0),
  ('fitness', 'Fitness y Gym', 1),
  ('ciclismo', 'Ciclismo', 2),
  ('natacion', 'Natación y Surf', 3),
  ('artes-marciales', 'Artes Marciales', 4),
  ('otros-deportes', 'Otros Deportes', 5)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'restaurantes' and parent_id is null), v.name, v.sort_order
from (values
  ('restaurantes', 'Restaurantes', 0),
  ('cafeterias', 'Cafeterías y Bares', 1),
  ('comida-domicilio', 'Comida a Domicilio', 2),
  ('catering', 'Catering y Eventos', 3)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'turismo' and parent_id is null), v.name, v.sort_order
from (values
  ('hoteles', 'Hoteles y Alojamiento', 0),
  ('apartamentos-turisticos', 'Apartamentos Turísticos', 1),
  ('tours', 'Tours y Excursiones', 2),
  ('agencias', 'Agencias de Viaje', 3)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'finanzas' and parent_id is null), v.name, v.sort_order
from (values
  ('seguros', 'Seguros', 0),
  ('prestamos', 'Préstamos y Créditos', 1),
  ('asesoria', 'Asesoría Empresarial', 2),
  ('inversiones', 'Inversiones', 3)
) as v(slug, name, sort_order);

insert into public.categories (slug, parent_id, name, sort_order)
select v.slug, (select id from public.categories where slug = 'varios' and parent_id is null), v.name, v.sort_order
from (values
  ('animales-mascotas', 'Animales y Mascotas', 0),
  ('juguetes', 'Juguetes e Infantil', 1),
  ('arte-antiguedades', 'Arte y Antigüedades', 2),
  ('otros', 'Otros', 3)
) as v(slug, name, sort_order);

-- ── Verification (run separately after the above; not part of the DDL) ─────
-- Confirms every existing listing's category_slug/subcategory_slug still
-- resolves to a row here. Both should return zero rows.
--
-- select distinct category_slug from public.listings
-- where category_slug not in (select slug from public.categories where parent_id is null);
--
-- select distinct l.category_slug, l.subcategory_slug from public.listings l
-- where l.subcategory_slug <> '' and not exists (
--   select 1 from public.categories c
--   join public.categories p on p.id = c.parent_id
--   where c.slug = l.subcategory_slug and p.slug = l.category_slug
-- );
