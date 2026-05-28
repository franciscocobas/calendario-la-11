'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? 'Saliendo...' : 'Cerrar sesion'}
    </Button>
  )
}
