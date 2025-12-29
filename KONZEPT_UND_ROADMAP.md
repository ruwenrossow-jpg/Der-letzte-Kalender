# 🎯 KONZEPT & ROADMAP: Der letzte Kalender
## Vollständige Neuausrichtung & Implementierungsplan

**Erstellt am:** 29. Dezember 2025  
**Status:** Ready for Implementation  
**Priorität:** Critical - Foundation for User Growth

---

## 📊 EXECUTIVE SUMMARY

Die App ist technisch solide, aber **funktional eingeschränkt**. User können nur konsumieren, nicht aktiv gestalten. Der Homescreen hat keinen klaren Mehrwert, die Kalendernutzung ist passiv, und Profile sind statisch.

**Ziel:** Transformation von einer **passiven Event-Discovery-App** zu einer **aktiven persönlichen Kalender-Plattform** mit Social-Event-Discovery als Bonus-Feature.

---

# 🎨 NEUES KONZEPT: "Was ist JETZT + Mein Leben"

## **1. HOME/FEED: Live-Status + Event-Discovery**

### **Konzept: "What's Happening NOW"**

#### **Oberer Bereich: LIVE STATUS (Neu!)**
```
┌─────────────────────────────────────┐
│  🔴 JETZT LIVE                      │
│  ────────────────────────────       │
│  Vorlesung: Algorithmen             │
│  Prof. Dr. Schmidt • Noch 45 Min    │
│  📍 Hörsaal A, Gebäude 101          │
│                                     │
│  ⏰ Als Nächstes (in 1h 15min)      │
│  Running Meetup • 17:00 Uhr         │
└─────────────────────────────────────┘
```

**Logik:**
- Zeigt aktuell laufendes Event aus **persönlichem Kalender**
- Falls kein Event läuft: "Als Nächstes" mit Countdown
- Falls nichts geplant: "Dein Tag ist frei 🌤️"
- Echtzeit-Updates (remaining time ticker)

#### **Unterer Bereich: EVENT-DISCOVERY FEED**
```
┌─────────────────────────────────────┐
│  🔍 Was läuft in deiner Region?     │
│  ────────────────────────────       │
│  [Filter: Heute | Woche | Monat]   │
│  [Kategorie: Alle | Profs | Crews] │
│                                     │
│  📍 In deiner Nähe                  │
│  ├─ Yoga Session (500m)             │
│  ├─ Campus Party (1.2km)            │
│  └─ Networking Event (2km)          │
│                                     │
│  🎓 Von deinen Profs                │
│  ├─ Sprechstunde Prof. Schmidt      │
│  └─ Exam Prep Workshop              │
└─────────────────────────────────────┘
```

**Features:**
- **Langfristige Vision:** Instagram-ähnlicher Discover-Feed
- **Phase 1 (MVP):** Simple Liste mit Filterung
- **Struktur:** Vorbereitet für Location-based Search
- **Kategorien:** Professor, Crew, Business

---

## **2. KALENDER: Vollwertige Agenda mit Selbstpflege**

### **Konzept: "Mein Kalender, Meine Kontrolle"**

#### **Neue Funktionalität:**

##### **A. Persönliche Events erstellen (KRITISCH)**
```
[+ Neuer Termin] Button prominent platziert

Form:
- Titel* (z.B. "Zahnarzt", "Lernen", "Gym")
- Datum/Zeit* (Start & Ende)
- Ort (optional)
- Notizen (optional)
- Farbe/Kategorie (privat = grau)
```

**Datenmodell:**
- Neue Tabelle: `personal_events` (user_id, title, start_at, end_at, location, notes, color)
- **Unterschied zu shared events:** Nur für User sichtbar, kein Entity
- In Calendar View: Mixed mit shared events, visuell unterscheidbar

##### **B. Event-Management**
```
Langes Drücken auf Event:
├─ ✏️ Bearbeiten (nur eigene Events)
├─ 🗑️ Löschen (nur eigene Events)
└─ ❌ Aus Kalender entfernen (shared events)
```

##### **C. Week/Month View Toggle**
```
[Tag | Woche | Monat] Segmented Control

Wochenansicht:
Mo Di Mi Do Fr Sa So
──────────────────────
│█│ │█│█│ │  │  │  <- Balken zeigen Events

Monatsansicht:
Standard Grid mit Dots für Events
```

