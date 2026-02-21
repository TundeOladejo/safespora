'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { XCircle } from 'lucide-react'

export default function FalseReportButton({ incidentId }: { incidentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFalseReport = async () => {
    if (!confirm('Mark this as a false report? This action cannot be undone.')) return

    setLoading(true)

    try {
      const response = await fetch('/api/admin/incidents/false-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      })

      if (!response.ok) throw new Error('Failed to mark as false report')

      toast.success('Marked as false report')
      router.refresh()
    } catch (error) {
      toast.error('Failed to mark as false report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFalseReport}
      disabled={loading}
      variant="outline"
      className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
    >
      <XCircle className="w-4 h-4 mr-2" />
      {loading ? 'Processing...' : 'False Report'}
    </Button>
  )
}
