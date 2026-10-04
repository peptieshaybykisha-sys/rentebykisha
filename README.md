# Renté by Kisha

Dress-rental boutique. React + TypeScript + Vite, Tailwind v4, React Router, Zustand, React Hook Form + Zod, date-fns, Motion, Supabase (Postgres, Auth, Storage, Realtime).

    npm install
    cp .env.example .env     # fill in your Supabase keys
    npm run dev

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `preview` | develop, production build, preview the build |
| `npm run lint` | ESLint |
| `npm test` | unit tests (pricing, availability, validation, row mapping) |
| `npm run test:db` | runs the SQL migrations in an in-memory Postgres and checks every security and business rule (RLS, double-booking, pricing, cancelling, fittings) |
| `npm run seed:admin` | creates the admin login and gives it the `admin` role |

## 1. Supabase setup

1. Create a project at supabase.com. In **Project Settings > API** copy the Project URL, the **anon** key and the **service_role** key into `.env`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). The service-role key is secret: only the seeder uses it, it has no `VITE_` prefix and never reaches the browser.
2. In **SQL Editor** run `0001_init.sql`, `0002_customers.sql` and `0003_roles.sql` from `supabase/migrations`, in that order. Each is safe to re-run; run 0003 once after 0002 (do not re-run 0001 afterwards, it would recreate the old admins table).
3. Put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run `npm run seed:admin`. Sign in at `/admin/login`.

### What the database enforces (not just the UI)

- Anyone can read dresses, photos and site content. Only users whose profile role is `admin` can change them.
- Customers see only their own rentals, fittings, addresses, wishlist and receipts (row level security).
- Rentals are created only through the `create_rental()` database function. It re-checks everything on the server: the dress exists and is available, the size is offered, dates (2 days ahead, 7 days max, not blocked), computes the fee, deposit and delivery, and numbers the rental (`REN-YYYYMMDD-001`).
- A dress can never be double-booked, even by two simultaneous checkouts (a Postgres exclusion constraint). Dates are released automatically when a rental is cancelled, returned, under inspection or completed.
- GCash receipts live in a **private** bucket, in a folder per customer. Only that customer and admins can open them (short-lived signed links).
- Fittings are booked through `book_fitting()`: one booking per time slot, no Sundays, no past dates.
- Roles: every account is a `customer` unless an admin promotes it under **Users** in the admin area. The role lives on the profile and can only be changed through a database function that checks the caller is an admin and stops you removing your own access. Customers can edit only their name and phone.

Business rules live in `supabase/migrations/0002_customers.sql` and are mirrored in `src/constants/business.ts`. If you change a price rule, change both.

## 2. Supabase Auth settings (do these before launch)

In **Authentication**:

- **URL Configuration**: set **Site URL** to your live address (for example `https://rentebykisha.com`) and add `https://your-domain/**` plus `http://localhost:5173/**` to **Redirect URLs**. Email confirmation and password-reset links use these.
- **Providers > Email**: keep **Confirm email** on, set a minimum password length of 8.
- **SMTP**: Supabase's built-in email sender is limited to a few messages per hour and is for testing only. Add your own SMTP provider (Resend, SendGrid, Brevo...) under **Project Settings > Authentication > SMTP**.
- **Attack protection**: turn on CAPTCHA (Cloudflare Turnstile or hCaptcha) for sign-up and sign-in, and leave the default rate limits on.
- Optionally customise the email templates with the shop's name and tone.

In **Project Settings**: enable daily backups (Pro plan) or schedule your own `pg_dump`, and set a spending cap alert.

## 3. Deploying

Any static host works. Set the three `VITE_*` variables (URL and anon key; never the service-role key) in the host's environment settings, then `npm run build` and serve `dist/`.

- Vercel: `vercel.json` adds the single-page-app rewrite, caching and security headers (CSP, HSTS, frame denial).
- Netlify / Cloudflare Pages: `public/_redirects` and `public/_headers` do the same.
- If you use a custom Supabase domain, update `connect-src` and `img-src` in the CSP.
- `.github/workflows/ci.yml` runs lint, unit tests, database tests and the build on every push.

## 4. Running the shop

- `/admin` > **Rentals**: open a rental, check the GCash receipt against the total, then **Verified, confirm rental** (or reject). Move it through Preparing, Ready for Pickup, Rented, Returned, Under Inspection and Completed. Mark the deposit as refunded when you send it back.
- **Dresses**: add dresses with real photos, custom sizes, deposits and blocked dates. **Hero dresses**, **Size guide** and **How it works** edit the home page and info pages.
- **Fittings**: upcoming appointments.

Customers get live status updates on their **My Rentals** page.

## Notes

- Customer carts stay in the browser until checkout. The saved-dresses list syncs to the account after login.
- Business settings (GCash number, studio hours, fees): `src/constants/business.ts`. Replace the placeholder GCash number before launch.
- Not included yet: automatic email or SMS notifications for status changes, and online card payments (GCash is verified by hand).