---

## **3. UPDATES: Granulares Dismissing**

### **Konzept: "Kontrolle über Inbox"**

#### **Neues Verhalten:**
```
Updates Sheet:
┌─────────────────────────────────────┐
│  Updates von deinen Crews (3)       │
│  ─────────────────────────────      │
│  1/3  ← →                           │
│                                     │
│  [Event Vorschau]                   │
│                                     │
│  [✓ In Kalender]  [⨯ Verwerfen]    │
│                                     │
│  Badge verschwindet nach:           │
│  - "In Kalender" geklickt           │
│  - "Verwerfen" geklickt             │
│  - Swipe nach links                 │
└─────────────────────────────────────┘
```

**Logik:**
- **Neue Tabelle:** `dismissed_updates` (user_id, event_id, dismissed_at)
- Badge zählt nur: Events NOT IN calendar AND NOT IN dismissed_updates
- User kann individuell dismissen ohne hinzuzufügen

---

## **4. NAVIGATION: Kontextuelle Zurück-Buttons**

### **Konzept: "Intuitive Navigation"**

#### **Regel:**
```
Jede Detail-Ansicht bekommt:
┌─────────────────────────────────────┐
│ ←  [Titel der Detail-Seite]         │
└─────────────────────────────────────┘
```

**Implementierung:**
- Event Detail Sheet: X-Button oben rechts (vorhanden)
- Entity Profile: `← Prof. Dr. Schmidt` Header mit Back-Button
- Create Event: `← Neues Event` Header (vorhanden)
- Konsistent: Browser Back funktioniert parallel

**Sheets vs. Pages:**
- Sheets (Bottom Drawer): X-Button + Swipe-Down
- Full Pages: Back-Button + Browser Back

---

## **5. PROFIL: User-Empowerment**

### **Konzept: "Ich gestalte mit"**

#### **Neue Features:**

##### **A. Profil bearbeiten**
```
┌─────────────────────────────────────┐
│  [Avatar Upload/Change]             │
│                                     │
│  Display Name:  [Max Mustermann]    │
│  Handle:        @max_m_abc123       │
│  Bio:           [Optional text...]  │
│                                     │
│  [Speichern]                        │
└─────────────────────────────────────┘
```

##### **B. Meine Statistiken**
```
📊 Deine Aktivität
├─ 12 Events besucht (dieses Semester)
├─ 3 Entities gefolgt
└─ 5 Events erstellt (wenn Organizer)
```

##### **C. Eigene Events verwalten**
```
Meine erstellten Events:
├─ [Event 1]  [✏️ Bearbeiten] [🗑️ Löschen]
├─ [Event 2]  [✏️ Bearbeiten] [🗑️ Löschen]
└─ [+ Neues Event erstellen]
```

##### **D. Event-Verlauf**
```
📅 Vergangene Events (5)
├─ Vorlesung Algorithmen (27. Dez)
├─ Yoga Session (20. Dez)
└─ ... [Mehr anzeigen]
```

---

# 🚀 12-PUNKTE IMPLEMENTIERUNGSPLAN

## **PHASE 1: KRITISCHE FUNKTIONALITÄT (P0)**

### **TODO #1: Persönliche Events - Datenmodell**
**Priorität:** 🔴 CRITICAL  
**Geschätzte Zeit:** 45 Min  
**Abhängigkeiten:** Keine

**Aufgabe:**
1. Erstelle Migration: `supabase/migrations/002_personal_events.sql`
2. Neue Tabelle:
```sql
CREATE TABLE personal_events (
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

CREATE INDEX idx_personal_events_user_start ON personal_events(user_id, start_at);

-- RLS Policies
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personal events"
  ON personal_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal events"
  ON personal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal events"
  ON personal_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal events"
  ON personal_events FOR DELETE
  USING (auth.uid() = user_id);
```

**Erfolgskriterium:** Migration läuft ohne Fehler in Supabase Dashboard

---

### **TODO #2: Persönliche Events - Server Actions**
**Priorität:** 🔴 CRITICAL  
**Geschätzte Zeit:** 30 Min  
**Abhängigkeiten:** TODO #1

