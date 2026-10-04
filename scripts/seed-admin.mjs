/**
 * Seeds the admin account: creates (or updates) the Firebase Auth user and adds
 * the matching document to the Firestore `admins` collection.
 *
 *   npm run seed:admin
 *
 * Needs, in .env (never committed):
 *   ADMIN_EMAIL, ADMIN_PASSWORD         the admin login to create
 *   GOOGLE_APPLICATION_CREDENTIALS      path to a service-account key (default ./serviceAccountKey.json)
 * Download the key in Firebase console > Project settings > Service accounts > Generate new private key.
 * Safe to run more than once.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

const email = process.env.ADMIN_EMAIL?.trim()
const password = process.env.ADMIN_PASSWORD
if (!email || !password) fail('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.')
if (password.length < 8) fail('ADMIN_PASSWORD must be at least 8 characters.')

const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json')
if (!existsSync(keyPath)) {
  fail(
    `Service account key not found at ${keyPath}.\n` +
      '  Firebase console > Project settings > Service accounts > Generate new private key,\n' +
      '  save it as serviceAccountKey.json in the project root (it is git-ignored).',
  )
}

const key = JSON.parse(readFileSync(keyPath, 'utf8'))
initializeApp({ credential: cert(key) })
const auth = getAuth()
const db = getFirestore()

let user
try {
  user = await auth.getUserByEmail(email)
  user = await auth.updateUser(user.uid, { password, emailVerified: true, disabled: false })
  console.log(`• Updated existing user ${email}`)
} catch (e) {
  if (e.code === 'auth/configuration-not-found')
    fail('Firebase Authentication is not enabled yet. In the console open Build > Authentication, click Get started, then enable the Email/Password sign-in method and run this again.')
  if (e.code !== 'auth/user-not-found') fail(`Could not look up the user: ${e.message}`)
  user = await auth.createUser({ email, password, emailVerified: true, displayName: 'Renté Admin' })
  console.log(`• Created user ${email}`)
}

await db.doc(`admins/${user.uid}`).set({ email, role: 'admin', updatedAt: Date.now() }, { merge: true })
console.log(`• Added admins/${user.uid}`)
console.log('\n✔ Done. Sign in at /admin/login with that email and password.\n')
