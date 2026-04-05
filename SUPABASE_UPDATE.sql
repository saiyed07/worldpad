-- ============================================
-- WORLDPAD v2 - Run this in Supabase SQL Editor
-- Adds: is_seeded, is_private columns
-- ============================================

-- Add new columns to existing tables (safe to run on existing data)
alter table notes add column if not exists is_seeded boolean default false;
alter table notes add column if not exists upvotes int default 0;

alter table comments add column if not exists is_private boolean default false;
alter table comments add column if not exists note_author_id text;

-- ============================================
-- OR if starting fresh, run this full setup:
-- ============================================

-- drop table if exists votes cascade;
-- drop table if exists comments cascade;
-- drop table if exists notes cascade;

-- create table notes (
--   id uuid default gen_random_uuid() primary key,
--   content text not null check (char_length(content) <= 150),
--   author_name text not null,
--   author_id text not null,
--   author_color text not null,
--   author_animal text default '🐾',
--   country text,
--   state text,
--   city text,
--   interest_tag text,
--   note_color text not null default '#FFEB3B',
--   upvotes int default 0,
--   downvotes int default 0,
--   is_seeded boolean default false,
--   created_at timestamptz default now(),
--   expires_at timestamptz default (now() + interval '24 hours')
-- );

-- create table comments (
--   id uuid default gen_random_uuid() primary key,
--   note_id uuid references notes(id) on delete cascade,
--   parent_comment_id uuid references comments(id) on delete cascade,
--   content text not null check (char_length(content) <= 300),
--   author_name text not null,
--   author_id text not null,
--   author_color text not null,
--   author_animal text default '🐾',
--   is_private boolean default false,
--   note_author_id text,
--   created_at timestamptz default now()
-- );

-- create table votes (
--   id uuid default gen_random_uuid() primary key,
--   note_id uuid references notes(id) on delete cascade,
--   author_id text not null,
--   vote_type text check (vote_type in ('up', 'down')),
--   unique(note_id, author_id)
-- );

-- RLS (already enabled, just add policies if missing)
-- alter table notes enable row level security;
-- alter table comments enable row level security;
-- alter table votes enable row level security;

select 'Worldpad v2 DB updated! ✅' as status;

-- Add suggestions table
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
create policy "Anyone can read suggestions" on suggestions for select using (true);
create policy "Anyone can insert suggestions" on suggestions for insert with check (true);
create policy "Anyone can update suggestions" on suggestions for update using (true);

-- ── WORLDS / COMMUNITIES ──
create table if not exists worlds (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,  -- url-friendly name like "friends-tv-series"
  description text,
  emoji text default '🌍',
  creator_id text not null,
  creator_name text not null,
  creator_animal text default '🐾',
  tags text[],  -- searchable tags
  member_count int default 1,
  note_count int default 0,
  created_at timestamptz default now()
);
alter table worlds enable row level security;
create policy "Anyone can read worlds" on worlds for select using (true);
create policy "Anyone can insert worlds" on worlds for insert with check (true);
create policy "Anyone can update worlds" on worlds for update using (true);

-- Add world_id to notes
alter table notes add column if not exists world_id uuid references worlds(id) on delete set null;
alter table notes add column if not exists world_slug text;
