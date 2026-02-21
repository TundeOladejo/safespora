import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Star, Flag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VerifyStaffButton } from '@/components/admin/VerifyStaffButton'
import { RejectStaffButton } from '@/components/admin/RejectStaffButton'
import { FlagStaffButton } from '@/components/admin/FlagStaffButton'

async function getStaffDetails(id: string) {
  const supabase = await createClient()

  const { data: staff, error } = await supabase
    .from('staff_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !staff) {
    return null
  }

  // Get documents
  const { data: documents } = await supabase
    .from('staff_documents')
    .select('*')
    .eq('staff_id', id)
    .order('uploaded_at', { ascending: false })

  // Get reviews
  const { data: reviews } = await supabase
    .from('staff_reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id (full_name)
    `)
    .eq('staff_id', id)
    .order('created_at', { ascending: false })

  // Get reports
  const { data: reports } = await supabase
    .from('staff_reports')
    .select(`
      *,
      reporter:profiles!reporter_id (full_name)
    `)
    .eq('staff_id', id)
    .order('created_at', { ascending: false })

  return {
    ...staff,
    documents: documents || [],
    reviews: reviews || [],
    reports: reports || [],
  }
}

export default async function StaffDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const staff = await getStaffDetails(id)

  if (!staff) {
    notFound()
  }

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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/staff"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{staff.full_name}</h1>
          <p className="text-gray-400 capitalize">{staff.employment_type?.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex gap-2">
          {staff.verification_status === 'pending' && (
            <>
              <VerifyStaffButton staffId={staff.id} />
              <RejectStaffButton staffId={staff.id} />
            </>
          )}
          {staff.verification_status !== 'flagged' && (
            <FlagStaffButton staffId={staff.id} />
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verification</p>
              {getVerificationBadge(staff.verification_status)}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Trust Score</p>
              <p className={`text-2xl font-bold ${getTrustScoreColor(staff.trust_score)}`}>
                {staff.trust_score}/100
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reviews</p>
              <p className="text-white text-2xl font-bold">
                {staff.total_reviews}
                {staff.total_reviews > 0 && (
                  <span className="text-sm text-gray-400 ml-1">
                    ({staff.average_rating.toFixed(1)}★)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Flag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reports</p>
              <p className={`text-2xl font-bold ${staff.active_reports > 0 ? 'text-red-500' : 'text-white'}`}>
                {staff.active_reports} / {staff.total_reports}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Full Name</p>
            <p className="text-white">{staff.full_name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Phone Number</p>
            <p className="text-white">{staff.phone_number || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white">{staff.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">National ID</p>
            <p className="text-white">{staff.national_id || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Date of Birth</p>
            <p className="text-white">
              {staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Address</p>
            <p className="text-white">{staff.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Employment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Employment Type</p>
            <p className="text-white capitalize">{staff.employment_type?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Experience</p>
            <p className="text-white">{staff.experience_years || 0} years</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-400 text-sm mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {staff.skills && staff.skills.length > 0 ? (
                staff.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Check */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Background Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <Badge variant={staff.background_check_status === 'clear' ? 'outline' : 'secondary'}>
              {staff.background_check_status || 'Not started'}
            </Badge>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Check Date</p>
            <p className="text-white">
              {staff.background_check_date 
                ? new Date(staff.background_check_date).toLocaleDateString()
                : 'Not performed'}
            </p>
          </div>
          {staff.background_check_notes && (
            <div className="md:col-span-2">
              <p className="text-gray-400 text-sm mb-2">Notes</p>
              <p className="text-white">{staff.background_check_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents ({staff.documents.length})
        </h2>
        {staff.documents.length === 0 ? (
          <p className="text-gray-400">No documents uploaded</p>
        ) : (
          <div className="space-y-3">
            {staff.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium capitalize">
                    {doc.document_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {doc.verification_status === 'verified' ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : doc.verification_status === 'rejected' ? (
                    <Badge variant="destructive">Rejected</Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
                  )}
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Reviews ({staff.reviews.length})
        </h2>
        {staff.reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {staff.reviews.map((review: any) => (
              <div key={review.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{review.reviewer?.full_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {review.would_recommend && (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Recommended
                    </Badge>
                  )}
                </div>
                {review.review_text && (
                  <p className="text-gray-300 mt-2">{review.review_text}</p>
                )}
                {review.employment_duration && (
                  <p className="text-gray-400 text-sm mt-2">
                    Employment duration: {review.employment_duration}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports */}
      {staff.reports.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Reports ({staff.reports.length})
          </h2>
          <div className="space-y-4">
            {staff.reports.map((report: any) => (
              <div key={report.id} className="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{report.title}</p>
                    <p className="text-gray-400 text-sm">
                      Reported by {report.reporter?.full_name || 'Anonymous'} on{' '}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={report.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {report.severity}
                    </Badge>
                    <Badge variant="outline">{report.status}</Badge>
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{report.description}</p>
                {report.resolution && (
                  <div className="mt-3 p-3 bg-gray-900 rounded">
                    <p className="text-gray-400 text-sm mb-1">Resolution:</p>
                    <p className="text-gray-300">{report.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
