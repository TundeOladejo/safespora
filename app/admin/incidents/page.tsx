import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { IncidentFilters } from '@/components/admin/IncidentFilters'

async function checkIncidentPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.INCIDENTS.VIEW)
  
  return {
    adminUser,
    canEdit: hasPermission(adminUser, PERMISSIONS.INCIDENTS.EDIT),
    canDelete: hasPermission(adminUser, PERMISSIONS.INCIDENTS.DELETE)
  }
}

async function getIncidents(filters?: {
  search?: string
  status?: string
  severity?: string
  category?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('alerts')
    .select(`
      id,
      description,
      category,
      severity,
      lat,
      lng,
      location,
      status,
      created_at,
      user_id,
      is_verified
    `)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
    )
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  const { data: incidents, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching incidents:', error)
    return []
  }

  // Get confirmation counts and user info for each incident
  const incidentsWithCounts = await Promise.all(
    (incidents || []).map(async (incident) => {
      const { count } = await supabase
        .from('alert_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('alert_id', incident.id)

      // Get user info from auth if available
      let userName = 'Unknown'
      if (incident.user_id) {
        const { data: authUser } = await supabase.auth.admin.getUserById(incident.user_id)
        if (authUser?.user) {
          // Try to get profile name first
          const { data: profiles } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', incident.user_id)
            .limit(1)
          
          userName = profiles?.[0]?.full_name || 
                     authUser.user.user_metadata?.full_name || 
                     authUser.user.email || 
                     'Unknown'
        }
      }

      return {
        ...incident,
        confirmed_count: count || 0,
        reporter_name: userName,
      }
    })
  )

  return incidentsWithCounts
}

async function getIncidentStats() {
  const supabase = await createClient()

  const { count: totalIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })

  const { count: activeIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: resolvedIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')

  const { count: criticalIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('severity', 'critical')
    .eq('status', 'active')

  return {
    total: totalIncidents || 0,
    active: activeIncidents || 0,
    resolved: resolvedIncidents || 0,
    critical: criticalIncidents || 0,
  }
}

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    severity?: string
    category?: string
  }>
}) {
  const { adminUser, canEdit, canDelete } = await checkIncidentPermissions()
  const resolvedSearchParams = await searchParams
  const incidents = await getIncidents(resolvedSearchParams)
  const stats = await getIncidentStats()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Incident Management</h1>
          <p className="text-sm lg:text-base text-gray-400">Monitor and manage security incidents</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-white text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-white text-2xl font-bold">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-white text-2xl font-bold">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <IncidentFilters />

      {/* Incidents List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Incident
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Confirmations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reported
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No incidents found
                  </td>
                </tr>
              ) : (
                incidents.map((incident: any) => (
                  <tr key={incident.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                          {incident.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {incident.location || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                        <span className="text-gray-300 text-sm capitalize">
                          {incident.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          incident.status === 'active'
                            ? 'destructive'
                            : incident.status === 'resolved'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {incident.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {incident.confirmed_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/incidents/${incident.id}`}
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
