'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

export default function ResolveIncidentButton({ incidentId }: { incidentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResolve = async () => {
    if (!confirm('Mark this incident as resolved?')) return

    setLoading(true)

    try {
      const response = await fetch('/api/admin/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      })

      if (!response.ok) throw new Error('Failed to resolve incident')

      toast.success('Incident marked as resolved')
      router.refresh()
    } catch (error) {
      toast.error('Failed to resolve incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleResolve}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {loading ? 'Resolving...' : 'Mark Resolved'}
    </Button>
  )
}
