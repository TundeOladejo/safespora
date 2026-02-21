'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserCheck } from 'lucide-react'

interface UnsuspendUserButtonProps {
  userId: string
}

export default function UnsuspendUserButton({ userId }: UnsuspendUserButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUnsuspend = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users/unsuspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to unsuspend user')

      toast.success('User unsuspended successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to unsuspend user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleUnsuspend}
      disabled={loading}
      className="border-green-500 text-green-500 hover:bg-green-500/10"
    >
      <UserCheck className="w-4 h-4 mr-2" />
      {loading ? 'Unsuspending...' : 'Unsuspend User'}
    </Button>
  )
}
