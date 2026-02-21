'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NotifyWaitlistButtonProps {
  pendingEmails: string[]
}

export function NotifyWaitlistButton({ pendingEmails }: NotifyWaitlistButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloadLink, setDownloadLink] = useState('')

  const handleNotify = async () => {
    if (!downloadLink || !downloadLink.startsWith('http')) {
      toast.error('Please enter a valid download link')
      return
    }

    if (pendingEmails.length === 0) {
      toast.error('No pending users to notify')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/waitlist/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emails: pendingEmails,
          downloadLink 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to notify waitlist')
      }

      toast.success(`Successfully notified ${data.sent} users!`)
      if (data.failed > 0) {
        toast.warning(`${data.failed} emails failed to send`)
      }
      
      setOpen(false)
      setDownloadLink('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to notify waitlist')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Mail className="w-4 h-4 mr-2" />
          Notify Waitlist ({pendingEmails.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Notify Waitlist Users</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send launch notification emails to all pending waitlist users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">
              {pendingEmails.length} users will be notified
            </p>
            <p className="text-gray-400 text-sm">
              Each user will receive an email with the download link and their early access benefits.
            </p>
          </div>

          <div>
            <Label className="text-gray-400 mb-2 block">Download Link</Label>
            <Input
              type="url"
              value={downloadLink}
              onChange={(e) => setDownloadLink(e.target.value)}
              placeholder="https://apps.apple.com/... or https://play.google.com/..."
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-500 text-xs mt-1">
              Enter the App Store or Play Store link for SafeSpora
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> This will send emails to all pending users and update their status to "invited". This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className='text-red-600 border-red-600 hover:text-white hover:bg-red-600/10'
          >
            Cancel
          </Button>
          <Button
            onClick={handleNotify}
            disabled={loading || !downloadLink}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : `Send to ${pendingEmails.length} Users`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
