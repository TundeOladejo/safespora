// Admin Portal Types

export type AdminRole = 'admin' | 'moderator' | 'viewer'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: AdminRole
  created_at: string
  last_login: string | null
  is_active: boolean
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalIncidents: number
  pendingIncidents: number
  resolvedIncidents: number
  criticalIncidents: number
  totalStaff: number
  pendingVerifications: number
  verifiedStaff: number
}

export interface UserRecord {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  last_sign_in_at: string | null
  is_suspended: boolean
  suspension_reason: string | null
  total_reports: number
  total_confirmations: number
}

export interface IncidentRecord {
  id: string
  title: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  lat: string | null
  lng: string | null
  location: string | null
  status: 'active' | 'resolved' | 'false_report'
  created_at: string
  updated_at: string
  user_id: string
  confirmed_count: number
  is_verified: boolean
  admin_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
}

export interface StaffRecord {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  employment_type: string
  skills: string[]
  experience_years: number | null
  verification_status: 'pending' | 'verified' | 'rejected'
  background_check_status: 'pending' | 'in_progress' | 'clear' | 'flagged' | null
  trust_score: number
  total_reviews: number
  average_rating: number
  total_reports: number
  active_reports: number
  created_at: string
  created_by: string
}

export interface ActivityLog {
  id: string
  admin_id: string
  admin_name: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, any>
  ip_address: string | null
  created_at: string
}

export interface AnalyticsData {
  incidentsByDay: Array<{ date: string; count: number }>
  incidentsByCategory: Array<{ category: string; count: number }>
  incidentsBySeverity: Array<{ severity: string; count: number }>
  userGrowth: Array<{ date: string; count: number }>
  topLocations: Array<{ location: string; count: number }>
}

export interface ModerationItem {
  id: string
  type: 'incident' | 'staff_verification' | 'user_report'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  resource_id: string
}

export interface SystemSettings {
  key: string
  value: any
  updated_by: string | null
  updated_at: string
}
