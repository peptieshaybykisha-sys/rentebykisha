<div align="center">

<img src="src/assets/logo.png" alt="Renté by Kisha logo" width="180" />

# Renté by Kisha

**A dress-rental boutique: browse, book, pay by GCash, and track your rental, all in one place.**

![Version](https://img.shields.io/badge/version-1.0.0-5A1025)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)

[Getting started](#getting-started) ·
[Supabase setup](#1-supabase-setup) ·
[Auth settings](#2-supabase-auth-settings) ·
[Deploying](#3-deploying) ·
[Operations](#4-running-the-shop) ·
[Changelog](CHANGELOG.md)

</div>

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [1. Supabase setup](#1-supabase-setup)
- [2. Supabase Auth settings](#2-supabase-auth-settings)
- [3. Deploying](#3-deploying)
- [4. Running the shop](#4-running-the-shop)
- [Versioning](#versioning)
- [Notes and limitations](#notes-and-limitations)

## Overview

Renté by Kisha lets customers browse dresses, check availability, book a rental (with optional delivery), upload a GCash receipt, book a fitting, and follow their rental status live. Admins manage dresses, rentals, fittings, users and site content from a built-in dashboard.

Security and business rules are enforced **in the database**, not just the UI. See [What the database enforces](#what-the-database-enforces).

## Tech stack

| Area | Technology |
|---|---|
| UI | React 19, TypeScript, Vite, Tailwind CSS v4, Motion |
| Routing and state | React Router, Zustand |
| Forms and validation | React Hook Form, Zod |
| Dates and notifications | date-fns, Sonner |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Testing | Vitest, PGlite (in-memory Postgres) |
| CI | GitHub Actions |

## Getting started

**Prerequisites:** Node.js 20+ (Node 22+ recommended, as `--env-file` is used by the scripts) and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/peptieshaybykisha-sys/rentebykisha.git
cd rentebykisha
npm install
cp .env.example .env     # then fill in your Supabase keys
npm run dev
```

The app runs at <http://localhost:5173>.

### Environment variables

| Variable | Used by | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser | No |
| `VITE_SUPABASE_ANON_KEY` | Browser | No (protected by row level security) |
| `SUPABASE_SERVICE_ROLE_KEY` | `seed:admin` script only | **Yes**, never expose it |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `seed:admin` script only | **Yes** |

> Never commit `.env` or any service-account key. Both are already in `.gitignore`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Unit tests (pricing, availability, validation, row mapping) |
| `npm run test:db` | Run the SQL migrations in an in-memory Postgres and check every security and business rule (RLS, double-booking, pricing, cancelling, fittings) |
| `npm run seed:admin` | Create the admin login and give it the `admin` role |

## Project structure

```
.
├── src/                  Application source (components, pages, stores, constants)
│   └── constants/        Business rules and settings (business.ts)
├── supabase/migrations/  SQL schema, RLS policies and database functions
├── scripts/              seed-admin.mjs, test-db.mjs
├── public/               Static files, _headers, _redirects, robots.txt
├── .github/workflows/    CI pipeline
└── vercel.json           SPA rewrite, caching and security headers
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com). In **Project Settings > API**, copy the Project URL, the **anon** key and the **service_role** key into `.env`. The service-role key is secret: only the seeder uses it, it has no `VITE_` prefix and never reaches the browser.
2. In the **SQL Editor**, run these files from `supabase/migrations`, in order:

   | Order | File | Purpose |
   |---|---|---|
   | 1 | `0001_init.sql` | Initial schema |
   | 2 | `0002_customers.sql` | Customers, rentals, fittings, pricing rules |
   | 3 | `0003_roles.sql` | Profile roles and admin functions |

   Each file is safe to re-run, **except** `0001_init.sql`: do not re-run it after `0002`, as it would recreate the old admins table. Run `0003` once, after `0002`.
3. Put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run `npm run seed:admin`. Sign in at `/login` like everyone else; admins are sent to the dashboard automatically.

### What the database enforces

| Rule | How |
|---|---|
| **Public read, admin write** | Anyone can read dresses, photos and site content. Only users whose profile role is `admin` can change them. |
| **Customer privacy** | Customers see only their own rentals, fittings, addresses, wishlist and receipts (row level security). |
| **Trusted rental creation** | Rentals are created only through the `create_rental()` function. It re-checks that the dress exists and is available, the size is offered, and the dates are valid (2 days ahead, 7 days max, not blocked). It computes the fee, deposit and delivery, and numbers the rental (`REN-YYYYMMDD-001`). |
| **No double-booking** | A Postgres exclusion constraint prevents overlapping bookings, even for two simultaneous checkouts. Dates are released automatically when a rental is cancelled, returned, under inspection or completed. |
| **Private receipts** | GCash receipts live in a **private** bucket, in a folder per customer. Only that customer and admins can open them (short-lived signed links). |
| **Fitting slots** | `book_fitting()` allows one booking per time slot, no Sundays and no past dates. |
| **Roles** | Every account is a `customer` unless an admin promotes it under **Users**. The role can only be changed through a function that checks the caller is an admin and stops you removing your own access. Customers can edit only their name and phone. |

Business rules live in `supabase/migrations/0002_customers.sql` and are mirrored in `src/constants/business.ts`. **If you change a price rule, change both.**

## 2. Supabase Auth settings

Do these before launch, under **Authentication**:

- [ ] **URL Configuration:** set **Site URL** to your live address (for example `https://rentebykisha.com`) and add `https://your-domain/**` plus `http://localhost:5173/**` to **Redirect URLs**. Email confirmation and password-reset links use these.
- [ ] **Providers > Email:** keep **Confirm email** on and set a minimum password length of 8.
- [ ] **SMTP:** Supabase's built-in sender allows only a few messages per hour and is for testing. Add your own provider (Resend, SendGrid, Brevo...) under **Project Settings > Authentication > SMTP**.
- [ ] **Attack protection:** turn on CAPTCHA (Cloudflare Turnstile or hCaptcha) for sign-up and sign-in, and keep the default rate limits.
- [ ] *(Optional)* Customise the email templates with the shop's name and tone.

Under **Project Settings**:

- [ ] Enable daily backups (Pro plan) or schedule your own `pg_dump`.
- [ ] Set a spending cap alert.

## 3. Deploying

Any static host works.

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's environment settings. **Never add the service-role key.**
2. Run `npm run build` and serve `dist/`.

| Host | Configuration |
|---|---|
| Vercel | `vercel.json` adds the single-page-app rewrite, caching and security headers (CSP, HSTS, frame denial). |
| Netlify / Cloudflare Pages | `public/_redirects` and `public/_headers` do the same. |

If you use a custom Supabase domain, update `connect-src` and `img-src` in the CSP.

### Continuous integration

`.github/workflows/ci.yml` runs lint, unit tests, database tests and the build on every push.

## 4. Running the shop

**Rentals** (`/admin > Rentals`)

1. Open a rental and check the GCash receipt against the total.
2. Click **Verified, confirm rental** (or reject).
3. Move it through *Preparing → Ready for Pickup → Rented → Returned → Under Inspection → Completed*.
4. Mark the deposit as refunded when you send it back.

**Other sections**

- **Dresses:** add dresses with real photos, custom sizes, deposits and blocked dates.
- **Hero dresses, Size guide, How it works:** edit the home page and info pages.
- **Fittings:** view upcoming appointments.
- **Users:** promote or demote accounts.

Customers get live status updates on their **My Rentals** page.

## Versioning

This project follows [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

- **MAJOR:** breaking changes (for example a database change that needs manual migration).
- **MINOR:** new features, backwards compatible.
- **PATCH:** bug fixes.

The current version is in [package.json](package.json) and every release is listed in the [CHANGELOG](CHANGELOG.md). To cut a release:

```bash
npm version minor          # or patch / major; bumps package.json and tags the commit
git push --follow-tags
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `refactor:`...).

## Notes and limitations

- Customer carts stay in the browser until checkout. The saved-dresses list syncs to the account after login.
- Business settings (GCash number, studio hours, fees) live in `src/constants/business.ts`. **Replace the placeholder GCash number before launch.**
- Not included yet: automatic email or SMS notifications for status changes, and online card payments (GCash is verified by hand).

---

<div align="center">

© Renté by Kisha. All rights reserved.

</div>
