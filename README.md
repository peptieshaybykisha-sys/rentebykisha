# Renté by Kisha

Dress-rental boutique. React + TypeScript + Vite, Tailwind v4, React Router, Zustand, React Hook Form + Zod, date-fns, Motion.

    npm install
    npm run dev

Demo account: demo@rente.ph / password123

- Mock backend: src/lib/api.ts (async functions over a persisted store). Replace the bodies to connect a real API.
- Dress data: src/data/dresses.ts. Dress images are vector art (DressArt); set `images[i].src` to use real photos.
- Business settings (GCash number etc.): src/lib/config.ts
