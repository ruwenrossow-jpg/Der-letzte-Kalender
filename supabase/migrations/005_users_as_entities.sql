-- Migration 005: User Profiles als Entities
-- Ermöglicht jedem User Events zu erstellen (ohne Organizer-Status)

-- Erstelle Entity-Eintrag für jeden User der noch keine hat
-- Verwende 'crew' type da 'user' noch nicht im enum existiert
INSERT INTO entities (id, type, name, handle, verified, created_by)
SELECT 
  p.id,
  'crew'::entity_type,
  COALESCE(p.display_name, 'User'),
  COALESCE(p.handle, 'user_' || substring(p.id::text, 1, 8)),
  false, -- User-generated Events sind nicht auto-verified
  p.id
FROM profiles p
WHERE p.id NOT IN (SELECT id FROM entities)
ON CONFLICT (id) DO NOTHING;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_entities_created_by ON entities(created_by);

-- Kommentar für zukünftige Referenz
COMMENT ON COLUMN entities.created_by IS 'Falls id = created_by: User-generierte Entity (persönliches Profil)';
