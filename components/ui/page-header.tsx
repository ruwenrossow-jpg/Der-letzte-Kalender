'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

export function PageHeader({ title, showBackButton = true, onBack }: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="flex items-center gap-3 pb-4">
      {showBackButton && (
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  )
}
