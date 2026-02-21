import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is an admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  if (!adminData) {
    redirect('/auth/login')
  }

  // Update last login timestamp
  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', adminData.id)

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
