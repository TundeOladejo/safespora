import { createClient } from '@/utils/supabase/server'
import { requirePermission, hasPermission, PERMISSIONS } from '@/lib/permissions'
import { Users, Mail, Calendar, MapPin, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { NotifyWaitlistButton } from '@/components/admin/NotifyWaitlistButton'

async function checkAdminPermission() {
  const adminUser = await requirePermission(PERMISSIONS.SETTINGS.VIEW)
  
  return {
    adminUser,
    canNotify: hasPermission(adminUser, PERMISSIONS.SETTINGS.EDIT)
  }
}

async function getWaitlistData(searchQuery?: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('waitlist')
    .select('*')
    .order('position', { ascending: true })

  if (searchQuery) {
    query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: waitlist, error } = await query

  if (error) {
    console.error('Error fetching waitlist:', error)
    return []
  }

  return waitlist || []
}

async function getWaitlistStats() {
  const supabase = await createClient()

  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('status, created_at')

  if (!waitlist) return { total: 0, pending: 0, invited: 0, registered: 0 }

  return {
    total: waitlist.length,
    pending: waitlist.filter(w => w.status === 'pending').length,
    invited: waitlist.filter(w => w.status === 'invited').length,
    registered: waitlist.filter(w => w.status === 'registered').length,
  }
}

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const { adminUser, canNotify } = await checkAdminPermission()
  const resolvedSearchParams = await searchParams
  const waitlist = await getWaitlistData(resolvedSearchParams.search, resolvedSearchParams.status)
  const stats = await getWaitlistStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Waitlist Management</h1>
          <p className="text-sm lg:text-base text-gray-400">Manage launch waitlist and notify users</p>
        </div>
        {canNotify && (
          <div className="w-full sm:w-auto">
            <NotifyWaitlistButton 
              pendingEmails={waitlist.filter(w => w.status === 'pending').map(w => w.email)}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Signups</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Invited</p>
              <p className="text-white text-2xl font-bold">{stats.invited}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Registered</p>
              <p className="text-white text-2xl font-bold">{stats.registered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <form action="/admin/waitlist" method="get" className="flex gap-4">
          <div className="flex-1">
            <Input
              name="search"
              placeholder="Search by email, name, state, or city..."
              defaultValue={resolvedSearchParams.search}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <select
            name="status"
            defaultValue={resolvedSearchParams.status || 'all'}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="invited">Invited</option>
            <option value="registered">Registered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </form>
      </div>

      {/* Waitlist Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Position
                </th>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {waitlist.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No waitlist entries found
                  </td>
                </tr>
              ) : (
                waitlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">#{entry.position}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{entry.full_name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{entry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{entry.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        {entry.state ? (
                          <>
                            <MapPin className="w-3 h-3" />
                            {entry.city ? `${entry.city}, ${entry.state}` : entry.state}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          entry.status === 'registered' ? 'default' :
                          entry.status === 'invited' ? 'secondary' :
                          entry.status === 'pending' ? 'outline' :
                          'destructive'
                        }
                        className={
                          entry.status === 'registered' ? 'bg-green-500' :
                          entry.status === 'invited' ? 'bg-purple-500' :
                          entry.status === 'pending' ? 'border-yellow-500 text-yellow-500' :
                          ''
                        }
                      >
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
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
