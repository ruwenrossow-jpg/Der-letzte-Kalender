import { getUser } from '@/features/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Calendar, Search, User } from 'lucide-react'
import { getUpdatesCount } from '@/features/updates/server'
import { getUpdates } from '@/features/updates/server'
import { UpdatesBadge } from '@/features/updates/components/updates-badge'
import { UpdatesSheet } from '@/features/updates/components/updates-sheet'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  // Protect all app routes - redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch updates with error handling - don't crash the entire layout if updates fail
  let updatesCount = 0
  let updates: any[] = []
  
  try {
    updatesCount = await getUpdatesCount()
    updates = await getUpdates()
  } catch (error) {
    console.error('Failed to load updates in layout:', error)
    // App still works without updates - graceful degradation
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-around h-16">
            <NavLink href="/feed" icon={<Home className="w-5 h-5" />} label="Home" />
            <NavLink href="/calendar" icon={<Calendar className="w-5 h-5" />} label="Kalender" />
            
            {/* Updates Bell */}
            <UpdatesSheet
              updates={updates}
              trigger={
                <button className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-full text-muted-foreground hover:text-foreground transition-colors">
                  <UpdatesBadge count={updatesCount} />
                  <span className="text-xs">Updates</span>
                </button>
              }
            />
            
            <NavLink href="/discover" icon={<Search className="w-5 h-5" />} label="Entdecken" />
            <NavLink href="/me" icon={<User className="w-5 h-5" />} label="Ich" />
          </div>
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 min-w-[64px] h-full text-muted-foreground hover:text-foreground transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  )
}
