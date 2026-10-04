/**
 * Seeds the admin account: creates (or updates) the Supabase Auth user and adds
 * that user to the `admins` table, which is what unlocks /admin.
 *
 *   npm run seed:admin
 *
 * Needs, in .env (never committed):
 *   VITE_SUPABASE_URL            your project URL
 *   SUPABASE_SERVICE_ROLE_KEY    Project Settings > API > service_role key (SECRET, server-side only)
 *   ADMIN_EMAIL, ADMIN_PASSWORD  the admin login to create
 * Run supabase/migrations/0001_init.sql first. Safe to run more than once.
 */
import { createClient } from '@supabase/supabase-js'

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

const url = process.env.VITE_SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const email = process.env.ADMIN_EMAIL?.trim()
const password = process.env.ADMIN_PASSWORD

if (!url) fail('Set VITE_SUPABASE_URL in .env first.')
if (!serviceKey) fail('Set SUPABASE_SERVICE_ROLE_KEY in .env (Project Settings > API > service_role).')
if (!email || !password) fail('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.')
if (password.length < 8) fail('ADMIN_PASSWORD must be at least 8 characters.')

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function findUser() {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Could not list users: ${error.message}`)
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit
    if (data.users.length < 200) return null
  }
  return null
}

let user = await findUser()
if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true })
  if (error) fail(`Could not update the user: ${error.message}`)
  user = data.user
  console.log(`• Updated existing user ${email}`)
} else {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) fail(`Could not create the user: ${error.message}`)
  user = data.user
  console.log(`• Created user ${email}`)
}

const { error } = await supabase.from('admins').upsert({ user_id: user.id, email })
if (error) {
  fail(
    /relation|does not exist|schema cache/i.test(error.message)
      ? 'The admins table is missing. Run supabase/migrations/0001_init.sql in the SQL Editor first, then run this again.'
      : `Could not add the admin: ${error.message}`,
  )
}
console.log(`• Added ${email} to the admins table`)
console.log('\n✔ Done. Sign in at /admin/login with that email and password.\n')