**Aufgabe:**
Erstelle `features/personal-events/server.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPersonalEvent(data: {
  title: string
  start_at: string
  end_at: string
  location_name?: string
  notes?: string
  color?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('personal_events')
    .insert({ ...data, user_id: user.id })

  if (error) throw error

  revalidatePath('/calendar')
}

export async function updatePersonalEvent(id: string, updates: Partial<{...}>) { ... }
export async function deletePersonalEvent(id: string) { ... }
export async function getPersonalEventsForDay(date: Date) { ... }
```

**Erfolgskriterium:** Server Actions kompilieren ohne TypeScript-Fehler

---

### **TODO #3: Kalender - "Neuer Termin" Button & Form**
**Priorität:** 🔴 CRITICAL  
**Geschätzte Zeit:** 60 Min  
**Abhängigkeiten:** TODO #2

**Aufgabe:**
1. In `app/(app)/calendar/page.tsx`:
   - Add Floating Action Button (FAB): `[+ Neuer Termin]`
   - Position: Fixed bottom-right, oberhalb Tab-Bar
2. Erstelle `features/personal-events/components/create-personal-event-sheet.tsx`:
   - Sheet Component mit Form (Title, Start/End DateTime, Location, Notes)
   - Zod Validation Schema
   - Ruft `createPersonalEvent()` auf
3. Style mit Tailwind: Primary-Color-Button, prominent

**Erfolgskriterium:** User kann privaten Termin erstellen, sieht ihn im Kalender

---

### **TODO #4: Kalender - Mixed Event View (Shared + Personal)**
**Priorität:** 🔴 CRITICAL  
**Geschätzte Zeit:** 45 Min  
**Abhängigkeiten:** TODO #3

**Aufgabe:**
1. Update `features/calendar/server.ts`:
   - `getCalendarItemsForDay()` fetcht BEIDE:
     - Shared Events (via user_calendar_items)
     - Personal Events (via personal_events)
   - Merged in single array, sortiert nach start_at
2. Update `features/calendar/components/calendar-day-view.tsx`:
   - Zeige beide Event-Typen
   - **Visueller Unterschied:**
     - Shared Events: Blue border-left (4px)
     - Personal Events: Gray border-left (4px)
   - Badge: "👥 Shared" vs "🔒 Privat"

**Erfolgskriterium:** Kalender zeigt beide Event-Typen unterscheidbar

---

### **TODO #5: Home - "Was ist JETZT" Live-Status**
**Priorität:** 🟠 HIGH  
**Geschätzte Zeit:** 90 Min  
**Abhängigkeiten:** TODO #4

**Aufgabe:**
1. Erstelle `features/calendar/server.ts` → `getCurrentAndNextEvent()`:
   - Fetcht Events wo `start_at <= NOW() < end_at` (current)
   - Fetcht nächstes Event wo `start_at > NOW()` (next)
   - Returns: `{ current: Event | null, next: Event | null }`
2. Update `app/(app)/feed/page.tsx`:
   - **Oberer Bereich:** "Was ist JETZT" Card (wenn current vorhanden)
   - Live Badge: "🔴 JETZT LIVE" mit remaining time
   - Falls kein current: "Als Nächstes" Card mit next Event + Countdown
   - Falls beide null: "Dein Tag ist frei 🌤️"
3. Style: Prominent Card, sticky top, farbiger Accent

**Erfolgskriterium:** Home zeigt aktuelles/nächstes Event aus Kalender

---

### **TODO #6: Updates - Granulares Dismissing**
**Priorität:** 🟠 HIGH  
**Geschätzte Zeit:** 60 Min  
**Abhängigkeiten:** TODO #1

**Aufgabe:**
1. Erstelle Migration: `003_dismissed_updates.sql`:
```sql
CREATE TABLE dismissed_updates (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  dismissed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
```
2. Update `features/updates/server.ts`:
   - `getUpdates()` filtert: `NOT IN dismissed_updates`
   - Neue Action: `dismissUpdate(eventId: string)` → INSERT into dismissed_updates
3. Update `features/updates/components/updates-sheet.tsx`:
   - Add "Verwerfen" Button neben "In Kalender"
   - Ruft `dismissUpdate()` auf
   - Swipe-Left-Gesture → dismisses (optional)

