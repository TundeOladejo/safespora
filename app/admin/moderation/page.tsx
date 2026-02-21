import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import Link from 'next/link'
import { Clock, AlertTriangle, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function checkModerationPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.MODERATION.VIEW)
  
  return {
    adminUser,
    canEdit: hasPermission(adminUser, PERMISSIONS.MODERATION.EDIT)
  }
}

async function getPendingItems() {
  const supabase = await createClient()

  // Get pending incidents
  const { data: pendingIncidents } = await supabase
    .from('alerts')
    .select(`
      id,
      title,
      description,
      severity,
      location,
      created_at,
      user_id
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get pending staff verifications
  const { data: pendingStaff } = await supabase
    .from('staff_records')
    .select(`
      id,
      full_name,
      employment_type,
      created_at
    `)
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get flagged staff
  const { data: flaggedStaff } = await supabase
    .from('staff_records')
    .select(`
      id,
      full_name,
      employment_type,
      rejection_reason,
      updated_at
    `)
    .eq('verification_status', 'flagged')
    .order('updated_at', { ascending: false })
    .limit(10)

  // Get pending staff reports
  const { data: pendingReports } = await supabase
    .from('staff_reports')
    .select(`
      id,
      title,
      severity,
      status,
      created_at,
      staff_id
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    pendingIncidents: pendingIncidents || [],
    pendingStaff: pendingStaff || [],
    flaggedStaff: flaggedStaff || [],
    pendingReports: pendingReports || [],
  }
}

async function getModerationStats() {
  const supabase = await createClient()

  const { count: pendingIncidents } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  const { count: flaggedStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'flagged')

  const { count: pendingReports } = await supabase
    .from('staff_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return {
    pendingIncidents: pendingIncidents || 0,
    pendingStaff: pendingStaff || 0,
    flaggedStaff: flaggedStaff || 0,
    pendingReports: pendingReports || 0,
  }
}

export default async function ModerationPage() {
  // Check permissions first
  const { adminUser, canEdit } = await checkModerationPermissions()
  
  const items = await getPendingItems()
  const stats = await getModerationStats()

  const totalPending = stats.pendingIncidents + stats.pendingStaff + stats.flaggedStaff + stats.pendingReports

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Moderation Queue</h1>
          <p className="text-sm lg:text-base text-gray-400">Review and moderate pending items</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Pending</p>
              <p className="text-white text-2xl font-bold">{totalPending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Incidents</p>
              <p className="text-white text-2xl font-bold">{stats.pendingIncidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Staff</p>
              <p className="text-white text-2xl font-bold">{stats.pendingStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Flagged Items</p>
              <p className="text-white text-2xl font-bold">{stats.flaggedStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Incidents */}
      {items.pendingIncidents.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Active Incidents ({items.pendingIncidents.length})
            </h2>
            <Link
              href="/admin/incidents?status=active"
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {items.pendingIncidents.map((incident: any) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{incident.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{incident.location || 'Unknown location'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(incident.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {incident.severity}
                  </Badge>
                  <Link
                    href={`/admin/incidents/${incident.id}`}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Staff Verifications */}
      {items.pendingStaff.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-500" />
              Pending Staff Verifications ({items.pendingStaff.length})
            </h2>
            <Link
              href="/admin/staff?verification_status=pending"
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {items.pendingStaff.map((staff: any) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{staff.full_name}</p>
                  <p className="text-gray-400 text-sm mt-1 capitalize">
                    {staff.employment_type?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Registered {new Date(staff.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    Pending
                  </Badge>
                  <Link
                    href={`/admin/staff/${staff.id}`}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flagged Staff */}
      {items.flaggedStaff.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Flagged Staff ({items.flaggedStaff.length})
            </h2>
            <Link
              href="/admin/staff?verification_status=flagged"
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {items.flaggedStaff.map((staff: any) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border-l-4 border-red-500 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{staff.full_name}</p>
                  <p className="text-gray-400 text-sm mt-1 capitalize">
                    {staff.employment_type?.replace(/_/g, ' ')}
                  </p>
                  {staff.rejection_reason && (
                    <p className="text-gray-500 text-xs mt-1">
                      Reason: {staff.rejection_reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">Flagged</Badge>
                  <Link
                    href={`/admin/staff/${staff.id}`}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalPending === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">There are no pending items to review at the moment.</p>
        </div>
      )}
    </div>
  )
}
