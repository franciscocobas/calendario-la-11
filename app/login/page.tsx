import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { LoginForm } from '@/components/login-form'

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    redirect('/admin')
  }

  return <LoginForm />
}
