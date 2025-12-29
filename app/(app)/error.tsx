'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error tracking service
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Etwas ist schiefgelaufen</h2>
              <p className="text-muted-foreground">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
              </p>
            </div>

            {error.message && (
              <div className="w-full p-3 bg-muted rounded-lg text-left">
                <p className="text-sm font-mono text-muted-foreground">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2 w-full pt-2">
              <Button 
                onClick={reset}
                className="flex-1"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/feed'}
                className="flex-1"
              >
                Zur Startseite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
