import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import Link from 'next/link'
import { UserX, UserCheck, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UserFilters } from '@/components/admin/UserFilters'

async function checkUserPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.USERS.VIEW)
  
  return {
    adminUser,
    canEdit: hasPermission(adminUser, PERMISSIONS.USERS.EDIT),
    canDelete: hasPermission(adminUser, PERMISSIONS.USERS.DELETE)
  }
}

async function getUsers(searchQuery?: string) {
  const supabase = await createClient()

  // Get all auth users using admin API
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching users:', authError)
    return []
  }

  let users = authData.users || []

  // Get list of admin emails to exclude them
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('email')

  const adminEmails = new Set(adminUsers?.map(admin => admin.email) || [])

  // Filter out admin users
  users = users.filter(user => !adminEmails.has(user.email || ''))

  // Get profile data and counts for each user
  const usersWithData = await Promise.all(
    users.slice(0, 100).map(async (user) => {
      // Get profile data - don't use .single() as it throws error if not found
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1)

      const profile = profiles?.[0] || null

      // Get reports count
      const { count: reportsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get confirmations count
      const { count: confirmationsCount } = await supabase
        .from('alert_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || null,
        phone_number: profile?.phone_number || user.phone || null,
        city: profile?.city || null,
        state: profile?.state || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_suspended: profile?.is_suspended || false,
        suspension_reason: profile?.suspension_reason || null,
        total_reports: reportsCount || 0,
        total_confirmations: confirmationsCount || 0,
      }
    })
  )

  // Filter by search query after getting profile data
  let filteredUsers = usersWithData
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredUsers = usersWithData.filter(user => 
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.phone_number?.toLowerCase().includes(query) ||
      user.city?.toLowerCase().includes(query) ||
      user.state?.toLowerCase().includes(query)
    )
  }

  return filteredUsers.slice(0, 50)
}

async function getUserStats() {
  const supabase = await createClient()

  // Get total users from auth
  const { data: authData } = await supabase.auth.admin.listUsers()
  
  // Get admin emails to exclude
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('email')

  const adminEmails = new Set(adminUsers?.map(admin => admin.email) || [])
  
  // Filter out admins
  const regularUsers = authData?.users?.filter(user => !adminEmails.has(user.email || '')) || []
  const totalUsers = regularUsers.length

  // Get suspended users count
  const { count: suspendedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_suspended', true)

  // Get active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activeUsers = regularUsers.filter(user => {
    if (!user.last_sign_in_at) return false
    return new Date(user.last_sign_in_at) >= thirtyDaysAgo
  }).length

  return {
    total: totalUsers,
    active: activeUsers,
    suspended: suspendedUsers || 0,
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { adminUser, canEdit, canDelete } = await checkUserPermissions()
  const resolvedSearchParams = await searchParams
  const users = await getUsers(resolvedSearchParams.search)
  const stats = await getUserStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage and monitor user accounts (excludes admins)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active (30d)</p>
              <p className="text-white text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Suspended</p>
              <p className="text-white text-2xl font-bold">{stats.suspended}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <UserFilters />

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Mobile Cards View */}
        <div className="block lg:hidden">
          <div className="p-4 space-y-4">
            {users.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {user.full_name || 'No name'}
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    {user.is_suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-gray-300">{user.phone_number || 'No phone'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Location</p>
                      <p className="text-gray-300">
                        {user.city && user.state 
                          ? `${user.city}, ${user.state}` 
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Activity</p>
                      <p className="text-gray-300">
                        {user.total_reports} reports, {user.total_confirmations} confirms
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Joined</p>
                      <p className="text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {user.full_name || 'No name'}
                        </p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {user.phone_number || 'No phone'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {user.city && user.state 
                          ? `${user.city}, ${user.state}` 
                          : 'Not set'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                          {user.total_reports} reports
                        </span>
                        <span className="text-gray-400">
                          {user.total_confirmations} confirms
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Details →
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
