-- =============================================
-- MIGRATIONS STATUS CHECK
-- Führe dieses Script aus um zu prüfen welche Migrationen fehlen
-- =============================================

-- Check 1: Personal Events Table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personal_events')
    THEN '✅ Migration 002: personal_events - INSTALLIERT'
    ELSE '❌ Migration 002: personal_events - FEHLT!'
  END as status;

-- Check 2: Dismissed Updates Table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dismissed_updates')
    THEN '✅ Migration 003: dismissed_updates - INSTALLIERT'
    ELSE '❌ Migration 003: dismissed_updates - FEHLT!'
  END as status;

-- Check 3: Bio Column in Profiles
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'bio'
    )
    THEN '✅ Migration 004: profiles.bio - INSTALLIERT'
    ELSE '❌ Migration 004: profiles.bio - FEHLT!'
  END as status;

-- Check 4: Users as Entities (User hat Entity)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM entities e
      INNER JOIN profiles p ON e.id = p.id
      LIMIT 1
    )
    THEN '✅ Migration 005: User→Entity Mapping - INSTALLIERT'
    ELSE '❌ Migration 005: User→Entity Mapping - FEHLT!'
  END as status;

-- =============================================
-- ZUSAMMENFASSUNG
-- =============================================
SELECT 
  COUNT(*) FILTER (WHERE table_name IN ('personal_events', 'dismissed_updates')) as installed_tables,
  COUNT(*) FILTER (WHERE table_name = 'profiles' AND column_name = 'bio') as bio_column_exists,
  (SELECT COUNT(*) FROM entities e INNER JOIN profiles p ON e.id = p.id) as users_with_entities
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name;
