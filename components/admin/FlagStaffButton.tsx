'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag } from 'lucide-react'
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

export function FlagStaffButton({ staffId }: { staffId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFlag = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for flagging')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/staff/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to flag staff')
      }

      toast.success('Staff member flagged for review')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to flag staff member')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
          <Flag className="w-4 h-4 mr-2" />
          Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Flag Staff Member</DialogTitle>
          <DialogDescription className="text-gray-400">
            Flag this staff member for further review or investigation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Reason for Flagging <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this staff member should be flagged..."
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
            onClick={handleFlag}
            disabled={loading || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Flagging...' : 'Flag Staff'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
