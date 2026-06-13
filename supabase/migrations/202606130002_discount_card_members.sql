create table if not exists public.discount_card_members (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text not null,
  city text,
  status text not null default 'pending',
  notes text,
  expires_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists discount_card_members_phone_idx on public.discount_card_members (phone);
create index if not exists discount_card_members_status_idx on public.discount_card_members (status);

alter table public.discount_card_members enable row level security;

drop policy if exists "public request discount card" on public.discount_card_members;
create policy "public request discount card"
  on public.discount_card_members for insert
  with check (true);

drop policy if exists "admin all discount card members" on public.discount_card_members;
create policy "admin all discount card members"
  on public.discount_card_members
  using (true)
  with check (true);
