import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import { Settings as SettingsIcon, Shield, Bell, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function checkSettingsPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.SETTINGS.VIEW)
  
  return {
    adminUser,
    canEdit: hasPermission(adminUser, PERMISSIONS.SETTINGS.EDIT)
  }
}

async function getAdminUsers() {
  const supabase = await createClient()

  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  return adminUsers || []
}

async function getSystemInfo() {
  const supabase = await createClient()

  // Get database stats
  const { data: authData } = await supabase.auth.admin.listUsers()
  const totalUsers = authData?.users?.length || 0
  
  const { count: totalIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
  const { count: totalStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })

  return {
    totalUsers,
    totalIncidents: totalIncidents || 0,
    totalStaff: totalStaff || 0,
  }
}

export default async function SettingsPage() {
  // Check permissions first
  const { adminUser, canEdit } = await checkSettingsPermissions()
  
  const adminUsers = await getAdminUsers()
  const systemInfo = await getSystemInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage system configuration and admin users</p>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">System Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-white text-2xl font-bold">{systemInfo.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Incidents</p>
            <p className="text-white text-2xl font-bold">{systemInfo.totalIncidents}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Staff Records</p>
            <p className="text-white text-2xl font-bold">{systemInfo.totalStaff}</p>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">Admin Users</h2>
          </div>
          <Badge variant="outline" className='text-white'>{adminUsers.length} admins</Badge>
        </div>
        <div className="space-y-3">
          {adminUsers.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{admin.email}</p>
                <p className="text-gray-400 text-sm mt-1 capitalize">
                  Role: {admin.role}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Added {new Date(admin.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={admin.role === 'super_admin' ? 'destructive' : 'secondary'}>
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Notification Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Critical Incident Alerts</p>
              <p className="text-gray-400 text-sm">Get notified when critical incidents are reported</p>
            </div>
            <Badge className="bg-green-500">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Staff Verification Requests</p>
              <p className="text-gray-400 text-sm">Get notified when new staff verification is pending</p>
            </div>
            <Badge className="bg-green-500">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Daily Summary Reports</p>
              <p className="text-gray-400 text-sm">Receive daily summary of platform activity</p>
            </div>
            <Badge className="bg-green-500">Enabled</Badge>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-white">Security Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-gray-400 text-sm">Require 2FA for all admin accounts</p>
            </div>
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              Recommended
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Session Timeout</p>
              <p className="text-gray-400 text-sm">Auto logout after 30 minutes of inactivity</p>
            </div>
            <Badge className="bg-green-500">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Activity Logging</p>
              <p className="text-gray-400 text-sm">Track all admin actions for audit purposes</p>
            </div>
            <Badge className="bg-green-500">Active</Badge>
          </div>
        </div>
      </div>

      {/* App Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">App Configuration</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">App Version</p>
            <p className="text-white font-medium">1.0.0</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Database</p>
            <p className="text-white font-medium">Supabase PostgreSQL</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Environment</p>
            <Badge className="bg-green-500">Production</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
