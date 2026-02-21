import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SuspendUserButton from '@/components/admin/SuspendUserButton'
import UnsuspendUserButton from '@/components/admin/UnsuspendUserButton'

async function getUserDetails(userId: string) {
  const supabase = await createClient()

  // Get user from auth
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError || !authUser.user) {
    console.error('Error fetching auth user:', authError)
    return null
  }

  const user = authUser.user

  // Get profile data
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .limit(1)

  const profile = profiles?.[0] || null

  // Get user's reports
  const { data: reports } = await supabase
    .from('alerts')
    .select(`
      id,
      title,
      category,
      severity,
      location,
      status,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get user's confirmations
  const { data: confirmations } = await supabase
    .from('alert_confirmations')
    .select(`
      id,
      created_at,
      alert:alerts(
        id,
        title,
        location
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    phone: profile?.phone || user.phone || null,
    city: profile?.city || null,
    state: profile?.state || null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    is_suspended: profile?.is_suspended || false,
    suspension_reason: profile?.suspension_reason || null,
    suspended_at: profile?.suspended_at || null,
    reports: reports || [],
    confirmations: confirmations || [],
  }
}

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Check permissions first
  const adminUser = await requirePermission(PERMISSIONS.USERS.VIEW)
  const canEdit = hasPermission(adminUser, PERMISSIONS.USERS.EDIT)
  
  const { id } = await params
  const user = await getUserDetails(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">User Details</h1>
          <p className="text-gray-400">View and manage user account</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {user.is_suspended ? (
              <UnsuspendUserButton userId={user.id} />
            ) : (
              <SuspendUserButton userId={user.id} userName={user.full_name || user.email} />
            )}
          </div>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {user.full_name || 'No name provided'}
            </h2>
            <div className="flex items-center gap-2">
              {user.is_suspended ? (
                <Badge variant="destructive">Suspended</Badge>
              ) : (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {user.is_suspended && user.suspension_reason && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm font-medium mb-1">Suspension Reason:</p>
            <p className="text-red-300 text-sm">{user.suspension_reason}</p>
            {user.suspended_at && (
              <p className="text-red-400 text-xs mt-2">
                Suspended on: {new Date(user.suspended_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{user.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white">
                  {user.city && user.state
                    ? `${user.city}, ${user.state}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Joined</p>
                <p className="text-white">
                  {new Date(user.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Last Sign In</p>
                <p className="text-white">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Activity</p>
                <p className="text-white">
                  {user.reports.length} reports, {user.confirmations.length} confirmations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Reports</h3>
        {user.reports.length === 0 ? (
          <p className="text-gray-400 text-sm">No reports yet</p>
        ) : (
          <div className="space-y-3">
            {user.reports.map((report: any) => (
              <Link
                key={report.id}
                href={`/admin/incidents/${report.id}`}
                className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{report.title}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">{report.location || 'Unknown location'}</span>
                      <Badge
                        variant={
                          report.severity === 'critical'
                            ? 'destructive'
                            : report.severity === 'high'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {report.severity}
                      </Badge>
                      <Badge variant="outline">{report.status}</Badge>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Confirmations */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Confirmations</h3>
        {user.confirmations.length === 0 ? (
          <p className="text-gray-400 text-sm">No confirmations yet</p>
        ) : (
          <div className="space-y-3">
            {user.confirmations.map((confirmation: any) => (
              <div
                key={confirmation.id}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Confirmed: {confirmation.alert?.title || 'Unknown alert'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {confirmation.alert?.location || 'Unknown location'}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(confirmation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
