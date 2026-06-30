# Supabase Auth setup

Auth (sign-up, login, **email confirmation**, sessions) runs on **Supabase**.
Purchases & reports stay in **D1**, linked to the account by **email**. Supabase
owns identity; D1 owns data.

## One-time setup

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).

2. **Copy the keys** — Project → Settings → API:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public`  → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  *(safe in the browser)*
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`  *(secret — server only)*

   Local: put them in `.dev.vars`. Production: set each as a Pages secret:
   ```
   npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL
   npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
   npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
   ```
   (Pages also needs the two `NEXT_PUBLIC_*` as build-time env vars so they inline
   into the client bundle — add them under Pages → Settings → Environment variables.)

3. **Authentication → URL configuration:**
   - **Site URL:** `https://carvinlookup.us`
   - **Redirect URLs:** add `https://carvinlookup.us/auth/callback` and
     `http://localhost:3000/auth/callback`

4. **Authentication → Providers → Email:** enable **"Confirm email."**
   (Default Supabase email sender works for testing; add custom SMTP for production
   volume — Authentication → Emails → SMTP.)

## How it flows
- **Sign up** (`/register`) → `supabase.auth.signUp(...)` → confirmation email →
  user clicks the link → `/auth/callback` exchanges the code → lands on `/account`.
- **Login** (`/login`) → `signInWithPassword`. **Logout** → `signOut`.
- Middleware refreshes the session and gates `/account`.
- The dashboard reads the Supabase user's **email**, then lists their D1 reports and
  resolves their Stripe customer/subscription **by that email**.

## Files
- `src/lib/supabase/{client,server,middleware}.ts` — Supabase clients.
- `src/components/auth/AuthForm.tsx`, `/login`, `/register`, `/auth/callback`.
- `src/middleware.ts` — `/account` gate. `src/app/api/account/me` — header session.
- `src/lib/account.ts` — D1 reports/orders by email.

## Note
The old D1 password-auth (`lib/user-auth.ts`, `/api/auth/*`, the `users.password_hash`
column from migration `0002`) was removed. The `0002` migration is now optional —
its `orders` indexes are still useful, but no longer required for accounts.
