import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/admin/ResetPasswordForm'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not logged in, redirect to login
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is an admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!adminUser) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-gray-400">
              {adminUser.password_reset_required
                ? 'You must change your password before continuing'
                : 'Create a new password for your account'}
            </p>
          </div>

          <ResetPasswordForm 
            email={user.email!}
            required={adminUser.password_reset_required}
          />
        </div>
      </div>
    </div>
  )
}
