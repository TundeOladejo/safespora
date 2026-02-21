'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'

interface AddAdminNoteButtonProps {
  incidentId: string
  currentNote?: string | null
}

export default function AddAdminNoteButton({ incidentId, currentNote }: AddAdminNoteButtonProps) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(currentNote || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/incidents/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, note }),
      })

      if (!response.ok) throw new Error('Failed to save note')

      toast.success('Admin note saved')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to save note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          {currentNote ? 'Edit Note' : 'Add Note'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Admin Note</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add internal notes about this incident (not visible to users)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter admin notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[150px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
