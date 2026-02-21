'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle } from 'lucide-react'
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
import { toast } from 'sonner'

interface DeactivateAdminButtonProps {
  adminId: string
  adminEmail: string
  isActive: boolean
}

export function DeactivateAdminButton({ 
  adminId, 
  adminEmail, 
  isActive 
}: DeactivateAdminButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/admins/${adminId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update admin status')
      }

      toast.success(`Admin ${isActive ? 'deactivated' : 'activated'} successfully`)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update admin status')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isActive ? (
          <Button variant="destructive">
            <Ban className="w-4 h-4 mr-2" />
            Deactivate Admin
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Activate Admin
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isActive ? 'Deactivate' : 'Activate'} Admin
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isActive
              ? 'This admin will no longer be able to access the admin portal.'
              : 'This admin will be able to access the admin portal again.'}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-white font-medium mb-1">Admin Email</p>
          <p className="text-gray-400">{adminEmail}</p>
        </div>

        {isActive && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-500 text-sm">
              <strong>Warning:</strong> The admin will be immediately logged out and will not be
              able to log in again until reactivated.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleToggleStatus}
            disabled={loading}
            variant={isActive ? 'destructive' : 'default'}
            className={!isActive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {loading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
