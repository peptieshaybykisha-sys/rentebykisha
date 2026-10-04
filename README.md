# Renté by Kisha

Dress-rental boutique. React + TypeScript + Vite, Tailwind v4, React Router, Zustand, React Hook Form + Zod, date-fns, Motion, Firebase.

    npm install
    cp .env.example .env   # then fill in your Firebase keys
    npm run dev

## Firebase setup (admin and catalogue)

Dresses, photos, the size guide, hero dresses and the How It Works content live in Firebase.
There are no placeholder dresses: the site is empty until an admin adds them.

1. Create a Firebase project, then add a **Web app** and copy its config into `.env`.
2. Enable **Authentication > Email/Password**, **Firestore** and **Storage**
   (Storage requires the Blaze pay-as-you-go plan; usage for a small catalogue is normally within the free quota).
3. Publish the rules: paste `firestore.rules` and `storage.rules` into the console, or run `firebase deploy --only firestore:rules,storage`.
4. Create the admin: in **Authentication > Users** add a user (email + password), copy its **User UID**, then in Firestore create
   a document in the collection `admins` whose **document ID is that UID** (any field, e.g. `role: "admin"`).
5. Sign in at `/admin/login`.

Admin area (`/admin`): Dresses (photos, price, deposit, custom sizes, blocked dates), Hero dresses (the ones behind the doors),
Size guide (editable table) and How it works (steps and FAQ).

## Other notes

- Customer accounts, carts and rentals are still a local mock: `src/lib/api.ts`. Demo customer: demo@rente.ph / password123.
- Business settings (GCash number etc.): `src/lib/config.ts`.
