'use client'

import { useState } from 'react'
import { CalendarPlus, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SubscribeButton() {
  const [copied, setCopied] = useState(false)

  // Se construyen en el cliente para funcionar igual en local y en producción.
  const buildUrls = () => {
    const ics = `${window.location.origin}/calendar.ics`
    const webcal = ics.replace(/^https?/, 'webcal')
    const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`
    return { ics, webcal, google }
  }

  const openGoogle = () => {
    window.open(buildUrls().google, '_blank', 'noopener,noreferrer')
  }

  const openApple = () => {
    // webcal:// abre Apple Calendar (y Outlook) con el diálogo de suscripción.
    window.location.href = buildUrls().webcal
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildUrls().ics)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Agregar a mi calendario
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem onClick={openGoogle}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openApple}>
          Apple Calendar / Outlook
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyLink} onSelect={(e) => e.preventDefault()}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              ¡Enlace copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar enlace del feed
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
