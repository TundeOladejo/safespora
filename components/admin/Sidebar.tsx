'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  FileText,
  User,
  UserCog,
  ListChecks,
  X
} from 'lucide-react'
import Image from 'next/image'

interface AdminUser {
  role: string
  permissions: Record<string, Record<string, boolean>>
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard,
    permission: null // Always visible
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    permission: { module: 'users', action: 'view' }
  },
  { 
    name: 'Incidents', 
    href: '/admin/incidents', 
    icon: AlertTriangle,
    permission: { module: 'incidents', action: 'view' }
  },
  { 
    name: 'Staff Directory', 
    href: '/admin/staff', 
    icon: UserCheck,
    permission: { module: 'staff', action: 'view' }
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3,
    permission: { module: 'analytics', action: 'view' }
  },
  { 
    name: 'Moderation', 
    href: '/admin/moderation', 
    icon: Shield,
    permission: { module: 'moderation', action: 'view' }
  },
  { 
    name: 'Waitlist', 
    href: '/admin/waitlist', 
    icon: ListChecks,
    permission: { module: 'settings', action: 'view' } // Waitlist is part of settings
  },
  { 
    name: 'Admins', 
    href: '/admin/admins', 
    icon: UserCog,
    permission: { module: 'admins', action: 'view' }
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    permission: { module: 'settings', action: 'view' }
  },
  { 
    name: 'Profile', 
    href: '/admin/profile', 
    icon: User,
    permission: null // Always visible
  },
  { 
    name: 'Debug', 
    href: '/admin/debug', 
    icon: FileText,
    permission: 'super_admin_only' // Special case for super admin only
  },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: admin } = await supabase
            .from('admin_users')
            .select('role, permissions')
            .eq('email', user.email)
            .single()
          
          if (admin) {
            setAdminUser(admin)
          }
        }
      } catch (error) {
        console.error('Error loading admin user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAdminUser()
  }, [supabase])

  const hasPermission = (permission: any): boolean => {
    if (!adminUser) return false
    
    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true
    
    // Special case for super admin only items
    if (permission === 'super_admin_only') return false
    
    // No permission required (always visible)
    if (!permission) return true
    
    // Check specific permission
    return adminUser.permissions?.[permission.module]?.[permission.action] === true
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="animate-pulse bg-gray-700 h-8 w-24 rounded"></div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-700 h-10 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <Image
          src="/safespora-white.png"
          alt="SafeSpora"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation
          .filter(item => hasPermission(item.permission))
          .map((item) => {
            const isActive = pathname?.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close sidebar on mobile when clicking a link
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}
