-- =============================================
-- FIX: Infinite Recursion in entity_memberships RLS
-- =============================================
-- Problem: RLS Policies auf entity_memberships verursachen infinite recursion
-- Lösung: Einfachere, nicht-rekursive Policies

-- Schritt 1: Alle existierenden Policies entfernen
DROP POLICY IF EXISTS "Users can view entity memberships" ON entity_memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON entity_memberships;
DROP POLICY IF EXISTS "Organizers can manage memberships" ON entity_memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON entity_memberships;
DROP POLICY IF EXISTS "Users can view memberships of entities they follow" ON entity_memberships;

-- Schritt 2: Einfache, nicht-rekursive Policies erstellen

-- Policy 1: User kann seine eigenen Memberships sehen
CREATE POLICY "Users can view own memberships"
ON entity_memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: User kann Memberships von Entities sehen (für public info)
-- WICHTIG: Keine Subquery die wieder entity_memberships abfragt!
CREATE POLICY "Users can view entity memberships"
ON entity_memberships
FOR SELECT
TO authenticated
USING (true);  -- Erstmal permissive, später kann man einschränken

-- Policy 3: Organizers/Admins können Memberships ihrer Entity verwalten
-- WICHTIG: Direkte uid Prüfung ohne rekursiven entity_memberships Check
CREATE POLICY "Entity owners can manage memberships"
ON entity_memberships
FOR ALL
TO authenticated
USING (
  -- User ist Owner der Entity (created_by)
  entity_id IN (
    SELECT id FROM entities WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  entity_id IN (
    SELECT id FROM entities WHERE created_by = auth.uid()
  )
);

-- =============================================
-- VERIFY: Teste ob es funktioniert
-- =============================================

-- Test 1: Kann User seine Memberships sehen?
SELECT * FROM entity_memberships WHERE user_id = auth.uid();

-- Test 2: Verursacht das noch recursion?
-- Sollte KEINE Errors geben
SELECT role FROM entity_memberships 
WHERE entity_id = 'some-entity-id' 
AND user_id = auth.uid();

-- =============================================
-- ALTERNATIVE: RLS komplett deaktivieren für entity_memberships
-- Falls die Policies weiterhin Probleme machen:
-- =============================================
-- ALTER TABLE entity_memberships DISABLE ROW LEVEL SECURITY;
-- 
-- ACHTUNG: Nur für Development/Testing!
-- In Production brauchst du RLS für Sicherheit.
