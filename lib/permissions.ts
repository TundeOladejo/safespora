// lib/permissions.ts
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  permissions: Record<string, Record<string, boolean>>
  is_active: boolean
}

export interface PermissionCheck {
  module: string
  action: string
}

/**
 * Get current admin user with permissions
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  return adminUser
}

/**
 * Check if current admin has specific permission
 */
export function hasPermission(
  adminUser: AdminUser | null,
  permission: PermissionCheck
): boolean {
  if (!adminUser) return false
  
  // Super admin has all permissions
  if (adminUser.role === 'super_admin') return true
  
  // Check specific permission
  return adminUser.permissions?.[permission.module]?.[permission.action] === true
}

/**
 * Check if current admin is super admin
 */
export function isSuperAdmin(adminUser: AdminUser | null): boolean {
  return adminUser?.role === 'super_admin'
}

/**
 * Require admin authentication and return admin user
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getCurrentAdmin()
  
  if (!adminUser) {
    redirect('/auth/login')
  }
  
  return adminUser
}

/**
 * Require specific permission and return admin user
 */
export async function requirePermission(permission: PermissionCheck): Promise<AdminUser> {
  const adminUser = await requireAdmin()
  
  if (!hasPermission(adminUser, permission)) {
    redirect('/admin/dashboard')
  }
  
  return adminUser
}

/**
 * Require super admin access
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const adminUser = await requireAdmin()
  
  if (!isSuperAdmin(adminUser)) {
    redirect('/admin/dashboard')
  }
  
  return adminUser
}

/**
 * Permission definitions for each module
 */
export const PERMISSIONS = {
  USERS: {
    VIEW: { module: 'users', action: 'view' },
    EDIT: { module: 'users', action: 'edit' },
    DELETE: { module: 'users', action: 'delete' },
  },
  INCIDENTS: {
    VIEW: { module: 'incidents', action: 'view' },
    EDIT: { module: 'incidents', action: 'edit' },
    DELETE: { module: 'incidents', action: 'delete' },
  },
  STAFF: {
    VIEW: { module: 'staff', action: 'view' },
    EDIT: { module: 'staff', action: 'edit' },
    DELETE: { module: 'staff', action: 'delete' },
  },
  ANALYTICS: {
    VIEW: { module: 'analytics', action: 'view' },
  },
  MODERATION: {
    VIEW: { module: 'moderation', action: 'view' },
    EDIT: { module: 'moderation', action: 'edit' },
  },
  SETTINGS: {
    VIEW: { module: 'settings', action: 'view' },
    EDIT: { module: 'settings', action: 'edit' },
  },
  ADMINS: {
    VIEW: { module: 'admins', action: 'view' },
    EDIT: { module: 'admins', action: 'edit' },
    DELETE: { module: 'admins', action: 'delete' },
    INVITE: { module: 'admins', action: 'invite' },
  },
} as const