-- ============================================================================
-- ConectaGE — account blocking, real listing takedowns, and the notification
--             that goes with them.
-- Run manually in Supabase Studio → SQL Editor, after 0008_onboarding_intent.sql.
-- ============================================================================

-- ── profiles: block/unblock ──────────────────────────────────────────────────
-- Nullable timestamp + reason instead of a boolean so "when/why/by whom" is
-- kept for free; `blocked_at is not null` = currently blocked. Purely
-- additive on a live table with rows — safe.

alter table public.profiles add column blocked_at timestamptz;
alter table public.profiles add column blocked_reason text;
alter table public.profiles add column blocked_by uuid references public.profiles (id);

-- Extend the existing privileged-columns guard (0001_init.sql) to also cover
-- the new blocking columns — same pattern as role/verified: only an admin
-- server action running as the service role may write them.
create or replace function public.protect_privileged_profile_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.verified is distinct from old.verified
      or new.blocked_at is distinct from old.blocked_at
      or new.blocked_reason is distinct from old.blocked_reason
      or new.blocked_by is distinct from old.blocked_by)
     and current_user not in ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin') then
    raise exception 'No autorizado a modificar role/verified/blocked_at/blocked_reason/blocked_by';
  end if;
  return new;
end;
$$;

-- ── listings: real takedown state ───────────────────────────────────────────
-- Reuses the existing 'rejected' status (already in listing_status, never set
-- by any code path today) instead of a new enum value — adding an enum value
-- can't safely run in the same script that references it.

alter table public.listings add column rejection_reason text;

-- listings_own_update (0001_init.sql) lets a seller update ANY column on
-- their own row, including status — harmless while status was always
-- 'published', but a real moderation-bypass once 'rejected' means something
-- (a seller could otherwise revert their own admin-rejected listing straight
-- back to 'published' via a raw client call). Close it the same way
-- profiles' privileged columns are closed: service-role only.
create or replace function public.protect_listing_moderation_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.status is distinct from old.status or new.rejection_reason is distinct from old.rejection_reason)
     and current_user not in ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin') then
    raise exception 'No autorizado a modificar status/rejection_reason';
  end if;
  return new;
end;
$$;

create trigger prevent_privileged_listing_update
  before update on public.listings
  for each row execute function public.protect_listing_moderation_cols();

-- ── notifications: new type for admin takedowns ─────────────────────────────
-- Deliberately does NOT name the reporter (industry-standard: don't expose
-- who reported whom) — it only ever tells the seller their own content was
-- removed, and why.

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'listing_published',
  'seller_request_approved',
  'seller_request_rejected',
  'followed_store_listing',
  'welcome',
  'listing_removed'
));

-- Covers admin/moderacion + admin/reportes "Despublicar" (status -> rejected).
-- Deliberately NOT covering hard-delete here: adminDeleteListingAction
-- inserts this notification itself before deleting, since an AFTER DELETE
-- trigger can't distinguish "admin removed this one listing" (notify) from
-- "this listing vanished because its owner's whole account was just
-- hard-deleted" (must not notify, and would race the very profile row being
-- deleted in the same statement).
create or replace function public.notify_listing_removed_on_reject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.seller_id,
      'listing_removed',
      new.title,
      'Tu anuncio "' || new.title || '" ha sido retirado por un administrador.'
      || case
           when new.rejection_reason is not null and new.rejection_reason <> ''
           then ' Motivo: ' || new.rejection_reason || '.'
           else ''
         end
    );
  end if;
  return new;
end;
$$;

create trigger listings_notify_removed
  after update of status on public.listings
  for each row execute function public.notify_listing_removed_on_reject();
