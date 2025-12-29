# Der Letzte Kalender

A social calendar app for students to follow professors, crews, and businesses and discover their events.

## 🎯 Features

- **Magic Link Authentication** via Supabase Auth
- **Follow Entities** (Professors, Crews, Businesses)
- **Personalized Feed** showing events from followed entities
- **Calendar View** with conflict detection
- **Updates Inbox** for new/modified events
- **Event Creation** for organizers and admins
- **Add to Calendar** with undo functionality

## 🛠️ Tech Stack

- **Framework:** Next.js 15.1 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Magic Link)
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel-ready

## 📋 Architecture

Feature-slice structure:
```
features/
  ├── auth/          # Authentication & profiles
  ├── entities/      # Professors, crews, businesses
  ├── events/        # Event management
  ├── calendar/      # User calendar & conflict detection
  └── updates/       # In-app inbox for new events
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd der-letzte-kalender
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up database**
   
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy contents of `setup-complete.sql`
   - Execute the SQL to create tables, RLS policies, and seed data

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Detailed Setup Guide

For comprehensive setup instructions, see [docs/06_DEV_SETUP.md](docs/06_DEV_SETUP.md)

## 🌐 Deployment (Vercel)

### Prerequisites

- Vercel account
- Supabase project (production)
- GitHub repository

### Steps

1. **Push code to GitHub** (if not already done)
   ```bash
   git remote add origin https://github.com/yourusername/der-letzte-kalender.git
   git branch -M main
   git push -u origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)

3. **Configure environment variables in Vercel**
   
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

4. **Deploy database schema**
   
   In Supabase Dashboard (production project):
   - Go to SQL Editor
   - Execute `setup-complete.sql`

5. **Deploy application**
   
   Vercel will automatically deploy from your main branch.

6. **Update Supabase Auth settings**
   
   In Supabase Dashboard → Authentication → URL Configuration:
   - Add your Vercel URL to "Site URL"
   - Add your Vercel URL to "Redirect URLs"

7. **Verify deployment**
   - Test login flow
   - Verify entities appear in /discover
   - Test following and feed functionality

## 📊 Database Schema

The app uses the following main tables:

- **profiles** - User profiles with display name and inbox tracking
- **entities** - Professors, crews, and businesses
- **entity_memberships** - User roles (member, organizer, admin)
- **follows** - User-entity follow relationships
- **events** - Events created by entities
- **user_calendar_items** - User's personal calendar
- **updates** - Activity feed for new/modified events

All tables have Row Level Security (RLS) policies enabled.

See `setup-complete.sql` for complete schema and policies.

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Input validation** with Zod schemas at all boundaries
- **Authentication required** for all app routes
- **Authorization checks** for organizer actions

## 📁 Project Structure

```
app/
  ├── (app)/              # Authenticated app routes
  │   ├── feed/           # Home feed
  │   ├── discover/       # Explore entities
  │   ├── calendar/       # User's calendar
  │   ├── me/             # Profile page
  │   ├── entities/       # Entity profiles
  │   └── create-event/   # Event creation (organizers only)
  ├── login/              # Authentication page
  └── api/                # API routes
features/                 # Feature modules (see above)
components/ui/            # Reusable UI components (shadcn/ui)
lib/                      # Utilities and configurations
docs/                     # Documentation
```

## 🧪 Testing

For manual testing checklist and security verification steps, see [TESTING.md](TESTING.md)

## 📖 Documentation

- [Definition of Done](docs/05_definition_of_done.md) - P0 MVP requirements
- [Development Setup](docs/06_DEV_SETUP.md) - Detailed setup guide
- [UI Inventory](docs/03_ui_inventory.md) - Component specifications
- [Flows](docs/04_flows.md) - User flows and scenarios

## 🤝 Contributing

This is an MVP project. Future enhancements tracked in P1+ backlog.

## 📄 License

Private project - All rights reserved

## 🆘 Troubleshooting

### "Invalid credentials" error
- Verify your Supabase URL and anon key in `.env.local`
- Ensure you're using the correct project credentials

### "Auth callback error"
- Check `NEXT_PUBLIC_SITE_URL` matches your current URL
- Update Supabase Auth redirect URLs

### Database errors
- Ensure `setup-complete.sql` was executed successfully
- Check RLS policies are enabled in Supabase dashboard

### Empty feed
- Follow some entities in /discover
- Check that seed data was created (6 demo events)
- Verify events are published and have future dates

For more help, check the [development setup guide](docs/06_DEV_SETUP.md).
