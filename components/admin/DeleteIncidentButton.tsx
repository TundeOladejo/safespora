'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export default function DeleteIncidentButton({ incidentId }: { incidentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this incident permanently? This action cannot be undone.')) return

    setLoading(true)

    try {
      const response = await fetch('/api/admin/incidents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      })

      if (!response.ok) throw new Error('Failed to delete incident')

      toast.success('Incident deleted')
      router.push('/admin/incidents')
    } catch (error) {
      toast.error('Failed to delete incident')
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={loading}
      variant="destructive"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
