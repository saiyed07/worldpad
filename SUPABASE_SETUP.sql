-- ============================================
-- WORLDPAD - Run this in Supabase SQL Editor
-- Drop existing tables first if re-running
-- ============================================

drop table if exists votes cascade;
drop table if exists comments cascade;
drop table if exists notes cascade;

-- NOTES table
create table notes (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) <= 150),
  author_name text not null,
  author_id text not null,
  author_color text not null,
  author_animal text default '🐾',
  country text,
  state text,
  city text,
  interest_tag text,
  note_color text not null default '#FFEB3B',
  upvotes int default 0,
  downvotes int default 0,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- COMMENTS table
create table comments (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  content text not null check (char_length(content) <= 300),
  author_name text not null,
  author_id text not null,
  author_color text not null,
  author_animal text default '🐾',
  created_at timestamptz default now()
);

-- VOTES table
create table votes (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  author_id text not null,
  vote_type text check (vote_type in ('up', 'down')),
  unique(note_id, author_id)
);

-- Enable RLS
alter table notes enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;

-- RLS Policies
create policy "Anyone can read notes" on notes for select using (true);
create policy "Anyone can insert notes" on notes for insert with check (true);
create policy "Anyone can update notes" on notes for update using (true);
create policy "Anyone can delete notes" on notes for delete using (true);

create policy "Anyone can read comments" on comments for select using (true);
create policy "Anyone can insert comments" on comments for insert with check (true);

create policy "Anyone can read votes" on votes for select using (true);
create policy "Anyone can insert votes" on votes for insert with check (true);
create policy "Anyone can update votes" on votes for update using (true);

-- Enable Realtime
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table comments;

select 'Worldpad DB ready! ✅' as status;
