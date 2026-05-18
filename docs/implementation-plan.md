# Implementation Plan

## Product shape

This platform is split into three delivery surfaces:

- A public `Next.js` website for discovery, SEO, booking, and advertising.
- A `React Native` mobile app for patients on iOS and Android.
- A `Supabase` backend shared by both clients.

## Modules derived from the SRS

### 1. Patient discovery

- Search by city, area, specialty, insurance, and availability.
- Sort by nearest, highest rated, and featured.
- Show verified dentists first when relevance is tied.

### 2. Doctor profile

- Contact details, WhatsApp CTA, map location, working hours, insurance, and rating.
- Featured and verified badges.
- Related doctors in the same city or specialty.

### 3. Appointment booking

- Lightweight guest booking with patient name, phone, date, time, and notes.
- Status lifecycle: `pending`, `confirmed`, `cancelled`.
- Optional later extension for reminders and doctor-side confirmations.

### 4. Advertising

- Featured doctor placements.
- Store promotional placements.
- Banner and sidebar placements with regional or specialty targeting.

### 5. Owner dashboard

- CRUD for doctors, stores, advertisements, and appointments.
- Quick moderation views for verification and featured status.
- Basic reporting cards for inventory counts and appointment funnel.

## Recommended delivery order

1. Launch the public website with live directory search.
2. Launch appointment booking and admin operations.
3. Launch the mobile app on the same Supabase backend.
4. Activate ads, analytics, and richer operational reporting.

## Shared data model

The initial schema follows the document closely and adds operational helpers:

- `doctors`
- `appointments`
- `advertisements`
- `stores`

Useful future additions:

- `cities`
- `specialties`
- `doctor_availability_slots`
- `ad_click_events`
- `admin_users`
