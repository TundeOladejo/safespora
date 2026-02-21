'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function RejectStaffButton({ staffId }: { staffId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/staff/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject staff')
      }

      toast.success('Staff verification rejected')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to reject staff verification')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Reject Staff Verification</DialogTitle>
          <DialogDescription className="text-gray-400">
            Please provide a reason for rejecting this staff member's verification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the verification is being rejected..."
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            variant="destructive"
          >
            {loading ? 'Rejecting...' : 'Reject Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
