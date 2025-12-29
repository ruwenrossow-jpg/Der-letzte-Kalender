import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get user to create/update profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Generate unique handle from email or user ID
        const emailPrefix = user.email?.split('@')[0] || 'user'
        const uniqueSuffix = user.id.slice(0, 8)
        const handle = `${emailPrefix}_${uniqueSuffix}`.toLowerCase().replace(/[^a-z0-9_]/g, '')
        
        // Upsert profile with unique handle
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email!,
          display_name: user.email?.split('@')[0] || 'User',
          handle: handle,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // URL to redirect to after sign up/in process completes
  return NextResponse.redirect(`${origin}/login`)
}