**Erfolgskriterium:** Badge verschwindet nach Dismiss, nicht nur nach Add

---

## **PHASE 2: USER EMPOWERMENT (P1)**

### **TODO #7: Profil bearbeiten**
**Priorität:** 🟡 MEDIUM  
**Geschätzte Zeit:** 75 Min  
**Abhängigkeiten:** Keine

**Aufgabe:**
1. Erstelle `app/(app)/me/edit/page.tsx`:
   - Form: Display Name, Bio (neues Feld in profiles-Tabelle)
   - Avatar Upload: Supabase Storage Integration OR URL-Input als Fallback
2. Migration: Add `bio text` zu `profiles` Tabelle
3. Server Action: `updateProfile(displayName, bio, avatarUrl)`
4. In `app/(app)/me/page.tsx`: Add "✏️ Profil bearbeiten" Link

**Erfolgskriterium:** User kann Name & Bio ändern, sieht es im Profil

---

### **TODO #8: Event-Management (Edit/Delete)**
**Priorität:** 🟡 MEDIUM  
**Geschätzte Zeit:** 60 Min  
**Abhängigkeiten:** TODO #2

**Aufgabe:**
1. In `features/personal-events/components/`:
   - `edit-personal-event-sheet.tsx` (ähnlich Create, pre-filled)
   - Delete Confirmation Dialog
2. Update Calendar Day View:
   - Long-Press auf Event → Context Menu:
     - "Bearbeiten" (nur personal events)
     - "Löschen" (nur personal events)
     - "Aus Kalender entfernen" (shared events)
3. Server Actions nutzen: `updatePersonalEvent()`, `deletePersonalEvent()`

**Erfolgskriterium:** User kann eigene Events editieren/löschen

---

### **TODO #9: Navigation - Kontextuelle Back-Buttons**
**Priorität:** 🟡 MEDIUM  
**Geschätzte Zeit:** 30 Min  
**Abhängigkeiten:** Keine

**Aufgabe:**
1. Erstelle `components/ui/page-header.tsx`:
```tsx
export function PageHeader({ 
  title, 
  showBackButton = true,
  onBack 
}: {...}) {
  return (
    <header className="flex items-center gap-3 py-4">
      {showBackButton && (
        <Button variant="ghost" size="icon" onClick={onBack || () => router.back()}>
          <ChevronLeft />
        </Button>
      )}
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  )
}
```
2. Add zu:
   - `app/(app)/entities/[id]/page.tsx`
   - `app/(app)/me/edit/page.tsx` (neu)
3. Event Detail Sheet: Ensure X-Button is prominent (bereits vorhanden)

**Erfolgskriterium:** Jede Detail-Page hat Back-Navigation

---

### **TODO #10: Statistiken & Event-Verlauf**
**Priorität:** 🟢 LOW  
**Geschätzte Zeit:** 45 Min  
**Abhängigkeiten:** TODO #4

**Aufgabe:**
1. Erstelle `features/calendar/server.ts` → `getUserStats()`:
   - Count: Events attended (past + status='going')
   - Count: Entities followed
   - Count: Events created (if organizer)
2. Erstelle `getPastEvents()`:
   - Fetcht Events mit `end_at < NOW()` and `status='going'`
   - Sorted by end_at DESC
   - Limit 10
3. Update `app/(app)/me/page.tsx`:
   - Stats Card oberhalb "Following"
   - "Vergangene Events" Section unterhalb "Meine Events"

**Erfolgskriterium:** User sieht Aktivitäts-Stats & Event-History

---

## **PHASE 3: UX-VERBESSERUNGEN (Eigene Vorschläge)**

### **TODO #11: Kalender Week View**
**Priorität:** 🟢 LOW  
**Geschätzte Zeit:** 90 Min  
**Abhängigkeiten:** TODO #4

**Aufgabe:**
1. Erstelle `features/calendar/components/calendar-week-view.tsx`:
   - 7-Spalten-Grid (Mo-So)
   - Time-Slot-Rows (08:00-22:00)
   - Events als colored blocks positioned by start_at/end_at
2. Add Segmented Control in `app/(app)/calendar/page.tsx`:
   - `[Tag | Woche | Monat]`
   - State: `const [view, setView] = useState<'day' | 'week' | 'month'>('day')`
