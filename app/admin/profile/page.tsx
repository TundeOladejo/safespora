import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar, Clock, Key, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ChangePasswordButton } from '@/components/admin/ChangePasswordButton'

async function getAdminProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!adminUser) {
    redirect('/auth/login')
  }

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .eq('admin_id', adminUser.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get invitation info if invited
  const { data: invitation } = await supabase
    .from('admin_invitations')
    .select(`
      *,
      inviter:invited_by (
        email
      )
    `)
    .eq('email', adminUser.email)
    .eq('status', 'accepted')
    .single()

  return {
    adminUser,
    authUser: user,
    recentActivity: recentActivity || [],
    invitation
  }
}

export default async function AdminProfilePage() {
  const { adminUser, authUser, recentActivity, invitation } = await getAdminProfile()

  const permissions = adminUser.permissions || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage your admin account settings</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-600 rounded-full flex items-center justify-center shrink-0">
              <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
                {authUser.user_metadata?.full_name || 'Admin User'}
              </h2>
              <p className="text-gray-400 text-sm lg:text-base break-all">{adminUser.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={adminUser.role === 'super_admin' ? 'destructive' : 'secondary'}>
                  {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
                {adminUser.is_active ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <ChangePasswordButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </div>
            <p className="text-white">{adminUser.email}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Role</span>
            </div>
            <p className="text-white capitalize">{adminUser.role.replace('_', ' ')}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined</span>
            </div>
            <p className="text-white">
              {new Date(adminUser.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Last Login</span>
            </div>
            <p className="text-white">
              {adminUser.last_login_at
                ? new Date(adminUser.last_login_at).toLocaleString()
                : 'Never'}
            </p>
          </div>
        </div>

        {invitation && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Invited by <span className="text-white">{invitation.inviter?.email}</span> on{' '}
              {new Date(invitation.invited_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Permissions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Permissions</h2>
        </div>

        {adminUser.role === 'super_admin' ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-500 font-medium">
              You have full access to all features as a Super Admin
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-white font-medium capitalize">
                    {activity.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {activity.target_type && (
                      <span className="capitalize">{activity.target_type}: </span>
                    )}
                    {activity.target_id}
                  </p>
                </div>
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
