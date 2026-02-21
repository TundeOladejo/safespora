import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import Link from 'next/link'
import { Users, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StaffFilters } from '@/components/admin/StaffFilters'

async function checkStaffPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.STAFF.VIEW)
  
  return {
    adminUser,
    canEdit: hasPermission(adminUser, PERMISSIONS.STAFF.EDIT),
    canDelete: hasPermission(adminUser, PERMISSIONS.STAFF.DELETE)
  }
}

async function getStaffRecords(filters?: {
  search?: string
  verification_status?: string
  employment_type?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('staff_records')
    .select(`
      id,
      full_name,
      phone_number,
      email,
      employment_type,
      verification_status,
      background_check_status,
      trust_score,
      total_reviews,
      average_rating,
      total_reports,
      active_reports,
      created_at,
      verified_at
    `)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
    )
  }

  if (filters?.verification_status && filters.verification_status !== 'all') {
    query = query.eq('verification_status', filters.verification_status)
  }

  if (filters?.employment_type && filters.employment_type !== 'all') {
    query = query.eq('employment_type', filters.employment_type)
  }

  const { data: staff, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return staff || []
}

async function getStaffStats() {
  const supabase = await createClient()

  const { count: totalStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })

  const { count: verifiedStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'verified')

  const { count: pendingStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  const { count: flaggedStaff } = await supabase
    .from('staff_records')
    .select('*', { count: 'exact', head: true })
    .or('verification_status.eq.flagged,verification_status.eq.rejected')

  return {
    total: totalStaff || 0,
    verified: verifiedStaff || 0,
    pending: pendingStaff || 0,
    flagged: flaggedStaff || 0,
  }
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    verification_status?: string
    employment_type?: string
  }>
}) {
  const { adminUser, canEdit, canDelete } = await checkStaffPermissions()
  const resolvedSearchParams = await searchParams
  const staff = await getStaffRecords(resolvedSearchParams)
  const stats = await getStaffStats()

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Staff Management</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage and verify staff records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Staff</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verified</p>
              <p className="text-white text-2xl font-bold">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Flagged</p>
              <p className="text-white text-2xl font-bold">{stats.flagged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <StaffFilters />

      {/* Staff Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Employment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No staff records found
                  </td>
                </tr>
              ) : (
                staff.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{member.full_name}</p>
                        <p className="text-gray-400 text-sm">{member.email || member.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm capitalize">
                        {member.employment_type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getVerificationBadge(member.verification_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getTrustScoreColor(member.trust_score)}`}>
                          {member.trust_score}
                        </span>
                        <span className="text-gray-400 text-sm">/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-300">{member.total_reviews}</span>
                        {member.total_reviews > 0 && (
                          <span className="text-gray-400 ml-1">
                            ({member.average_rating.toFixed(1)}★)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className={member.active_reports > 0 ? 'text-red-500' : 'text-gray-300'}>
                          {member.active_reports}
                        </span>
                        <span className="text-gray-400"> / {member.total_reports}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/staff/${member.id}`}
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
