# UI Inventory (P0) - Components & Rules

## Navigation
- Bottom Tab Bar: Home, Calendar, (Create/+), Network, Discover, Me (Me kann alternativ in Profile gebündelt werden)
- P0 erlaubt: einige Tabs als stub, aber Home+Calendar+Discover+Me sollten funktionieren.

## Buttons
1) Primary CTA Button
- Label examples: "In Kalender eintragen", "Add to My Flow", "Share & Invite"
- States: default | loading | success | disabled
- Must support: iconLeft optional

2) Secondary text actions
- Examples: "Später", "Rückgängig machen", "Not now", "Mehr Optionen"

3) Icon buttons
- Close (X), Heart (save), Bell (badge), Overflow (⋯)

4) Chips
- Filter chips (All, Sport, Nightlife, …), selected state

5) Segmented control
- Day / Week / Month (P0: only Day must be real)

## Cards / Sheets
A) EventFeedCard
- hero image
- organizer pill (clickable → entity profile)
- title
- meta row: time + location
- social proof pill: attendees / friends going
- save heart
- optional CTA under card

B) Updates Sheet (Crew Updates)
- header + pagination "1 von N"
- source row: avatar + name + timestamp
- embedded event summary + conflict indicator
- CTA add + success + undo

C) Event Detail Sheet
- hero image
- info rows: time, location, attendees
- action pills: Route, Crew, Invite (P0: stubs allowed)
- primary CTA: Add to My Flow

D) Calendar Event Block (Day)
- title + time
- tap → detail sheet

E) Me/Profile
- sections: following list, my events list, create event button

## Styling Rules (KISS)
- Semantic tokens only: primary/success/warning/danger/surface/text
- 2 shadow levels max: card, sheet
- touch target >= 44px for icon buttons
