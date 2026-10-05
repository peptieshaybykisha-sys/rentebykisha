/**
 * Runs the Supabase migrations in an in-memory Postgres (PGlite) and checks the security rules
 * and business rules: row level security, double-booking, pricing, cancelling, fittings.
 *
 *   npm run test:db
 *
 * Supabase's own schemas (auth, storage) are stubbed, everything else is the real migration SQL.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist'

const STUBS = `
  create role anon; create role authenticated;
  create schema auth; create schema storage; create schema extensions;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  create publication supabase_realtime;
  grant usage on schema public, auth, storage, extensions to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  grant all on all tables in schema storage to anon, authenticated;
`

const db = new PGlite({ extensions: { btree_gist } })
await db.exec(STUBS)

for (const f of readdirSync('supabase/migrations').sort()) {
  await db.exec(readFileSync(`supabase/migrations/${f}`, 'utf8'))
  await db.exec(readFileSync(`supabase/migrations/${f}`, 'utf8')) // must be re-runnable
  console.log(`✔ ${f} ran twice without errors`)
}

const ADMIN = '11111111-1111-1111-1111-111111111111'
const ANA = '22222222-2222-2222-2222-222222222222'
const BEN = '33333333-3333-3333-3333-333333333333'
await db.exec(`
  insert into auth.users (id, email, raw_user_meta_data) values
    ('${ADMIN}', 'admin@x.com', '{}'), ('${ANA}', 'ana@x.com', '{"name":"Ana","phone":"09171234567"}'), ('${BEN}', 'ben@x.com', '{}');
  update public.profiles set role = 'admin' where id = '${ADMIN}';
`)

let failures = 0
const run = async (role, sub, sql, params) => {
  await db.exec(`set role ${role}; select set_config('request.jwt.sub', '${sub}', false)`)
  try {
    const r = await db.query(sql, params)
    return { ok: true, rows: r.rows, count: r.affectedRows }
  } catch (e) {
    return { ok: false, error: e.message }
  } finally {
    await db.exec('reset role')
  }
}
const expect = (name, cond, detail = '') => {
  if (!cond) failures++
  console.log(`${cond ? '✔' : '✖'} ${name}${cond || !detail ? '' : `  → ${detail}`}`)
}
const denied = (r) => !r.ok || r.count === 0
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)

const dress = await run('authenticated', ADMIN, `insert into public.dresses (name, category, price, deposit, sizes) values ('Gown','Long Dress',900,1000,'{S,M}') returning id`)
const D = dress.rows[0].id
await db.query(`insert into public.dresses (name, category, price, deposit, sizes, status) values ('Away','Short Dress',500,500,'{M}','unavailable')`)
const AWAY = (await db.query(`select id from public.dresses where name = 'Away'`)).rows[0].id
await db.query(`insert into public.dresses (name, category, price, deposit, sizes, booked_ranges) values ('Blocked','Long Dress',500,500,'{M}', $1)`, [JSON.stringify([{ start: day(20), end: day(22) }])])
const BLOCKED = (await db.query(`select id from public.dresses where name = 'Blocked'`)).rows[0].id

// ---- roles
expect('new accounts default to customer', (await db.query(`select role from public.profiles where id = '${ANA}'`)).rows[0].role === 'customer')
expect('the old admins table is gone', (await db.query(`select to_regclass('public.admins') as t`)).rows[0].t === null)
expect('customer cannot promote themselves by editing the role column', !(await run('authenticated', ANA, `update public.profiles set role = 'admin' where id = '${ANA}'`)).ok)
expect('customer cannot promote themselves through set_user_role', !(await run('authenticated', ANA, `select public.set_user_role('${ANA}', 'admin')`)).ok)
expect('anonymous cannot call set_user_role', !(await run('anon', '', `select public.set_user_role('${ANA}', 'admin')`)).ok)
expect('admin can read every profile', (await run('authenticated', ADMIN, 'select id from public.profiles')).rows.length === 3)
expect('admin cannot demote themselves', (await run('authenticated', ADMIN, `select public.set_user_role('${ADMIN}', 'customer')`)).error?.includes('own admin'))
expect('admin rejects unknown roles', (await run('authenticated', ADMIN, `select public.set_user_role('${BEN}', 'superuser')`)).error?.includes('Unknown role'))
expect('admin can promote another user', (await run('authenticated', ADMIN, `select public.set_user_role('${BEN}', 'admin')`)).ok)
const dressSql = `insert into public.dresses (name, category, price, deposit, sizes) values ('By Ben','Long Dress',1,1,'{M}')`
expect('the promoted user can now write dresses', (await run('authenticated', BEN, dressSql)).count === 1)
expect('admin can demote another user and they lose access', (await run('authenticated', ADMIN, `select public.set_user_role('${BEN}', 'customer')`)).ok && !(await run('authenticated', BEN, dressSql)).ok)
await db.query(`delete from public.dresses where name = 'By Ben'`)

// ---- profiles
expect('profile is created automatically with name and phone', (await db.query(`select name, phone from public.profiles where id = '${ANA}'`)).rows[0]?.name === 'Ana')
expect('customer cannot read another profile', (await run('authenticated', BEN, `select * from public.profiles where id = '${ANA}'`)).rows.length === 0)
expect('customer can update own name', (await run('authenticated', ANA, `update public.profiles set name = 'Ana B' where id = '${ANA}'`)).count === 1)
expect('customer cannot change own email column', !(await run('authenticated', ANA, `update public.profiles set email = 'x@x.com' where id = '${ANA}'`)).ok)

// ---- rentals via create_rental
const customer = JSON.stringify({ name: 'Ana Cruz', email: 'ana@x.com', phone: '09171234567' })
const item = (id, s, e, size = 'M') => JSON.stringify([{ dressId: id, size, startDate: s, endDate: e }])
const create = (sub, items, ful = 'delivery', addr = '12 Rose St, Makati', receipt = `${ANA}/r.jpg`) =>
  run('authenticated', sub, 'select public.create_rental($1::jsonb, $2::jsonb, $3, $4, $5, $6) as id', [items, customer, ful, addr, null, receipt])

expect('anonymous cannot create a rental', !(await run('anon', '', 'select public.create_rental($1::jsonb,$2::jsonb,$3,$4,$5,$6)', [item(D, day(10), day(12)), customer, 'pickup', null, null, 'x/y.jpg'])).ok)
const r1 = await create(ANA, item(D, day(10), day(12)))
expect('customer can create a rental', r1.ok && /^REN-\d{8}-001$/.test(r1.rows[0].id), r1.error)
const RID = r1.rows[0]?.id
const row = (await db.query(`select * from public.rentals where id = $1`, [RID])).rows[0]
expect('3 days = listed price, +deposit +delivery computed on the server', row?.rental_fee === 900 && row.deposit === 1000 && row.delivery_fee === 150 && row.total === 2050, JSON.stringify(row))
const r1b = await create(ANA, item(D, day(30), day(35)), 'pickup')
const row2 = (await db.query(`select * from public.rentals where id = $1`, [r1b.rows[0]?.id])).rows[0]
expect('6 days = price + 3 extra days at 20%, pickup has no delivery fee', row2?.rental_fee === 900 + 3 * 180 && row2.delivery_fee === 0, JSON.stringify(row2))
expect('second rental the same day gets the next number', r1b.rows[0]?.id.endsWith('-002'))
expect('double booking the same dates is rejected', (await create(BEN, item(D, day(11), day(13)), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('just reserved'))
expect('adjacent dates are allowed', (await create(BEN, item(D, day(13), day(14)), 'pickup', null, `${BEN}/r.jpg`)).ok)
expect('too-soon pick-up is rejected', (await create(BEN, item(D, day(1), day(2)), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('days ahead'))
expect('more than 7 days is rejected', (await create(BEN, item(D, day(50), day(58)), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('up to 7'))
expect('size not offered is rejected', (await create(BEN, item(D, day(60), day(61), 'XL'), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('not offered'))
expect('unavailable dress is rejected', (await create(BEN, item(AWAY, day(10), day(11)), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('not available'))
expect('admin-blocked dates are rejected', (await create(BEN, item(BLOCKED, day(21), day(23)), 'pickup', null, `${BEN}/r.jpg`)).error?.includes('reserved'))
expect('receipt in someone else\'s folder is rejected', (await create(BEN, item(D, day(70), day(71)), 'pickup', null, `${ANA}/r.jpg`)).error?.includes('receipt'))
expect('delivery needs an address', (await create(BEN, item(D, day(70), day(71)), 'delivery', 'x', `${BEN}/r.jpg`)).error?.includes('address'))
expect('a failed checkout leaves no half-created rental', (await db.query(`select count(*)::int c from public.rentals`)).rows[0].c === 3)

// ---- row level security on rentals
expect('customer sees only own rentals', (await run('authenticated', ANA, 'select id from public.rentals')).rows.length === 2)
expect('other customer cannot see them', (await run('authenticated', BEN, `select id from public.rentals where id = '${RID}'`)).rows.length === 0)
expect('other customer cannot see the items', (await run('authenticated', BEN, `select id from public.rental_items where rental_id = '${RID}'`)).rows.length === 0)
expect('admin sees every rental', (await run('authenticated', ADMIN, 'select id from public.rentals')).rows.length === 3)
expect('customer cannot edit own rental status', denied(await run('authenticated', ANA, `update public.rentals set status = 'Completed' where id = '${RID}'`)))
expect('customer cannot insert a rental directly', !(await run('authenticated', ANA, `insert into public.rentals (id, user_id, customer_name, customer_email, customer_phone, fulfillment) values ('REN-X', '${ANA}', 'a', 'b', 'c', 'pickup')`)).ok)
expect('admin can verify payment and confirm', (await run('authenticated', ADMIN, `update public.rentals set status = 'Confirmed', payment_status = 'Verified' where id = '${RID}'`)).count === 1)
expect('status change is appended to history', (await db.query(`select jsonb_array_length(history) n from public.rentals where id = '${RID}'`)).rows[0].n === 2)
expect('anon cannot read rentals', (await run('anon', '', 'select id from public.rentals')).ok === false || (await run('anon', '', 'select id from public.rentals')).rows.length === 0)

// ---- cancel
expect('other customer cannot cancel it', !(await run('authenticated', BEN, `select public.cancel_rental('${RID}')`)).ok)
expect('owner can cancel a confirmed rental', (await run('authenticated', ANA, `select public.cancel_rental('${RID}')`)).ok)
expect('cancelling releases the dates', (await create(BEN, item(D, day(10), day(12)), 'pickup', null, `${BEN}/r.jpg`)).ok)
await db.query(`update public.rentals set status = 'Rented' where id = '${r1b.rows[0].id}'`)
expect('a rented dress can no longer be cancelled online', (await run('authenticated', ANA, `select public.cancel_rental('${r1b.rows[0].id}')`)).error?.includes('no longer'))
await db.query(`update public.rentals set status = 'Returned' where id = '${r1b.rows[0].id}'`)
expect('returning a dress frees its dates', (await create(BEN, item(D, day(31), day(32)), 'pickup', null, `${BEN}/r.jpg`)).ok)

// ---- reserved dates are public, without personal data
const reserved = await run('anon', '', 'select * from public.dress_reserved_ranges()')
expect('anyone can see reserved ranges', reserved.ok && reserved.rows.length > 0)
expect('reserved ranges expose no customer data', Object.keys(reserved.rows[0] ?? {}).sort().join() === 'dress_id,end_date,start_date')

// ---- addresses & wishlist
expect('customer can add an address', (await run('authenticated', ANA, `insert into public.addresses (label, line1, city) values ('Home','12 Rose St, Brgy 1','Makati')`)).count === 1)
expect('other customer cannot see it', (await run('authenticated', BEN, 'select * from public.addresses')).rows.length === 0)
expect('wishlist is per user', (await run('authenticated', ANA, `insert into public.wishlist (dress_id) values ('${D}')`)).count === 1 && (await run('authenticated', BEN, 'select * from public.wishlist')).rows.length === 0)
expect('cannot save a wishlist for someone else', !(await run('authenticated', BEN, `insert into public.wishlist (user_id, dress_id) values ('${ANA}', '${AWAY}')`)).ok)

// ---- fittings
const fit = (sub, date, time) => run(sub ? 'authenticated' : 'anon', sub ?? '', 'select public.book_fitting($1,$2,$3,$4,$5) as id', ['Ana Cruz', '09171234567', null, date, time])
const mon = (() => { let d = new Date(Date.now() + 5 * 864e5); while (d.getDay() === 0) d = new Date(+d + 864e5); return d.toISOString().slice(0, 10) })()
const sun = (() => { let d = new Date(Date.now() + 3 * 864e5); while (d.getDay() !== 0) d = new Date(+d + 864e5); return d.toISOString().slice(0, 10) })()
const g = await fit(null, mon, '10:00 AM'); expect('guest can book a fitting', g.ok, g.error)
expect('same slot cannot be booked twice', (await fit(ANA, mon, '10:00 AM')).error?.includes('just taken'))
expect('taken slots are visible to everyone', (await run('anon', '', `select public.fitting_taken('${mon}') as t`)).rows[0].t.includes('10:00 AM'))
expect('Sundays are closed', (await fit(ANA, sun, '11:00 AM')).error?.includes('Sundays'))
expect('odd times are rejected', (await fit(ANA, mon, '9:15 PM')).error?.includes('available times'))
expect('past dates are rejected', (await fit(ANA, day(-1), '11:00 AM')).error?.includes('tomorrow'))
await fit(ANA, mon, '11:00 AM')
expect('customer sees only own fittings', (await run('authenticated', ANA, 'select * from public.fittings')).rows.length === 1 && (await run('authenticated', BEN, 'select * from public.fittings')).rows.length === 0)
expect('guest cannot read fittings', (await run('anon', '', 'select * from public.fittings')).rows?.length === 0)

// ---- storage policies
expect('customer can upload into own receipts folder', (await run('authenticated', ANA, `insert into storage.objects (bucket_id, name) values ('receipts', '${ANA}/a.jpg')`)).count === 1)
expect('customer cannot upload into another folder', !(await run('authenticated', ANA, `insert into storage.objects (bucket_id, name) values ('receipts', '${BEN}/a.jpg')`)).ok)
expect('customer cannot read another customer\'s receipt', (await run('authenticated', BEN, `select * from storage.objects where bucket_id = 'receipts'`)).rows.length === 0)
expect('admin can read every receipt', (await run('authenticated', ADMIN, `select * from storage.objects where bucket_id = 'receipts'`)).rows.length === 1)
expect('non-admin cannot upload dress photos', !(await run('authenticated', ANA, `insert into storage.objects (bucket_id, name) values ('dresses', 'x/a.jpg')`)).ok)


// ---- upgrade path: a project that already ran 0001 + 0002 with a row in the old admins table
{
  const old = new PGlite({ extensions: { btree_gist } })
  await old.exec(STUBS)
  await old.exec(readFileSync('supabase/migrations/0001_init.sql', 'utf8'))
  await old.exec(readFileSync('supabase/migrations/0002_customers.sql', 'utf8'))
  await old.exec(`insert into auth.users (id, email) values ('${ADMIN}', 'admin@x.com'), ('${ANA}', 'ana@x.com');
    insert into public.admins values ('${ADMIN}', 'admin@x.com');`)
  await old.exec(readFileSync('supabase/migrations/0003_roles.sql', 'utf8'))
  const roles = (await old.query('select id, role from public.profiles order by email')).rows
  expect('upgrade: the existing admin keeps admin access', roles.find((r) => r.id === ADMIN)?.role === 'admin')
  expect('upgrade: everyone else becomes a customer', roles.find((r) => r.id === ANA)?.role === 'customer')
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll database checks passed')
process.exit(failures ? 1 : 0)
