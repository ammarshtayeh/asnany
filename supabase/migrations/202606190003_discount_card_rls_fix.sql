-- Remove overly permissive read/write on discount_card_members for anon/authenticated clients.
-- Public may still submit membership requests (INSERT). Admin reads via service_role API only.

drop policy if exists "admin all discount card members" on public.discount_card_members;
