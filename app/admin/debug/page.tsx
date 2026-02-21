import { createClient } from '@/utils/supabase/server'
import { requireSuperAdmin } from '@/lib/permissions'

export default async function DebugPage() {
  // Only super admins can access this page
  await requireSuperAdmin()
  
  const supabase = await createClient()

  // Check profiles table
  const { data: profiles, error: profilesError, count: profilesCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .limit(5)

  // Check alerts table
  const { data: alerts, error: alertsError, count: alertsCount } = await supabase
    .from('alerts')
    .select('*', { count: 'exact' })
    .limit(5)

  // Check auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  // Check admin users
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('*')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Debug Information</h1>

      {/* Profiles */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Profiles Table</h2>
        {profilesError ? (
          <div className="text-red-500">
            <p className="font-semibold">Error:</p>
            <pre className="text-sm mt-2">{JSON.stringify(profilesError, null, 2)}</pre>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">Total count: {profilesCount}</p>
            <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(profiles, null, 2)}
            </pre>
          </>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Alerts Table</h2>
        {alertsError ? (
          <div className="text-red-500">
            <p className="font-semibold">Error:</p>
            <pre className="text-sm mt-2">{JSON.stringify(alertsError, null, 2)}</pre>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">Total count: {alertsCount}</p>
            <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded overflow-auto">
              {JSON.stringify(alerts, null, 2)}
            </pre>
          </>
        )}
      </div>

      {/* Auth Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Auth Users</h2>
        {authError ? (
          <div className="text-red-500">
            <p className="font-semibold">Error:</p>
            <pre className="text-sm mt-2">{JSON.stringify(authError, null, 2)}</pre>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">Total: {authUsers?.users?.length || 0}</p>
            <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(authUsers?.users?.slice(0, 5), null, 2)}
            </pre>
          </>
        )}
      </div>

      {/* Admin Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Admin Users</h2>
        {adminError ? (
          <div className="text-red-500">
            <p className="font-semibold">Error:</p>
            <pre className="text-sm mt-2">{JSON.stringify(adminError, null, 2)}</pre>
          </div>
        ) : (
          <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(adminUsers, null, 2)}
          </pre>
        )}
      </div>

      {/* Environment Check */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Environment Variables</h2>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
          </p>
          <p className="text-gray-400">
            SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}
          </p>
          <p className="text-gray-400">
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
          </p>
        </div>
      </div>
    </div>
  )
}
