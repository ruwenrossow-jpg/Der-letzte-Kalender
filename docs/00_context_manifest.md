# Context Manifest (Read Me First)

## Product
- Lifestyle Social Calendar: Termine kommen pull-artig in den Kalender (Follow → Updates → 1 Tap Add → Shared Event).
- Zieltester: Professor:innen (Vorlesungen/Prüfungen/Events posten), Studierende folgen und führen Kalender parallel in der App.

## Design Reference
- Screenshots liegen unter: docs/figma/
- Figma Export Code liegt unter: docs/reference/figma-export/
  - IMPORTANT: Code ist nur visuelle/strukturelle Referenz. NICHT kopieren, NICHT als Basis übernehmen.
  - Ziel: bestmögliche, einfache Architektur (KISS) bei ähnlich wirkender UI.

## P0 Scope (MVP)
- Auth + Profile
- Entities (Prof/Crew/Business) + Follow/Unfollow
- Feed (Events aus Followings + Seed)
- Event Detail Sheet
- Add-to-Calendar (Join) + Undo
- In-App Updates Sheet ("Updates von deinen Crews")
- Calendar Day View (minimal)
- Me/Profile Bereich: Following + My Events + Create Event (Organizer)

## Out of Scope (P0)
- perfekte Week/Month Views (dürfen stub/readonly sein)
- Active-Now Presence, People Near You, Location permissions
- Maps Routing/Walk times
- Business self-serve posting + Moderation