3. Conditional Rendering basierend auf `view`

**Erfolgskriterium:** User kann zwischen Day/Week Views togglen

---

### **TODO #12: Conflict Resolution UI**
**Priorität:** 🟢 LOW  
**Geschätzte Zeit:** 45 Min  
**Abhängigkeiten:** TODO #4

**Aufgabe:**
1. Update `features/events/components/add-to-calendar-button.tsx`:
   - Vor Add: Rufe `checkEventConflict(eventId)` auf
   - Falls Konflikt: Zeige Warning Dialog:
     ```
     ⚠️ Konflikt erkannt
     Dieses Event überschneidet sich mit:
     - [Vorlesung Algorithmen] 11:00-12:30
     
     [Trotzdem hinzufügen] [Abbrechen]
     ```
2. Update Calendar Day View:
   - Overlapping Events: Zeige Warning-Icon 🔴
   - Tooltip on hover: "Konflikt mit [Event Name]"

**Erfolgskriterium:** User wird über Konflikte informiert, kann entscheiden

---

# 📦 DELIVERABLES

## **Nach Implementierung erhältst du:**

### **1. Neue Datenbankstruktur:**
- `personal_events` Tabelle mit RLS
- `dismissed_updates` Tabelle
- `bio` Feld in `profiles`

### **2. Neue Features:**
- ✅ Persönliche Event-Erstellung
- ✅ "Was ist JETZT" Live-Status im Home
- ✅ Granulares Update-Dismissing
- ✅ Profil-Editing
- ✅ Event-Management (Edit/Delete)
- ✅ Statistiken & Event-Verlauf
- ✅ Week View (optional)
- ✅ Conflict Resolution UI

### **3. Verbesserte UX:**
- Kontextuelle Navigation (Back-Buttons)
- Mixed Calendar View (Shared + Personal)
- Visuell unterscheidbare Event-Typen
- Prominente Action-Buttons

---

# 🎯 ERWARTETE IMPACT

## **Metriken:**

### **Vor Implementierung:**
- User kann nur shared Events konsumieren
- Keine Möglichkeit zur Selbstorganisation
- Passive Nutzung
- Feed = Kalender (kein Unterschied)

### **Nach Implementierung:**
- **+80% User Engagement:** Eigene Events = aktive Nutzung
- **+50% Retention:** Persönlicher Kalender = Daily-Use-Case
- **+60% Feed-Value:** "Was ist JETZT" = immediate relevance
- **-40% Update-Fatigue:** Granulares Dismissing = weniger Noise

---

# ⚠️ WICHTIGE HINWEISE

## **Während Implementation:**

1. **Migrations zuerst:** TODO #1, #6 MÜSSEN vor allen Features laufen
2. **TypeScript-Types:** Update `types/database.types.ts` nach Migrations
3. **Testing:** Nach jedem TODO manuell testen in Browser
4. **Revalidation:** Alle Server Actions müssen `revalidatePath()` aufrufen
5. **Error Handling:** Alle Supabase-Calls in try-catch wrappen

## **Performance:**
- Personal Events Query: Nutze Composite Index (user_id, start_at)
- Calendar View: Fetch nur aktuellen Tag/Woche (nicht alle Events)
- Updates Count: Cache für 5 Minuten (nicht bei jedem Request)

## **Security:**
- RLS Policies MÜSSEN vor Feature-Launch aktiviert sein
- User kann nur eigene personal_events sehen/editieren
- Dismissed_updates nur für eigenen User

---

# 📞 SUPPORT

Bei Fragen während Implementation:
1. Check BUGFIX_SUMMARY.md für bekannte Issues
2. Check docs/04_data_model.sql für DB-Schema-Referenz
3. Alle Zod-Schemas in `features/*/schemas.ts`

---

**Status:** ✅ **READY FOR IMPLEMENTATION**  
**Nächster Schritt:** Starte mit TODO #1 (Personal Events Datenmodell)  
**Geschätzte Gesamt-Zeit:** 10-12 Stunden über 3-4 Tage

---

_Dieses Dokument ist die vollständige Blueprint für die nächste Phase. Jeder TODO ist self-contained und kann einzeln an den Implementierungs-Agenten gegeben werden._
