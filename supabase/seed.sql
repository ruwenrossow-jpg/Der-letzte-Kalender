-- Seed Demo Entities
-- Run this AFTER running docs/04_data_model.sql

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

-- ============================================
-- TEST USER PROFILES (Auto-created on login)
-- ============================================
-- Note: User profiles are now automatically created when users log in via magic link
-- The auth callback generates unique handles from email addresses
-- No manual profile creation needed!

-- For testing, you can create test emails:
-- 1. test1@example.com → Will auto-create profile with handle like "test1_a1b2c3d4"
-- 2. test2@example.com → Will auto-create profile with handle like "test2_e5f6g7h8"
-- 3. prof.schmidt@example.com → Will auto-create profile with handle like "prof_schmidt_i9j0k1l2"

-- To make a user an organizer of an entity, run:
-- INSERT INTO entity_memberships (entity_id, user_id, role)
-- VALUES (
--   (SELECT id FROM entities WHERE handle = 'prof_schmidt'),
--   (SELECT id FROM profiles WHERE email = 'your-test-email@example.com'),
--   'organizer'
-- );
