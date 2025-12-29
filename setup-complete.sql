-- ==================================
-- DER LETZTE KALENDER - COMPLETE SETUP
-- ==================================
-- Run this in Supabase SQL Editor to set up everything
-- Copy & paste the entire file and execute

-- ============ PART 1: SCHEMA ============

-- Enable extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type entity_type as enum ('professor','crew','business');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_role as enum ('member','organizer','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_visibility as enum ('public','followers');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft','published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type calendar_status as enum ('going','removed');
exception when duplicate_object then null; end $$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  avatar_url text,
  last_inbox_seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_upsert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Entities
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  type entity_type not null,
  name text not null,
  handle text unique,
  avatar_url text,
  cover_url text,
  verified boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.entities enable row level security;

create policy "entities_select_authed"
on public.entities for select
to authenticated
using (true);

-- Memberships
create table if not exists public.entity_memberships (
  entity_id uuid references public.entities(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role membership_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (entity_id, user_id)
);

alter table public.entity_memberships enable row level security;

create policy "memberships_select_own_or_entity_admin"
on public.entity_memberships for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.entity_memberships em
    where em.entity_id = entity_memberships.entity_id
      and em.user_id = auth.uid()
      and em.role in ('admin')
  )
);

-- Follows
create table if not exists public.follows (
  follower_id uuid references auth.users(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, entity_id)
);

alter table public.follows enable row level security;

create policy "follows_select_own"
on public.follows for select
to authenticated
using (follower_id = auth.uid());

create policy "follows_insert_own"
on public.follows for insert
to authenticated
with check (follower_id = auth.uid());

create policy "follows_delete_own"
on public.follows for delete
to authenticated
using (follower_id = auth.uid());

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location_name text,
  visibility event_visibility not null default 'followers',
  status event_status not null default 'published',
  created_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists events_entity_start_idx on public.events(entity_id, start_at);

alter table public.events enable row level security;

-- Helper function
create or replace function public.is_entity_organizer(eid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.entity_memberships em
    where em.entity_id = eid
      and em.user_id = auth.uid()
      and em.role in ('organizer','admin')
  );
$$;

-- Events policies
create policy "events_select_visible"
on public.events for select
to authenticated
using (
  (status = 'published' and visibility = 'public')
  or (status = 'published' and visibility = 'followers' and exists (
      select 1 from public.follows f
      where f.follower_id = auth.uid()
        and f.entity_id = events.entity_id
  ))
  or public.is_entity_organizer(events.entity_id)
);

create policy "events_insert_organizer"
on public.events for insert
to authenticated
with check (
  public.is_entity_organizer(entity_id)
  and created_by = auth.uid()
);

create policy "events_update_organizer"
on public.events for update
to authenticated
using (public.is_entity_organizer(entity_id))
with check (public.is_entity_organizer(entity_id));

create policy "events_delete_organizer"
on public.events for delete
to authenticated
using (public.is_entity_organizer(entity_id));

-- Calendar Items
create table if not exists public.user_calendar_items (
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  status calendar_status not null default 'going',
  added_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.user_calendar_items enable row level security;

create policy "calendar_select_own"
on public.user_calendar_items for select
to authenticated
using (user_id = auth.uid());

create policy "calendar_insert_own"
on public.user_calendar_items for insert
to authenticated
with check (user_id = auth.uid());

create policy "calendar_delete_own"
on public.user_calendar_items for delete
to authenticated
using (user_id = auth.uid());

create policy "calendar_update_own"
on public.user_calendar_items for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());


-- ============ PART 2: SEED DATA ============

-- Insert 3 demo entities
INSERT INTO public.entities (type, name, handle, verified, avatar_url, cover_url)
VALUES
  (
    'professor',
    'Prof. Dr. Schmidt',
    'prof_schmidt',
    true,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=schmidt',
    null
  ),
  (
    'crew',
    'Running Crew Berlin',
    'running_crew_berlin',
    true,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=running',
    null
  ),
  (
    'crew',
    'Yoga Collective',
    'yoga_collective',
    false,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=yoga',
    null
  )
ON CONFLICT (handle) DO NOTHING;

-- Insert demo events for Prof. Dr. Schmidt
INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Vorlesung: Algorithmen & Datenstrukturen',
  'Einführung in grundlegende Algorithmen und Datenstrukturen. Pflichtveranstaltung für Informatik B.Sc.',
  (CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '2 days' + TIME '11:30:00')::timestamptz,
  'Hörsaal A, Gebäude 101',
  'followers',
  'published',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'prof_schmidt'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Prüfung: Mathematik II',
  'Klausur zur Vorlesung Mathematik II. Dauer: 90 Minuten. Bitte Studentenausweis mitbringen.',
  (CURRENT_DATE + INTERVAL '14 days' + TIME '09:00:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '14 days' + TIME '10:30:00')::timestamptz,
  'Hörsaal B, Gebäude 102',
  'followers',
  'published',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'prof_schmidt'
ON CONFLICT DO NOTHING;

-- Insert demo events for Running Crew Berlin
INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Morning Run: Tiergarten Loop',
  '5km easy run through Tiergarten. All levels welcome! We meet at Siegessäule.',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '07:00:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '08:00:00')::timestamptz,
  'Siegessäule, Tiergarten',
  'public',
  'published',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'running_crew_berlin'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Long Run Saturday',
  '15km long run at conversational pace. Route: Tempelhofer Feld loop.',
  (CURRENT_DATE + INTERVAL '5 days' + TIME '09:00:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '5 days' + TIME '11:00:00')::timestamptz,
  'Tempelhofer Feld, Haupteingang',
  'public',
  'published',
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'running_crew_berlin'
ON CONFLICT DO NOTHING;

-- Insert demo events for Yoga Collective
INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Sunrise Vinyasa Flow',
  'Start your day with energizing Vinyasa flow. Bring your own mat.',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '06:30:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '07:30:00')::timestamptz,
  'Yoga Collective Studio, Kreuzberg',
  'public',
  'published',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'yoga_collective'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (entity_id, title, description, start_at, end_at, location_name, visibility, status, cover_image_url)
SELECT 
  e.id,
  'Yin Yoga & Meditation',
  'Slow-paced practice with long-held poses. Perfect for relaxation and flexibility.',
  (CURRENT_DATE + INTERVAL '3 days' + TIME '19:00:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '20:30:00')::timestamptz,
  'Yoga Collective Studio, Kreuzberg',
  'followers',
  'published',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
FROM public.entities e
WHERE e.handle = 'yoga_collective'
ON CONFLICT DO NOTHING;

-- ============ INDEXES FOR PERFORMANCE ============

-- Optimize feed queries (follows lookup)
create index if not exists follows_follower_idx on public.follows(follower_id);
create index if not exists follows_entity_idx on public.follows(entity_id);

-- Optimize calendar queries
create index if not exists calendar_user_status_idx on public.user_calendar_items(user_id, status);
create index if not exists calendar_event_idx on public.user_calendar_items(event_id);

-- Optimize event queries
create index if not exists events_entity_idx on public.events(entity_id);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists events_start_at_idx on public.events(start_at);
create index if not exists events_status_visibility_idx on public.events(status, visibility);

-- Optimize updates queries
create index if not exists updates_user_idx on public.updates(user_id);
create index if not exists updates_created_idx on public.updates(created_at);

-- ============ DONE! ============
-- Next steps:
-- 1. Reload http://localhost:3000
-- 2. Go to /discover to see entities
-- 3. Follow some entities
-- 4. Check /feed to see public events
