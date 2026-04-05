-- ============================================
-- WORLDPAD — Run ONLY this file now
-- Safe to run even if some parts already exist
-- ============================================

-- 1. Add columns to existing tables (safe — IF NOT EXISTS)
alter table notes add column if not exists is_seeded boolean default false;
alter table notes add column if not exists upvotes int default 0;
alter table notes add column if not exists world_id uuid;
alter table notes add column if not exists world_slug text;

alter table comments add column if not exists is_private boolean default false;
alter table comments add column if not exists note_author_id text;

-- 2. Suggestions table
create table if not exists suggestions (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) <= 300),
  author_name text not null,
  author_id text not null,
  author_animal text default '🐾',
  category text default 'general',
  upvotes int default 0,
  created_at timestamptz default now()
);
alter table suggestions enable row level security;

-- Drop policies first to avoid "already exists" error
drop policy if exists "Anyone can read suggestions" on suggestions;
drop policy if exists "Anyone can insert suggestions" on suggestions;
drop policy if exists "Anyone can update suggestions" on suggestions;

create policy "Anyone can read suggestions" on suggestions for select using (true);
create policy "Anyone can insert suggestions" on suggestions for insert with check (true);
create policy "Anyone can update suggestions" on suggestions for update using (true);

-- 3. Worlds table
create table if not exists worlds (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  emoji text default '🌍',
  creator_id text not null,
  creator_name text not null,
  creator_animal text default '🐾',
  tags text[],
  member_count int default 1,
  note_count int default 0,
  created_at timestamptz default now()
);
alter table worlds enable row level security;

drop policy if exists "Anyone can read worlds" on worlds;
drop policy if exists "Anyone can insert worlds" on worlds;
drop policy if exists "Anyone can update worlds" on worlds;

create policy "Anyone can read worlds" on worlds for select using (true);
create policy "Anyone can insert worlds" on worlds for insert with check (true);
create policy "Anyone can update worlds" on worlds for update using (true);

select 'All done! ✅' as status;
