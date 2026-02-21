import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Shield, Mail, Calendar, Clock, Activity, Key, Ban, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EditAdminPermissions } from '@/components/admin/EditAdminPermissions'
import { DeactivateAdminButton } from '@/components/admin/DeactivateAdminButton'

async function checkAdminPermission() {
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

  // Check if user has permission to edit admins
  const canEdit = adminUser.role === 'super_admin' || 
    adminUser.permissions?.admins?.edit === true

  if (!canEdit) {
    redirect('/admin/admins')
  }

  return {
    currentAdmin: adminUser,
    canDelete: adminUser.role === 'super_admin' || adminUser.permissions?.admins?.delete === true
  }
}

async function getAdminDetails(id: string) {
  const supabase = await createClient()

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', id)
    .single()

  if (!admin) {
    return null
  }

  // Get invitation info if invited
  const { data: invitation } = await supabase
    .from('admin_invitations')
    .select(`
      *,
      inviter:invited_by (
        email
      )
    `)
    .eq('email', admin.email)
    .eq('status', 'accepted')
    .single()

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .eq('admin_id', admin.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    admin,
    invitation,
    recentActivity: recentActivity || []
  }
}

export default async function AdminDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { currentAdmin, canDelete } = await checkAdminPermission()
  const resolvedParams = await params
  const adminDetails = await getAdminDetails(resolvedParams.id)

  if (!adminDetails) {
    notFound()
  }

  const { admin, invitation, recentActivity } = adminDetails
  const permissions = admin.permissions || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Details</h1>
          <p className="text-gray-400">View and manage admin user</p>
        </div>
        {canDelete && admin.id !== currentAdmin.id && (
          <DeactivateAdminButton 
            adminId={admin.id} 
            adminEmail={admin.email}
            isActive={admin.is_active}
          />
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{admin.email}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={admin.role === 'super_admin' ? 'destructive' : 'secondary'}>
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
              {admin.is_active ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {admin.password_reset_required && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  Password Reset Required
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </div>
            <p className="text-white">{admin.email}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Role</span>
            </div>
            <p className="text-white capitalize">{admin.role.replace('_', ' ')}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined</span>
            </div>
            <p className="text-white">
              {new Date(admin.created_at).toLocaleDateString('en-US', {
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
              {admin.last_login_at
                ? new Date(admin.last_login_at).toLocaleString()
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Permissions</h2>
          </div>
        </div>

        {admin.role === 'super_admin' ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-500 font-medium">
              This admin has full access to all features as a Super Admin
            </p>
          </div>
        ) : (
          <EditAdminPermissions 
            adminId={admin.id}
            currentPermissions={permissions}
            canEdit={currentAdmin.role === 'super_admin'}
          />
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
                  {activity.target_type && (
                    <p className="text-gray-400 text-sm mt-1">
                      <span className="capitalize">{activity.target_type}: </span>
                      {activity.target_id}
                    </p>
                  )}
                  {activity.details && (
                    <p className="text-gray-500 text-xs mt-1">
                      {JSON.stringify(activity.details)}
                    </p>
                  )}
                </div>
                <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
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
