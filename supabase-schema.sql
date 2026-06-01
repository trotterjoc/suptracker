-- Run this in your Supabase SQL Editor

create table supplements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dosage text default '',
  time_of_day text not null check (time_of_day in ('morning', 'afternoon', 'night')),
  take_with text default 'water',
  notes text default '',
  created_at timestamptz default now()
);

create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid references supplements(id) on delete cascade,
  log_date date not null default current_date,
  taken_at timestamptz default now(),
  unique(supplement_id, log_date)
);

-- Allow public read/write (for personal use app)
alter table supplements enable row level security;
alter table daily_logs enable row level security;

create policy "Allow all" on supplements for all using (true) with check (true);
create policy "Allow all" on daily_logs for all using (true) with check (true);
