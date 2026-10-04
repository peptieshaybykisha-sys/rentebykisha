# Renté by Kisha

Dress-rental boutique. React + TypeScript + Vite, Tailwind v4, React Router, Zustand, React Hook Form + Zod, date-fns, Motion, Supabase.

    npm install
    cp .env.example .env   # then fill in your Supabase keys
    npm run dev

## Supabase setup (admin and catalogue)

Dresses, photos, the size guide, hero dresses and the How It Works content live in Supabase.
There are no placeholder dresses: the site is empty until an admin adds them.

1. Create a project at supabase.com. In **Project Settings > API** copy the **Project URL**, the **anon** key and the **service_role** key into `.env`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). The service-role key is secret: it is only used by the seeder and never reaches the browser.
2. Create the tables, security policies and the photo bucket: open **SQL Editor > New query**, paste `supabase/migrations/0001_init.sql` and run it. It is safe to re-run.
3. Create the admin account: put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run seed:admin`.
   It creates the Auth user and adds it to the `admins` table. Safe to re-run (it also resets the password).
4. Sign in at `/admin/login`.

Security: everything is public to read, and only users in the `admins` table can write (enforced by row level security, not by the app).

Admin area (`/admin`): Dresses (photos, price, deposit, custom sizes, blocked dates), Hero dresses (the ones behind the doors),
Size guide (editable table) and How it works (steps and FAQ). Changes appear on the site live.

## Other notes

- Customer accounts, carts and rentals are still a local mock: `src/lib/api.ts`. Demo customer: demo@rente.ph / password123.
- Constants live in `src/constants/` by feature. Business settings (GCash number etc.): `src/constants/business.ts`.
