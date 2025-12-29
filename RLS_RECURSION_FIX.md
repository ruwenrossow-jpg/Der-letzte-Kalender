# 🔧 RLS INFINITE RECURSION FIX

## Problem
```
Failed to create event: infinite recursion detected in policy for relation "entity_memberships"
```

**Ursache:** RLS Policies auf `entity_memberships` Tabelle verweisen auf sich selbst → Endlos-Schleife

**Beispiel rekursive Policy:**
```sql
-- ❌ SCHLECHT: Rekursiv!
CREATE POLICY "Check membership"
ON entity_memberships
USING (
  user_id IN (
    SELECT user_id FROM entity_memberships  -- Greift wieder auf sich selbst zu!
    WHERE role = 'admin'
  )
);
```

---

## ✅ Lösung 1: TEMPORÄRER FIX (Bereits implementiert)

### Was wurde geändert:

**1. Event Creation nur für eigenes Profil**
- [server.ts](features/events/server.ts#L390-L403) - Membership Check komplett deaktiviert
- User kann NUR Events auf eigenem Profil erstellen (entity_id = user_id)
- Kein entity_memberships Query → Keine RLS recursion

**2. Create Event Page vereinfacht**
- [create-event/page.tsx](app/(app)/create-event/page.tsx#L14-L25) - entity_memberships Query auskommentiert
- Zeigt nur User's eigenes Profil an
- Selector disabled (nur 1 Option)

**3. Form UI angepasst**
- [create-event-form.tsx](features/events/components/create-event-form.tsx#L122-L142)
- Label: "Events werden auf deinem persönlichen Profil veröffentlicht"
- Select disabled wenn nur 1 Entity

### Jetzt testen:
1. Öffne `/create-event`
2. Fülle Formular aus (Titel, Start, Ende)
3. Klicke "Event erstellen"
4. ✅ **Sollte funktionieren!** Event wird auf deinem Profil gepostet

---

## 🔧 Lösung 2: PERMANENTER FIX (Manuell ausführen)

### Migration 006: RLS Policies neu schreiben

Datei: [006_fix_entity_memberships_rls.sql](supabase/migrations/006_fix_entity_memberships_rls.sql)

**Was macht das:**
1. Löscht alle rekursiven Policies
2. Erstellt einfache, nicht-rekursive Policies:
   - User sieht eigene Memberships
   - User sieht alle Entity-Memberships (für public info)
   - Entity Owner kann Memberships verwalten

**Wichtig:** Policies nutzen KEINE Subqueries die wieder entity_memberships abfragen!

```sql
-- ✅ GUT: Direkt auth.uid() prüfen
CREATE POLICY "Users can view own memberships"
ON entity_memberships FOR SELECT
USING (user_id = auth.uid());

-- ✅ GUT: Prüfung via entities Tabelle (nicht rekursiv)
CREATE POLICY "Entity owners can manage"
ON entity_memberships FOR ALL
USING (
  entity_id IN (
    SELECT id FROM entities WHERE created_by = auth.uid()
  )
);
```

### Ausführen:
1. Supabase Dashboard → SQL Editor
2. Kopiere komplette [006_fix_entity_memberships_rls.sql](supabase/migrations/006_fix_entity_memberships_rls.sql)
3. Führe aus
4. Teste: `SELECT * FROM entity_memberships WHERE user_id = auth.uid();`

### Nach Migration 006:
- Uncomment entity_memberships Query in [create-event/page.tsx](app/(app)/create-event/page.tsx#L20-L24)
- Entferne "Nur eigenes Profil" Check in [server.ts](features/events/server.ts#L396-L402)
- User können Events für alle ihre Entities erstellen

---

## 🚨 Lösung 3: NUCLEAR OPTION (Nur für Development!)

Falls Migration 006 IMMER NOCH Probleme macht:

```sql
-- RLS komplett deaktivieren
ALTER TABLE entity_memberships DISABLE ROW LEVEL SECURITY;
```

**⚠️ ACHTUNG:**
- Nur für lokale Development!
- NIEMALS in Production!
- Alle User können alle Memberships sehen/ändern!

---

## 📊 Status Check

### Funktioniert jetzt (Temporärer Fix):
- ✅ Event erstellen auf eigenem Profil
- ✅ Keine RLS recursion Errors
- ✅ User sieht nur eigenes Profil im Selector

### Funktioniert NOCH NICHT:
- ❌ Events für andere Entities erstellen (z.B. als Organizer)
- ❌ entity_memberships Queries (auskommentiert)

### Nächste Schritte:
1. Teste Event Creation auf eigenem Profil
2. Wenn das funktioniert: Führe Migration 006 aus
3. Teste ob entity_memberships Query dann funktioniert
4. Uncomment Code + re-enable Entity selection

---

## 🐛 Debugging

Falls Event Creation IMMER NOCH fehlschlägt:

```sql
-- Check 1: Existiert dein Profil als Entity?
SELECT * FROM entities WHERE id = (SELECT id FROM profiles WHERE id = auth.uid());

-- Check 2: RLS auf entities Tabelle OK?
SELECT * FROM entities WHERE id = auth.uid();

-- Check 3: Kannst du Events einfügen?
INSERT INTO events (entity_id, title, start_at, end_at, created_by, status)
VALUES (auth.uid(), 'Test Event', NOW(), NOW() + INTERVAL '1 hour', auth.uid(), 'published');
```

Falls Check 1 LEER: Migration 005 fehlt!
Falls Check 2 LEER: RLS Policy auf entities fehlt!
Falls Check 3 Error: RLS Policy auf events fehlt!
