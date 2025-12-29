# Definition of Done (P0)

## Global
- No feature ships without: loading + empty + error states.
- Supabase RLS enabled on all tables.
- Zod schemas exist for every form/input boundary.
- No copying/importing code from docs/reference/figma-export. Reference only.

## P0-1 Auth + Profile
- User can sign in (magic link ok).
- Profile row exists/updates (display_name/handle optional).
- Protected routes require auth.

## P0-2 Entities + Follow
- Entities list page exists (Discover).
- Follow/Unfollow works (writes to follows).
- Entity profile page shows: name, type, follow button, upcoming events (basic list).

## P0-3 Feed (Home)
- Feed shows events from followed entities + seeded examples (if none followed).
- EventCard shows: title, organizer, time, location, social proof (attendees count).
- Tap card opens Event Detail Sheet.

## P0-4 Add-to-Calendar + Undo + Conflict boolean
- CTA adds event to user_calendar_items.
- CTA shows success state and Undo removes it.
- Conflict boolean: if overlapping events already in calendar (same day/time window), show "Konflikt vorhanden", else "Keine Konflikte".

## P0-5 Updates Sheet (In-App Inbox)
- Bell badge shows if new/updated events exist since last_inbox_seen_at.
- Sheet shows N items, pagination "1 von N".
- User can add/undo from within sheet.
- On close: last_inbox_seen_at updated.

## P0-6 Calendar Day View (minimal)
- User can view selected day.
- Events from user_calendar_items are displayed in time order (agenda ok).
- Tap event opens detail.

## P0-7 Organizer Create Event
- Create event screen visible only for organizer/admin membership.
- Create event writes to events table (published by default ok).
- Newly created event appears in followers feed.

## Deployment
- Vercel deployment works on main branch.
- Env vars configured.
