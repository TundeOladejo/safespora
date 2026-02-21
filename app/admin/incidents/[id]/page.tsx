import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ResolveIncidentButton from '@/components/admin/ResolveIncidentButton'
import FalseReportButton from '@/components/admin/FalseReportButton'
import DeleteIncidentButton from '@/components/admin/DeleteIncidentButton'
import AddAdminNoteButton from '@/components/admin/AddAdminNoteButton'

async function getIncidentDetails(incidentId: string) {
  const supabase = await createClient()

  const { data: incident, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', incidentId)
    .single()

  if (error || !incident) {
    console.error('Error fetching incident:', error)
    return null
  }

  // Get reporter info from auth
  let reporter = null
  if (incident.user_id) {
    const { data: authUser } = await supabase.auth.admin.getUserById(incident.user_id)
    if (authUser?.user) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', incident.user_id)
        .limit(1)
      
      const profile = profiles?.[0]
      reporter = {
        id: authUser.user.id,
        full_name: profile?.full_name || authUser.user.user_metadata?.full_name || null,
        email: authUser.user.email || null,
      }
    }
  }

  // Get resolver info if resolved
  let resolver = null
  if (incident.resolved_by) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('full_name')
      .eq('id', incident.resolved_by)
      .single()
    
    resolver = adminUser
  }

  // Get confirmations
  const { data: confirmations } = await supabase
    .from('alert_confirmations')
    .select('id, created_at, user_id')
    .eq('alert_id', incidentId)
    .order('created_at', { ascending: false })

  // Get user info for each confirmation
  const confirmationsWithUsers = await Promise.all(
    (confirmations || []).map(async (confirmation) => {
      let user = null
      if (confirmation.user_id) {
        const { data: authUser } = await supabase.auth.admin.getUserById(confirmation.user_id)
        if (authUser?.user) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', confirmation.user_id)
            .limit(1)
          
          user = {
            full_name: profiles?.[0]?.full_name || authUser.user.user_metadata?.full_name || null,
            email: authUser.user.email || null,
          }
        }
      }
      
      return {
        ...confirmation,
        user,
      }
    })
  )

  return {
    ...incident,
    reporter,
    resolver,
    confirmations: confirmationsWithUsers,
  }
}

export default async function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const incident = await getIncidentDetails(id)

  if (!incident) {
    notFound()
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-500">Resolved</Badge>
      case 'false_report':
        return <Badge variant="secondary">False Report</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/incidents">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">Incident Details</h1>
          <p className="text-gray-400">View and manage incident</p>
        </div>
        {incident.status === 'active' && (
          <div className="flex gap-2">
            <ResolveIncidentButton incidentId={incident.id} />
            <FalseReportButton incidentId={incident.id} />
          </div>
        )}
        <DeleteIncidentButton incidentId={incident.id} />
      </div>

      {/* Main Info Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-3">{incident.title}</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)}`} />
                <span className="text-gray-300 capitalize">{incident.severity} Severity</span>
              </div>
              {getStatusBadge(incident.status)}
              {incident.is_verified && (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-300 leading-relaxed">{incident.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white">{incident.location || 'Unknown location'}</p>
                {incident.lat && incident.lng && (
                  <p className="text-gray-500 text-xs mt-1">
                    {parseFloat(incident.lat).toFixed(6)}, {parseFloat(incident.lng).toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Category</p>
                <p className="text-white capitalize">{incident.category || 'Uncategorized'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Reported</p>
                <p className="text-white">
                  {new Date(incident.created_at).toLocaleString('en-US', {
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
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Reporter</p>
                <Link
                  href={`/admin/users/${incident.reporter?.id}`}
                  className="text-red-500 hover:text-red-400"
                >
                  {incident.reporter?.full_name || incident.reporter?.email || 'Unknown'}
                </Link>
              </div>
            </div>

            {incident.status === 'resolved' && incident.resolved_at && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-gray-400 text-sm">Resolved</p>
                  <p className="text-white">
                    {new Date(incident.resolved_at).toLocaleDateString()}
                  </p>
                  {incident.resolver && (
                    <p className="text-gray-500 text-xs mt-1">
                      by {incident.resolver.full_name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map View */}
      {incident.lat && incident.lng && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Location on Map</h3>
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, borderRadius: '0.5rem' }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(incident.lng) - 0.01},${parseFloat(incident.lat) - 0.01},${parseFloat(incident.lng) + 0.01},${parseFloat(incident.lat) + 0.01}&layer=mapnik&marker=${incident.lat},${incident.lng}`}
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Confirmations */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Confirmations ({incident.confirmations.length})
        </h3>
        {incident.confirmations.length === 0 ? (
          <p className="text-gray-400 text-sm">No confirmations yet</p>
        ) : (
          <div className="space-y-3">
            {incident.confirmations.map((confirmation: any) => (
              <div
                key={confirmation.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {confirmation.user?.full_name || confirmation.user?.email || 'Anonymous'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(confirmation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Notes */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Admin Notes</h3>
          <AddAdminNoteButton incidentId={incident.id} currentNote={incident.admin_notes} />
        </div>
        {incident.admin_notes ? (
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-300 whitespace-pre-wrap">{incident.admin_notes}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No admin notes yet</p>
        )}
      </div>
    </div>
  )
}
