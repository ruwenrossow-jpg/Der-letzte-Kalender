-- =============================================
-- PROFILE EDIT DEBUGGING
-- Führe diese Queries aus um das Problem zu finden
-- =============================================

-- Query 1: Prüfe ob bio Spalte existiert
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Query 2: Zeige dein aktuelles Profil (ersetze USER_ID mit deiner ID)
-- Du findest deine User ID: Supabase Dashboard → Authentication → Users
SELECT id, display_name, bio, avatar_url, handle, created_at, updated_at
FROM profiles
WHERE id = dc96ee7d-097e-4eb8-939f-aa7a79212075  -- Ersetzen!

-- Query 3: Teste manuell ob Update funktioniert (ersetze USER_ID)
UPDATE profiles
SET 
  display_name = 'Test Name Update',
  bio = 'Test Bio Update'
WHERE id = 'DEINE_USER_ID_HIER';  -- Ersetzen!

-- Query 4: Zeige RLS Policies auf profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Query 5: Teste ob du Schreibrechte hast
-- Führe als eingeloggter User aus:
-- Supabase Dashboard → SQL Editor → unten "Run as: User" auswählen
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      FOR UPDATE
    )
    THEN '✅ Du hast UPDATE Rechte auf dein Profil'
    ELSE '❌ KEINE UPDATE Rechte - RLS Policy fehlt!'
  END as check_result;

-- =============================================
-- SCHNELL-FIX: Falls bio Spalte fehlt
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- =============================================
-- SCHNELL-FIX: Falls RLS Policy fehlt
-- =============================================
-- Policy für User kann eigenes Profil updaten
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy für User kann eigenes Profil lesen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- =============================================
-- VERIFY: Teste nochmal
-- =============================================
-- Schritt 1: Zeige aktuelles Profil
SELECT display_name, bio FROM profiles WHERE id = auth.uid();

-- Schritt 2: Update
UPDATE profiles 
SET display_name = 'Neuer Name', bio = 'Neue Bio'
WHERE id = auth.uid();

-- Schritt 3: Prüfe ob es funktioniert hat
SELECT display_name, bio FROM profiles WHERE id = auth.uid();
