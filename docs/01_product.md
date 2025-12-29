# Product Spec (P0)

## One-liner
Ein Lifestyle-Kalender, der Termine und Freizeit-Ideen ohne Reibung in deinen Plan bringt: Folgen → Updates → 1 Tap → im Kalender.

## Zielgruppen (P0)
1) Studierende: wollen ohne Aufwand einen attraktiven, vollständigen Wochenplan (Uni + Social + Freizeit).
2) Professor:innen/Organizer: wollen Termine (Vorlesung, Prüfung, Event) schnell teilen, ohne Chaos.

## Core Promise
- Termine kommen zu mir (pull), statt dass ich sie mühsam selbst eintrage.
- Der Kalender fühlt sich "cool" und vollständig an (Lifestyle + Social Proof).

## North Star Metric (P0)
- Weekly Active Open Rate: Nutzer öffnen die App regelmäßig (Habit) UND fügen Events hinzu (Investment).

## Core Loop (P0)
1) Nutzer folgt Entities (Prof/Crew/Business).
2) Neue/aktualisierte Events erscheinen im Updates Sheet / Feed.
3) Nutzer tippt "In Kalender eintragen".
4) UI zeigt Success ("Im Kalender ✓") + Undo.
5) Nutzer sieht im Day View einen organisierten Tag.

## Constraints (P0)
- KISS: erst Funktionsfähigkeit + Loop, keine UI-Perfektion.
- Shared Events: Alle referenzieren denselben Event-Eintrag; Nutzer hat zusätzlich eigene Calendar-Join-Daten.
- Posting nur für Organizer (whitelisted via Entity Membership).

## Content Seeding (P0)
- Admin seedet einige Entities (z.B. "Prof X", "Running Group", "Yoga Collective") und Example Events.
- Zusätzlich: Organizer kann Events erstellen (einfaches Formular).
