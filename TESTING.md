# Manual Testing Checklist

This document provides manual testing procedures to verify the application is working correctly before deployment.

## 🔐 Authentication Tests

### Test 1: Magic Link Login
**Steps:**
1. Navigate to `/login`
2. Enter a valid email address
3. Click "Magischen Link senden"
4. Check email inbox for magic link
5. Click link in email
6. Verify redirect to `/feed`

**Expected:** User is logged in and sees feed page

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Session Persistence
**Steps:**
1. Log in successfully
2. Close browser completely
3. Reopen browser and navigate to app
4. Verify still logged in

**Expected:** User remains authenticated across sessions

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Protected Routes
**Steps:**
1. Log out (if logged in)
2. Try to access `/feed` directly
3. Try to access `/calendar` directly
4. Try to access `/discover` directly

**Expected:** Redirected to `/login` for all routes

**Status:** [ ] Pass [ ] Fail

---

## 👥 Entity & Follow Tests

### Test 4: Discover Entities
**Steps:**
1. Log in
2. Navigate to `/discover`
3. Verify entities are displayed (Prof Schmidt, Running Crew, etc.)

**Expected:** List of entities with avatars, names, and types

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Follow Entity
**Steps:**
1. Go to `/discover`
2. Click "Folgen" on any entity
3. Verify button changes to "Gefolgt"
4. Navigate to `/me`
5. Check "Following" section

**Expected:** Entity appears in following list on profile

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Unfollow Entity
**Steps:**
1. Follow an entity (if not already following)
2. Click "Gefolgt" button
3. Verify changes back to "Folgen"
4. Check `/me` profile

**Expected:** Entity removed from following list

**Status:** [ ] Pass [ ] Fail

---

## 📰 Feed Tests

