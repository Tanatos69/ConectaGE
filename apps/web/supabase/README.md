# Supabase setup — ConectaGE

The app runs in **demo mode** (static demo listings, auth disabled) until these
env vars exist. One-time setup, ~20 minutes, everything on the free tier.

## 1. Create the project

1. [supabase.com](https://supabase.com) → New project (free tier). Region: pick
   Europe-West (closest to Guinea Ecuatorial).
2. Project Settings → API: copy **Project URL**, **anon key** and
   **service_role key**.

## 2. Env vars

Copy `apps/web/.env.local.example` to `apps/web/.env.local` and fill in the
three values. Add the same three to **Netlify → Site settings → Environment
variables** (the service key must never be `NEXT_PUBLIC_`).

## 3. Database schema

Supabase Studio → **SQL Editor** → paste and run
`migrations/0001_init.sql` (this whole file, once). It creates
`profiles`, `seller_requests`, `tiendas`, `listings`, all RLS policies,
triggers, and the two public Storage buckets (`listing-images`, `avatars`).

## 4. Auth configuration

- **Auth → Providers → Email**: enable, and turn **"Confirm email" ON**
  (this is the anti-spam gate — no confirmed email, no session, no posting).
- **Auth → Providers → Google / Facebook** (optional, can be added later):
  create OAuth apps in Google Cloud Console / Meta for Developers with
  redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, then
  paste client id/secret into Supabase.
- **Auth → URL Configuration**: Site URL = the prod Netlify URL. Add
  `http://localhost:3000/**` and the Netlify preview wildcard
  (`https://*--<site-name>.netlify.app/**`) to Redirect URLs.

## 5. Bootstrap the first admin

1. Sign up normally at `/registro` and confirm the email.
2. Studio → **Table Editor → profiles** → find your row → set `role` to
   `admin`. There is intentionally no in-app path to create admins.

## How roles work

- Everyone signs up as `buyer`.
- A buyer requests a shop from **/mi-cuenta/tienda** → an admin approves at
  **/admin/vendedores** → the user becomes `seller` and gets their `tienda`.
- `role` and `verified` are trigger-protected: users cannot change them via
  the API even though they can update their own profile row.
