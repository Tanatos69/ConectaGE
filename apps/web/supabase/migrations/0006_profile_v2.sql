-- ============================================================================
-- GEMarket — exact age (birth date), demographics at signup, welcome message
-- Run manually in Supabase Studio → SQL Editor, after 0005.
-- ============================================================================

-- ── Exact age: birth_date replaces age_range ────────────────────────────────
-- Age is derived from birth date so it never goes stale; analytics still
-- buckets into ranges at read time. age_range had a single populated row at
-- migration time — acceptable loss agreed with the owner.

alter table public.profiles add column birth_date date
  check (
    birth_date is null
    or (birth_date > '1900-01-01' and birth_date <= (now() - interval '16 years')::date)
  );

alter table public.profiles drop column age_range;

-- ── Copy optional signup demographics from auth metadata ────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, city, gender, birth_date)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '[^+0-9]', '', 'g'), ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    case
      when new.raw_user_meta_data ->> 'gender' in ('male', 'female', 'other', 'prefer_not_to_say')
      then new.raw_user_meta_data ->> 'gender'
    end,
    case
      when (new.raw_user_meta_data ->> 'birth_date') ~ '^\d{4}-\d{2}-\d{2}$'
        and (new.raw_user_meta_data ->> 'birth_date')::date > '1900-01-01'
        and (new.raw_user_meta_data ->> 'birth_date')::date <= (now() - interval '16 years')::date
      then (new.raw_user_meta_data ->> 'birth_date')::date
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Welcome notification for every new account ──────────────────────────────

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'listing_published',
  'seller_request_approved',
  'seller_request_rejected',
  'followed_store_listing',
  'welcome'
));

create or replace function public.welcome_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message)
  values (
    new.id,
    'welcome',
    '¡Bienvenido a GEMarket!',
    'Primeros pasos: añade tu foto de perfil para generar confianza, publica tu primer anuncio gratis y sigue tiendas para enterarte de sus novedades. Recuerda: compradores y vendedores tratan directamente por WhatsApp — queda en lugares públicos y no pagues por adelantado.'
  );
  return new;
end;
$$;

create trigger profiles_welcome
  after insert on public.profiles
  for each row execute function public.welcome_new_profile();
