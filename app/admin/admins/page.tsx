import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, UserPlus, Search, Mail, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { InviteAdminButton } from '@/components/admin/InviteAdminButton'

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

  // Check if user has permission to view admins
  const hasPermission = adminUser.role === 'super_admin' || 
    adminUser.permissions?.admins?.view === true

  if (!hasPermission) {
    redirect('/admin/dashboard')
  }

  return {
    adminUser,
    canInvite: adminUser.role === 'super_admin' || adminUser.permissions?.admins?.invite === true
  }
}

async function getAdmins(searchQuery?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.ilike('email', `%${searchQuery}%`)
  }

  const { data: admins, error } = await query

  if (error) {
    console.error('Error fetching admins:', error)
    return []
  }

  return admins || []
}

async function getPendingInvitations() {
  const supabase = await createClient()

  const { data: invitations } = await supabase
    .from('admin_invitations')
    .select(`
      *,
      inviter:invited_by (
        email
      )
    `)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false })

  return invitations || []
}

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { adminUser, canInvite } = await checkAdminPermission()
  const resolvedSearchParams = await searchParams
  const admins = await getAdmins(resolvedSearchParams.search)
  const pendingInvitations = await getPendingInvitations()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Admin Management</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage admin users and permissions</p>
        </div>
        {canInvite && (
          <div className="w-full sm:w-auto">
            <InviteAdminButton />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Admins</p>
              <p className="text-white text-2xl font-bold">{admins.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Super Admins</p>
              <p className="text-white text-2xl font-bold">
                {admins.filter(a => a.role === 'super_admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-white text-2xl font-bold">
                {admins.filter(a => a.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Invites</p>
              <p className="text-white text-2xl font-bold">{pendingInvitations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <form action="/admin/admins" method="get">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              name="search"
              placeholder="Search by email..."
              defaultValue={resolvedSearchParams.search}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </form>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-white font-medium">{invitation.email}</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Invited by {invitation.inviter?.email} •{' '}
                    {new Date(invitation.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    {invitation.role}
                  </Badge>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{admin.email}</p>
                          {admin.id === adminUser.id && (
                            <p className="text-gray-500 text-xs">You</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={admin.role === 'super_admin' ? 'destructive' : 'secondary'}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {admin.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">
                        {admin.last_login_at
                          ? new Date(admin.last_login_at).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/admins/${admin.id}`}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
