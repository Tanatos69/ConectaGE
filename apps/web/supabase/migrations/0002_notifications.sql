-- ============================================================================
-- GEMarket — notifications
-- Run manually in Supabase Studio → SQL Editor, after 0001_init.sql.
-- ============================================================================

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null check (type in (
    'listing_published',
    'seller_request_approved',
    'seller_request_rejected'
  )),
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_own_select" on public.notifications
  for select using (auth.uid() = user_id);

-- Users may only flip `read` on their own notifications — never touch
-- another user's row, and the content itself is system-generated (no client
-- INSERT policy at all; only the triggers below, running as their owning
-- function, can create rows).
create policy "notifications_own_update" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Trigger: notify the seller when their listing goes live ────────────────
-- Listings auto-publish on insert (see 0001_init.sql), so this fires
-- immediately after posting today; it also covers the moment a future
-- moderation queue flips status to 'published' after review.

create or replace function public.notify_listing_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.seller_id,
      'listing_published',
      new.title,
      'Tu anuncio "' || new.title || '" ya está publicado y visible para todos los compradores.'
    );
  end if;
  return new;
end;
$$;

create trigger listings_notify_published
  after insert or update of status on public.listings
  for each row execute function public.notify_listing_published();

-- ── Trigger: notify the requester when a seller_request is approved/rejected ─
-- Fires regardless of who performs the UPDATE, so the service-role admin
-- action (lib/actions/admin.ts) doesn't need to insert notifications itself.

create or replace function public.notify_seller_request_reviewed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.user_id,
      'seller_request_approved',
      new.store_name,
      'Tu solicitud para abrir la tienda "' || new.store_name || '" ha sido aprobada. Ya puedes gestionarla desde Mi tienda.'
    );
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.user_id,
      'seller_request_rejected',
      new.store_name,
      'Tu solicitud para abrir la tienda "' || new.store_name || '" no ha sido aprobada. Puedes volver a intentarlo más adelante.'
    );
  end if;
  return new;
end;
$$;

create trigger seller_requests_notify_reviewed
  after update of status on public.seller_requests
  for each row execute function public.notify_seller_request_reviewed();

-- ── RPC: mark all of a user's notifications as read in one call ────────────

create or replace function public.mark_all_notifications_read()
returns void
language sql
security invoker
set search_path = public
as $$
  update public.notifications set read = true where user_id = auth.uid() and read = false;
$$;
