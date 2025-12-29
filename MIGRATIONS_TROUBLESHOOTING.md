# 🚨 MIGRATIONS TROUBLESHOOTING GUIDE

## PROBLEM: "Invalid input" beim Event erstellen

**Ursache:** Migration 005 wurde nicht ausgeführt!

**Symptome:**
- ❌ "Invalid input" Fehlermeldung
- ❌ Event kann nicht erstellt werden
- ❌ Formular zeigt "Profil wird vorbereitet..."

**Lösung:**

### Schritt 1: Status prüfen
```sql
-- Führe in Supabase Dashboard → SQL Editor aus:
-- File: supabase/migrations/CHECK_STATUS.sql
```

### Schritt 2: Fehlende Migrationen ausführen

#### Migration 002: Personal Events (falls fehlt)
```sql
-- File: supabase/migrations/002_personal_events.sql
-- Führe komplette Datei aus
```

#### Migration 003: Dismissed Updates (falls fehlt)
```sql
-- File: supabase/migrations/003_dismissed_updates.sql
-- Führe komplette Datei aus
```

#### Migration 004: Profile Bio Field (falls fehlt)
```sql
-- File: supabase/migrations/004_add_bio_to_profiles.sql
-- Führe komplette Datei aus
```

#### ⚠️ Migration 005: Users as Entities (KRITISCH!)
```sql
-- File: supabase/migrations/005_users_as_entities.sql
-- MUSS ausgeführt werden damit Event Creation funktioniert!
```

---

## PROBLEM: Profil bearbeiten funktioniert nicht

**Ursache:** Migration 004 fehlt (bio column)

**Symptome:**
- ❌ Änderungen werden nicht gespeichert
- ❌ Keine Fehlermeldung sichtbar
- ❌ Console zeigt DB Error

**Lösung:**
```sql
-- Migration 004 ausführen:
ALTER TABLE profiles ADD COLUMN bio text;
```

---

## PROBLEM: Week View zeigt keine Events

**Ursache:** JavaScript Error oder keine Events vorhanden

**Lösung:**
1. Browser Console öffnen (F12)
2. Nach Fetch-Errors suchen
3. Prüfe ob Events existieren: `/calendar` → Tag-Ansicht
4. Falls keine Events: Erstelle Test-Event

---

## SCHNELL-FIX: Alle Migrationen auf einmal

```sql
-- 1. Personal Events
CREATE TABLE IF NOT EXISTS personal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  location_name text,
  notes text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Dismissed Updates
CREATE TABLE IF NOT EXISTS dismissed_updates (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  dismissed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- 3. Profile Bio
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- 4. Users as Entities (WICHTIG!)
INSERT INTO entities (id, type, name, handle, verified, created_by)
SELECT 
  p.id,
  'crew'::entity_type,
  COALESCE(p.display_name, 'User'),
  COALESCE(p.handle, 'user_' || substring(p.id::text, 1, 8)),
  false,
  p.id
FROM profiles p
WHERE p.id NOT IN (SELECT id FROM entities)
ON CONFLICT (id) DO NOTHING;
```

---

## VERIFY: Prüfe ob es funktioniert

### Test 1: Event erstellen
1. Öffne `/create-event`
2. Sollte zeigen: "Dein Profil (Du)" als erste Option
3. Fülle Formular aus
4. Klicke "Event erstellen"
5. ✅ Erfolg → Redirect zu Entity-Profil

### Test 2: Profil bearbeiten
1. Öffne `/me`
2. Klicke "✏️ Profil bearbeiten"
3. Ändere Name oder Bio
4. Klicke "Speichern"
5. ✅ Erfolg → Änderungen sofort sichtbar

### Test 3: Week View
1. Öffne `/calendar`
2. Klicke "Woche" Button
3. ✅ Erfolg → Alle Events der Woche sichtbar

---

## SUPPORT

Falls Probleme weiterhin bestehen:

1. **Browser Console öffnen** (F12)
2. **Screenshots machen** von:
   - Fehlermeldung
   - Console Errors
   - Network Tab (Requests)
3. **Supabase Logs prüfen**:
   - Dashboard → Logs → Database

---

## HÄUFIGE FEHLER

### "Foreign key constraint violation"
→ Migration 005 fehlt (User hat keine Entity)

### "Column 'bio' does not exist"
→ Migration 004 fehlt

### "Table 'personal_events' does not exist"
→ Migration 002 fehlt

### Events werden nicht angezeigt
→ Browser Cache leeren (Ctrl+Shift+R)
→ Oder: Keine Events vorhanden (erstelle Test-Event)
