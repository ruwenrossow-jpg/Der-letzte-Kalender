# Development Setup Guide

## 1. Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase account (free tier ok)

## 2. Supabase Project Setup

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your **Project URL** and **anon public key**

### 2.2 Run Database Migrations
1. In Supabase Dashboard → SQL Editor
2. Copy content from `docs/04_data_model.sql`
3. Execute SQL to create:
   - Tables (profiles, entities, entity_memberships, follows, events, user_calendar_items)
   - RLS Policies
   - Enums
   - Functions

### 2.3 Seed Demo Data
1. In Supabase Dashboard → SQL Editor
2. Copy content from `supabase/seed.sql`
3. Execute to seed:
   - 3 Entities (Prof. Dr. Schmidt, Running Crew Berlin, Yoga Collective)
   - Demo Events
   - **IMPORTANT:** Entity memberships (organizer role) will be created **after you sign up**

## 3. Local Environment Setup

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3 Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Create Test Users + Organizer Memberships

### 4.1 Sign Up Test Users
1. Go to `/login`
2. Sign in with magic link (use your email)
3. Check email and click link
4. Profile row is auto-created in `profiles` table

### 4.2 Whitelist as Organizer (SQL)
After signing up, run this in Supabase SQL Editor to make your user an organizer:

```sql
-- Get your user_id from auth.users or profiles table
-- Example: Replace 'your-user-id-here' with actual UUID

-- Make user organizer for "Prof. Dr. Schmidt" entity
INSERT INTO public.entity_memberships (entity_id, user_id, role)
SELECT 
  e.id,
  'your-user-id-here'::uuid,
  'organizer'::membership_role
FROM public.entities e
WHERE e.name = 'Prof. Dr. Schmidt';

-- Optional: Add to other entities
INSERT INTO public.entity_memberships (entity_id, user_id, role)
SELECT 
  e.id,
  'your-user-id-here'::uuid,
  'organizer'::membership_role
FROM public.entities e
WHERE e.name IN ('Running Crew Berlin', 'Yoga Collective');
```

**Quick way to get your user_id:**
```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

## 5. Verify Setup

### ✅ Checklist
- [ ] `npm run dev` starts without errors
- [ ] Can access [http://localhost:3000](http://localhost:3000)
- [ ] Redirects to `/feed` (will be empty for now)
- [ ] No console errors in browser
- [ ] Supabase tables exist (check Dashboard → Table Editor)
- [ ] Demo entities visible in `entities` table

## 6. Next Steps

After Commits 4-5 (Auth), you'll be able to:
- Sign in with magic link
- See protected routes working
- Access app with bottom navigation

After Commits 6-7 (Entities), you'll be able to:
- Browse entities in `/discover`
- Follow/unfollow entities
- View entity profiles

## 7. Troubleshooting

### "Invalid API Key"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

### "RLS Policy Error"
- Ensure all SQL from `docs/04_data_model.sql` was executed
- Check Supabase Dashboard → Authentication → Policies

### "Build Errors"
- Delete `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`
- Try: `npm run build`

## 8. Generate Updated Database Types (Future)

When you modify the database schema:

```bash
npx supabase gen types typescript --project-id your-project-ref > types/database.types.ts
```

(Requires Supabase CLI installed)
