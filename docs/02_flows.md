# User Flows (P0)

## Flow A: Follow Entity (Prof/Crew/Business)
- Entry: Event Card zeigt Organizer-Pill (klickbar) oder Network/Discover Liste
- Action: Open Entity Profile → Follow
- Result: Events dieser Entity erscheinen im Feed/Updates

## Flow B: Add-to-Calendar (Shared Event)
- Entry: Event Card CTA "In Kalender eintragen" ODER Updates Sheet CTA
- Action: create user_calendar_items row (user_id + event_id, status=going)
- UI: CTA state wird Success "Im Kalender ✓"
- Undo: delete row oder set status=removed (MVP: delete)
- Conflict: P0 nur boolean:
  - "Keine Konflikte" oder "Konflikt vorhanden" (Konflikt=überlappt mit bestehendem Calendar Item)

## Flow C: Updates Sheet ("Updates von deinen Crews")
- Trigger: Bell Badge oder App Open (optional)
- Query: Events von gefolgten Entities, die neu/aktualisiert sind seit last_inbox_seen_at
- UI: Sheet zeigt 1 von N, navigierbar
- Action: Add-to-Calendar + Undo
- After: set last_inbox_seen_at = now

## Flow D: Calendar Day View (minimal)
- Query: user_calendar_items for selected day → join events
- UI: simple timeline/agenda
- Interaction: tap event → Event Detail Sheet

## Flow E: Organizer creates Event
- Entry: Me/Profile → "Create Event"
- Guard: only organizer membership
- Form minimal: title, start_at, end_at, location_name (optional), cover_image_url (optional), visibility
- Result: Event published → followers see it in Feed/Updates
