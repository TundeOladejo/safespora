'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface EditAdminPermissionsProps {
  adminId: string
  currentPermissions: Record<string, Record<string, boolean>>
  canEdit: boolean
}

export function EditAdminPermissions({ 
  adminId, 
  currentPermissions, 
  canEdit 
}: EditAdminPermissionsProps) {
  const router = useRouter()
  const [permissions, setPermissions] = useState(currentPermissions)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/admins/${adminId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update permissions')
      }

      toast.success('Permissions updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setPermissions(currentPermissions)
    setIsEditing(false)
  }

  if (!canEdit) {
    // View-only mode
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(permissions).map(([module, perms]: [string, any]) => (
          <div key={module} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 capitalize">{module}</h3>
            <div className="space-y-2">
              {Object.entries(perms).map(([action, allowed]: [string, any]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm capitalize">{action}</span>
                  {allowed ? (
                    <Badge className="bg-green-500">Allowed</Badge>
                  ) : (
                    <Badge variant="secondary">Denied</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isEditing ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([module, perms]: [string, any]) => (
              <div key={module} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 capitalize">{module}</h3>
                <div className="space-y-2">
                  {Object.entries(perms).map(([action, allowed]: [string, any]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm capitalize">{action}</span>
                      {allowed ? (
                        <Badge className="bg-green-500">Allowed</Badge>
                      ) : (
                        <Badge variant="secondary">Denied</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Key className="w-4 h-4 mr-2" />
            Edit Permissions
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {PERMISSION_MODULES.map(module => (
              <div key={module.key} className="bg-gray-800 rounded-lg p-4">
                <p className="text-white font-medium mb-3">{module.label}</p>
                <div className="flex flex-wrap gap-3">
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
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="border-gray-700"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
