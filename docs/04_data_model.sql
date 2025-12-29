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

-- Entities (seeded by admin in MVP; selectable by all authed users)
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

-- Memberships (used to whitelist organizers)
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

-- Events (shared)
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

-- Helper: is organizer/admin of entity
create or replace function public.is_entity_organizer(eid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.entity_memberships em
    where em.entity_id = eid
      and em.user_id = auth.uid()
      and em.role in ('organizer','admin')
  );
$$;

-- Select policy: published + visibility rules; organizers can see drafts
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

-- Insert/update: only organizer/admin
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

-- Calendar Items (user joins event into own calendar)
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
