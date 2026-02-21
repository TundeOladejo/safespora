'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Shield, Key } from 'lucide-react'
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

const PERMISSION_MODULES = [
  { key: 'users', label: 'Users', actions: ['view', 'edit', 'delete'] },
  { key: 'incidents', label: 'Incidents', actions: ['view', 'edit', 'delete'] },
  { key: 'staff', label: 'Staff', actions: ['view', 'edit', 'delete'] },
  { key: 'analytics', label: 'Analytics', actions: ['view'] },
  { key: 'moderation', label: 'Moderation', actions: ['view', 'edit'] },
  { key: 'settings', label: 'Settings', actions: ['view', 'edit'] },
  { key: 'admins', label: 'Admins', actions: ['view', 'edit', 'delete', 'invite'] },
]

export function InviteAdminButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({})

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value
      }
    }))
  }

  const handleRoleChange = (newRole: 'admin' | 'super_admin') => {
    setRole(newRole)
    if (newRole === 'super_admin') {
      // Super admin gets all permissions
      const allPermissions: Record<string, Record<string, boolean>> = {}
      PERMISSION_MODULES.forEach(module => {
        allPermissions[module.key] = {}
        module.actions.forEach(action => {
          allPermissions[module.key][action] = true
        })
      })
      setPermissions(allPermissions)
    }
  }

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!fullName || fullName.trim().length < 2) {
      toast.error('Please enter a full name')
      return
    }

    if (role === 'admin' && Object.keys(permissions).length === 0) {
      toast.error('Please select at least one permission')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/admins/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: fullName.trim(), role, permissions }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success(`Invitation sent to ${email}`)
      toast.info(`Temporary password: ${data.tempPassword}`, {
        duration: 10000,
        description: 'Please share this password securely with the new admin'
      })
      
      setOpen(false)
      setEmail('')
      setFullName('')
      setRole('admin')
      setPermissions({})
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Invite New Admin</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send an invitation to add a new admin to the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <Label className="text-gray-400 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Full Name */}
          <div>
            <Label className="text-gray-400 mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Role */}
          <div>
            <Label className="text-gray-400 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === 'admin'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <p className="text-white font-medium">Admin</p>
                <p className="text-gray-400 text-sm mt-1">Custom permissions</p>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('super_admin')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === 'super_admin'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <p className="text-white font-medium">Super Admin</p>
                <p className="text-gray-400 text-sm mt-1">Full access</p>
              </button>
            </div>
          </div>

          {/* Permissions */}
          {role === 'admin' && (
            <div>
              <Label className="text-gray-400 mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Permissions
              </Label>
              <div className="space-y-3">
                {PERMISSION_MODULES.map(module => (
                  <div key={module.key} className="bg-gray-800 rounded-lg p-4">
                    <p className="text-white font-medium mb-3">{module.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {module.actions.map(action => (
                        <label
                          key={action}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[module.key]?.[action] || false}
                            onChange={(e) =>
                              handlePermissionChange(module.key, action, e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-300 text-sm capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> A temporary password will be generated and displayed after
              sending the invitation. The new admin will be required to change their password on
              first login.
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
            onClick={handleInvite}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
