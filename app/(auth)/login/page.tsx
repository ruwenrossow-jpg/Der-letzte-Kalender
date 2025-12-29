import { LoginForm } from '@/features/auth/components/login-form'
import { getUser } from '@/features/auth/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await getUser()

  // If already logged in, redirect to feed
  if (user) {
    redirect('/feed')
  }

  return <LoginForm />
}