### Test 7: Feed Shows Public Events
**Steps:**
1. Log in (don't follow anyone)
2. Navigate to `/feed`
3. Verify public events are shown

**Expected:** At least 3-4 events visible (seed data)

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Feed Shows Followed Events
**Steps:**
1. Follow "Prof Schmidt"
2. Navigate to `/feed`
3. Verify "ML Grundlagen Workshop" appears

**Expected:** Events from followed entities prioritized in feed

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Event Details Sheet
**Steps:**
1. In feed, click on any event card
2. Verify bottom sheet opens (90vh)
3. Check all info displayed: title, organizer, date, time, location, image

**Expected:** Complete event details in sheet

**Status:** [ ] Pass [ ] Fail

---

## 📅 Calendar Tests

### Test 10: Add Event to Calendar
**Steps:**
1. Open event detail sheet
2. Click "In Kalender eintragen"
3. Verify button changes to "Im Kalender" (green)
4. Check for conflict indicator

**Expected:** Event added, conflict status shown

**Status:** [ ] Pass [ ] Fail

---

### Test 11: Undo Add to Calendar
**Steps:**
1. Add event to calendar (Test 10)
2. Click "Rückgängig" button within 5 seconds
3. Verify button returns to "In Kalender eintragen"

**Expected:** Event removed from calendar

**Status:** [ ] Pass [ ] Fail

---

### Test 12: Conflict Detection
**Steps:**
1. Add "ML Grundlagen Workshop" (Dec 28, 14:00) to calendar
2. Try to add "Running Crew Winterlauf" (Dec 28, 14:00)
3. Check conflict badge

**Expected:** "Konflikt vorhanden" badge shown (red)

**Status:** [ ] Pass [ ] Fail

---

### Test 13: No Conflict Detection
**Steps:**
1. Add "Prof Schmidt Sprechstunde" (Dec 30) to calendar
2. Check conflict badge

**Expected:** "Keine Konflikte" badge shown (grey)

**Status:** [ ] Pass [ ] Fail

---

### Test 14: Calendar Day View
**Steps:**
1. Add 2-3 events to calendar
2. Navigate to `/calendar`
3. Verify events shown in time order
4. Test prev/next day navigation
5. Test "Heute" button

**Expected:** Events displayed chronologically, navigation works

**Status:** [ ] Pass [ ] Fail

---

## 🔔 Updates Inbox Tests

### Test 15: Updates Badge
**Steps:**
1. Open Supabase dashboard
2. Update an event's `updated_at` timestamp to current time
3. Refresh app
4. Check bell icon in bottom nav

**Expected:** Red badge with count appears

**Status:** [ ] Pass [ ] Fail

---

### Test 16: Updates Sheet Pagination
**Steps:**
1. Ensure 2+ updates exist
2. Click bell icon
3. Verify sheet opens with "1 von N"
4. Test left/right navigation

**Expected:** Pagination through updates works

**Status:** [ ] Pass [ ] Fail

---

### Test 17: Add from Updates Sheet
**Steps:**
1. Open updates sheet
2. Click "In Kalender eintragen" on an update
3. Verify button changes to "Im Kalender"

**Expected:** Can add events from inbox

**Status:** [ ] Pass [ ] Fail

---

### Test 18: Badge Clears on Close
**Steps:**
1. With badge showing, open updates sheet
2. Close sheet (any method: X, swipe, outside click, button)
3. Refresh page
4. Check bell icon

**Expected:** Badge count is zero or gone

**Status:** [ ] Pass [ ] Fail

---

## ✍️ Event Creation Tests

### Test 19: Organizer Access
**Steps:**
1. Log in with non-organizer account
2. Navigate to `/create-event`
3. Verify access

**Expected:** If not organizer: redirected or see "keine Entities"

**Status:** [ ] Pass [ ] Fail

---

### Test 20: Create Event
**Steps:**
1. Get organizer access (add membership in Supabase)
2. Navigate to `/create-event`
3. Fill out form (entity, title, description, dates, location)
4. Click "Event erstellen"
5. Check `/feed` for new event

**Expected:** Event created and visible in feed for followers

**Status:** [ ] Pass [ ] Fail

---

## 🛡️ Security & RLS Tests

### Test 21: Cannot Access Other User's Calendar Items
**Steps:**
1. Open browser DevTools → Console
2. Run this code:
```javascript
const { data } = await fetch('/api/supabase-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'user_calendar_items',
    method: 'select',
    filters: { user_id: 'some-other-user-id-here' }
  })
}).then(r => r.json())
console.log(data)
```
3. Check result

**Expected:** Empty array or RLS policy error (no access)

**Status:** [ ] Pass [ ] Fail

---

### Test 22: Cannot Modify Other User's Follows
**Steps:**
1. Copy another user's ID from Supabase dashboard
2. In DevTools console, try:
```javascript
await fetch('/api/supabase-proxy', {
  method: 'POST',
  body: JSON.stringify({
    table: 'follows',
    method: 'delete',
    filters: { follower_id: 'other-user-id' }
  })
})
```

**Expected:** Operation fails due to RLS policy

**Status:** [ ] Pass [ ] Fail

---

### Test 23: Cannot Create Event for Entity Without Membership
**Steps:**
1. Get entity ID you're NOT a member of
2. Try to create event via form or API
3. Verify rejection

**Expected:** "Not authorized" error

**Status:** [ ] Pass [ ] Fail

---

## 🚀 Performance Tests

### Test 24: Feed Load Time
**Steps:**
1. Open DevTools → Network tab
2. Navigate to `/feed`
3. Check "Time" column for API calls
4. Count number of database queries

**Expected:** 
- Page loads in < 2 seconds
- 1-2 database queries total (no N+1)

**Status:** [ ] Pass [ ] Fail

---

### Test 25: No N+1 in Calendar View
**Steps:**
1. Add 5+ events to calendar
2. Open DevTools → Network tab
3. Navigate to `/calendar`
4. Check Supabase API calls

**Expected:** Single query fetches all events + entities (not one per event)

**Status:** [ ] Pass [ ] Fail

---

## 🎨 UI/UX Tests

### Test 26: Loading States
**Steps:**
1. Navigate to `/feed`
2. Observe initial loading state
3. Navigate to `/discover`
4. Observe loading

**Expected:** Loading indicators visible, no content flash

**Status:** [ ] Pass [ ] Fail

---

### Test 27: Empty States
**Steps:**
1. Create fresh account (or clear all data)
2. Check `/feed` (no follows)
3. Check `/calendar` (no events)
4. Check `/me` following section

**Expected:** Helpful empty state messages, not errors

**Status:** [ ] Pass [ ] Fail

---

### Test 28: Error States
**Steps:**
1. Disconnect internet
2. Try to load `/feed`
3. Reconnect
4. Try again

**Expected:** Error message shown, recovers gracefully

**Status:** [ ] Pass [ ] Fail

---

## 📱 Mobile Responsive Tests

### Test 29: Mobile Navigation
**Steps:**
1. Open in mobile viewport (DevTools → Toggle device)
2. Test bottom navigation bar
3. Verify all 5 tabs clickable

**Expected:** Bottom nav works, icons visible, active state shown

**Status:** [ ] Pass [ ] Fail

---

### Test 30: Mobile Sheet Interaction
**Steps:**
1. Open event detail sheet on mobile
2. Test swipe-down to close
3. Test scrolling within sheet

**Expected:** Sheet behaves correctly, scrolling smooth

**Status:** [ ] Pass [ ] Fail

---

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests above pass
- [ ] Environment variables documented in `.env.local.example`
- [ ] Database schema deployed to production Supabase
- [ ] Supabase RLS policies enabled on all tables
- [ ] Auth redirect URLs configured in Supabase
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No console errors in production build
- [ ] Vercel project configured with correct env vars

---

## 🐛 Known Issues / TODO

Document any known issues here:

- [ ] _No known issues yet_

---

## 📊 Test Results Summary

**Total Tests:** 30  
**Passed:** ___  
**Failed:** ___  
**Skipped:** ___  

**Tested By:** _______________  
**Date:** _______________  
**Environment:** [ ] Development [ ] Production
