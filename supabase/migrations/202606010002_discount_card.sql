alter table public.doctors
  add column if not exists accepts_discount_card boolean not null default false,
  add column if not exists discount_value text,
  add column if not exists discount_note text;
