import { createClient } from '@/utils/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import {
  Users,
  AlertTriangle,
  UserCheck,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react'

async function getDashboardStats() {
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

  // Get active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const activeUsers = regularUsers.filter(user => {
    if (!user.last_sign_in_at) return false
    return new Date(user.last_sign_in_at) >= thirtyDaysAgo
  }).length

  // Get total incidents
  const { count: totalIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })

  // Get pending incidents (active status)
  const { count: pendingIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get critical incidents
  const { count: criticalIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('severity', 'critical')
    .eq('status', 'active')

  // Get total staff
  const { count: totalStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })

  // Get pending verifications
  const { count: pendingVerifications } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  // Get verified staff
  const { count: verifiedStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'verified')

  return {
    totalUsers,
    activeUsers,
    totalIncidents: totalIncidents || 0,
    pendingIncidents: pendingIncidents || 0,
    criticalIncidents: criticalIncidents || 0,
    totalStaff: totalStaff || 0,
    pendingVerifications: pendingVerifications || 0,
    verifiedStaff: verifiedStaff || 0,
  }
}

async function getRecentIncidents() {
  const supabase = await createClient()

  const { data: incidents } = await supabase
    .from('alerts')
    .select(`
      id,
      title,
      severity,
      location,
      created_at,
      status
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return incidents || []
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const recentIncidents = await getRecentIncidents()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-400">Overview of SafeSpora platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={`${stats.activeUsers} active`}
          changeType="positive"
          icon={Users}
          iconColor="text-blue-500"
        />

        <StatsCard
          title="Total Incidents"
          value={stats.totalIncidents.toLocaleString()}
          change={`${stats.pendingIncidents} pending`}
          changeType="neutral"
          icon={AlertTriangle}
          iconColor="text-orange-500"
        />

        <StatsCard
          title="Critical Alerts"
          value={stats.criticalIncidents.toLocaleString()}
          changeType="negative"
          icon={Shield}
          iconColor="text-red-500"
        />

        <StatsCard
          title="Staff Records"
          value={stats.totalStaff.toLocaleString()}
          change={`${stats.pendingVerifications} pending`}
          changeType="neutral"
          icon={UserCheck}
          iconColor="text-green-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-white">Recent Incidents</h2>
            <a
              href="/admin/incidents"
              className="text-sm text-red-500 hover:text-red-400"
            >
              View all →
            </a>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent incidents</p>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      incident.severity === 'critical'
                        ? 'bg-red-500'
                        : incident.severity === 'high'
                        ? 'bg-orange-500'
                        : incident.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {incident.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {incident.location || 'Unknown location'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(incident.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      incident.status === 'active'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Quick Stats</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Active Users (30d)</span>
              <span className="text-white font-semibold">
                {stats.activeUsers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pending Incidents</span>
              <span className="text-white font-semibold">
                {stats.pendingIncidents}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Verified Staff</span>
              <span className="text-white font-semibold">
                {stats.verifiedStaff}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pending Verifications</span>
              <span className="text-white font-semibold">
                {stats.pendingVerifications}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
