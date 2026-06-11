# Palestine Face Health & Beauty Directory (Malamih - ملامح)

Monorepo starter for the platform, rebranded from Dental Directory to cover Face Health & Beauty (Dentistry, Dermatology, Aesthetics, Ophthalmology, and ENT in Palestine).

## Stack

- `Next.js` website for search, doctor profiles, booking, and admin.
- `React Native` via `Expo` for the patient mobile experience.
- `Supabase` for Postgres, auth-ready infrastructure, storage, and row-level security.

## Apps

- `apps/web`: public website plus owner admin dashboard.
- `apps/mobile`: mobile experience for patients.
- `packages/shared`: shared types and seed data shape.
- `supabase/schema.sql`: database schema, indexes, and policies.

## Core flows from the SRS

- Browse dentists by city, specialty, and featured placement.
- View doctor profile details including hours, insurance, and contact info.
- Request appointments without forcing account creation.
- Manage doctors, stores, ads, and appointments from a central admin dashboard.
- Monetize through featured placements and banner/sidebar advertising.

## Suggested next steps

1. Install dependencies for both apps.
2. Create a Supabase project and run `supabase/schema.sql`.
3. Wire environment variables from `.env.example`.
4. Replace seed data with live Supabase queries.
5. Add authentication for owner-only admin routes.
