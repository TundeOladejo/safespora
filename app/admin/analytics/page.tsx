import { createClient } from '@/utils/supabase/server'
import { requirePermission, PERMISSIONS } from '@/lib/permissions'
import { 
  TrendingUp, Users, AlertTriangle, UserCheck, MapPin, Calendar, 
  BarChart3, PieChart, Activity, Download, RefreshCw,
  ChevronDown, Filter, Maximize2, Minimize2
} from 'lucide-react'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'
import { ExportButton } from '@/components/admin/ExportButton'
import { Suspense } from 'react'

async function checkAnalyticsPermissions() {
  const adminUser = await requirePermission(PERMISSIONS.ANALYTICS.VIEW)
  return { adminUser }
}

// Add loading skeleton component
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-800 rounded-lg"></div>
    </div>
  )
}

// Enhanced data fetching with error handling
async function getAnalyticsData() {
  const supabase = await createClient()
  
  try {
    // Get user growth data (last 6 months)
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError
    const users = authData?.users || []

    // Get admin emails to exclude
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('email')
    const adminEmails = new Set(adminUsers?.map(admin => admin.email) || [])
    const regularUsers = users.filter(user => !adminEmails.has(user.email || ''))

    // Calculate user growth by month (last 6 months)
    const userGrowth = calculateMonthlyGrowth(regularUsers, 'created_at', true, 6)

    // Get incidents data with better filtering
    const { data: incidents } = await supabase
      .from('alerts')
      .select('created_at, severity, category, status, location')
      .order('created_at', { ascending: false })

    const incidentTrends = calculateMonthlyGrowth(incidents || [], 'created_at', true, 6)
    const incidentsBySeverity = groupBy(incidents || [], 'severity')
    const incidentsByCategory = groupBy(incidents || [], 'category')
    const incidentsByStatus = groupBy(incidents || [], 'status')

    // Get staff data with trust score distribution
    const { data: staff } = await supabase
      .from('staff_records')
      .select('created_at, verification_status, employment_type, trust_score, department')

    const staffGrowth = calculateMonthlyGrowth(staff || [], 'created_at', true, 6)
    const staffByVerification = groupBy(staff || [], 'verification_status')
    const staffByType = groupBy(staff || [], 'employment_type')
    const staffByDepartment = groupBy(staff || [], 'department')

    // Calculate average trust score and distribution
    const avgTrustScore = staff && staff.length > 0
      ? staff.reduce((sum, s) => sum + (s.trust_score || 0), 0) / staff.length
      : 0

    // Trust score distribution for histogram
    const trustScoreDistribution = calculateTrustScoreDistribution(staff || [])

    // Get geographic distribution
    const { data: profiles } = await supabase
      .from('profiles')
      .select('state, city, country')
      .not('state', 'is', null)

    const usersByState = groupBy(profiles || [], 'state')
    const usersByCountry = groupBy(profiles || [], 'country')

    // Calculate conversion rates
    const conversionRate = regularUsers.length > 0 
      ? ((staff?.length || 0) / regularUsers.length * 100).toFixed(1)
      : '0'

    return {
      userGrowth,
      incidentTrends,
      incidentsBySeverity,
      incidentsByCategory,
      incidentsByStatus,
      staffGrowth,
      staffByVerification,
      staffByType,
      staffByDepartment,
      avgTrustScore,
      trustScoreDistribution,
      usersByState,
      usersByCountry,
      totalUsers: regularUsers.length,
      totalIncidents: incidents?.length || 0,
      totalStaff: staff?.length || 0,
      conversionRate,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Return empty data structure on error
    return {
      userGrowth: [],
      incidentTrends: [],
      incidentsBySeverity: [],
      incidentsByCategory: [],
      incidentsByStatus: [],
      staffGrowth: [],
      staffByVerification: [],
      staffByType: [],
      staffByDepartment: [],
      avgTrustScore: 0,
      trustScoreDistribution: [],
      usersByState: [],
      usersByCountry: [],
      totalUsers: 0,
      totalIncidents: 0,
      totalStaff: 0,
      conversionRate: '0',
    }
  }
}

// Updated to accept month count parameter
function calculateMonthlyGrowth(data: any[], dateField: string, cumulative = false, months = 6) {
  const months_data = []
  const now = new Date()
  let runningTotal = 0
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    const count = data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate.getMonth() === date.getMonth() && 
             itemDate.getFullYear() === date.getFullYear()
    }).length
    
    runningTotal += count
    
    months_data.push({ 
      month: monthName, 
      count: cumulative ? runningTotal : count,
      newCount: count, // Keep raw count for tooltips
      fullDate: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
  }
  
  return months_data
}

function calculateTrustScoreDistribution(staff: any[]) {
  const ranges = [
    { min: 0, max: 20, label: '0-20' },
    { min: 21, max: 40, label: '21-40' },
    { min: 41, max: 60, label: '41-60' },
    { min: 61, max: 80, label: '61-80' },
    { min: 81, max: 100, label: '81-100' },
  ]
  
  return ranges.map(range => ({
    name: range.label,
    count: staff.filter(s => {
      const score = s.trust_score || 0
      return score >= range.min && score <= range.max
    }).length
  }))
}

function groupBy(data: any[], field: string) {
  const grouped: Record<string, number> = {}
  
  data.forEach(item => {
    const value = item[field] || 'unknown'
    grouped[value] = (grouped[value] || 0) + 1
  })
  
  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
}

export default async function AnalyticsPage() {
  // Check permissions first
  await checkAnalyticsPermissions()
  
  const analytics = await getAnalyticsData()

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-gray-400">Real-time platform insights and trends</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4" />
            <span className="sm:inline">Refresh</span>
          </button>
          <ExportButton data={analytics} />
        </div>
      </div>

      {/* Summary Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          change="+12.3%"
          color="blue"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
          label="Total Incidents"
          value={analytics.totalIncidents.toLocaleString()}
          change="-5.2%"
          color="orange"
          trend="down"
        />
        <SummaryCard
          icon={<UserCheck className="w-5 h-5 text-green-500" />}
          label="Total Staff"
          value={analytics.totalStaff.toLocaleString()}
          change="+8.1%"
          color="green"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          label="Avg Trust Score"
          value={analytics.avgTrustScore.toFixed(1)}
          suffix="/100"
          change="+2.4%"
          color="purple"
        />
        <SummaryCard
          icon={<Activity className="w-5 h-5 text-pink-500" />}
          label="Conversion Rate"
          value={analytics.conversionRate}
          suffix="%"
          change="+3.2%"
          color="pink"
        />
      </div>

      {/* Main Charts - Responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <ChartCard
            title="User Growth (Cumulative)"
            icon={<Users className="w-5 h-5 text-blue-500" />}
            action={<ChartActions />}
          >
            <div className="h-64 md:h-80">
              <AnalyticsChart
                data={analytics.userGrowth}
                dataKey="count"
                secondaryKey="newCount"
                color="#3b82f6"
                type="line"
                showGrid
                showTooltip
                height="100%"
              />
            </div>
          </ChartCard>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <ChartCard
            title="Incident Trends"
            icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
            action={<ChartActions />}
          >
            <div className="h-64 md:h-80">
              <AnalyticsChart
                data={analytics.incidentTrends}
                dataKey="count"
                color="#f97316"
                type="line"
                showGrid
                showTooltip
                height="100%"
              />
            </div>
          </ChartCard>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <ChartCard
            title="Staff Growth"
            icon={<UserCheck className="w-5 h-5 text-green-500" />}
            action={<ChartActions />}
          >
            <div className="h-64 md:h-80">
              <AnalyticsChart
                data={analytics.staffGrowth}
                dataKey="count"
                color="#22c55e"
                type="line"
                showGrid
                showTooltip
                height="100%"
              />
            </div>
          </ChartCard>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <ChartCard
            title="Incidents by Severity"
            icon={<PieChart className="w-5 h-5 text-red-500" />}
            action={<ChartActions />}
          >
            <div className="h-64 md:h-80">
              <AnalyticsChart
                data={analytics.incidentsBySeverity}
                dataKey="count"
                color="#ef4444"
                type="pie"
                showTooltip
                height="100%"
              />
            </div>
          </ChartCard>
        </Suspense>
      </div>

      {/* Distribution Charts - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <DistributionCard
            title="Trust Score Distribution"
            icon={<BarChart3 className="w-5 h-5 text-purple-500" />}
          >
            <div className="h-48">
              <AnalyticsChart
                data={analytics.trustScoreDistribution}
                dataKey="count"
                color="#a855f7"
                type="bar"
                showTooltip
                height="100%"
              />
            </div>
          </DistributionCard>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <DistributionCard
            title="Staff by Department"
            icon={<Users className="w-5 h-5 text-blue-500" />}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {analytics.staffByDepartment.slice(0, 8).map((item) => (
                <ProgressBar
                  key={item.name}
                  label={item.name.replace(/_/g, ' ')}
                  value={item.count}
                  total={analytics.totalStaff}
                  color="blue"
                />
              ))}
            </div>
          </DistributionCard>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <DistributionCard
            title="Staff Verification Status"
            icon={<UserCheck className="w-5 h-5 text-green-500" />}
          >
            <div className="space-y-3">
              {analytics.staffByVerification.map((item) => (
                <ProgressBar
                  key={item.name}
                  label={item.name}
                  value={item.count}
                  total={analytics.totalStaff}
                  color={getVerificationColor(item.name)}
                />
              ))}
            </div>
          </DistributionCard>
        </Suspense>
      </div>

      {/* Geographic Distribution - Responsive */}
      <ChartCard
        title="Geographic Distribution"
        icon={<MapPin className="w-5 h-5 text-purple-500" />}
        action={
          <button className="text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {analytics.usersByState.slice(0, 12).map((item) => (
            <GeoCard key={item.name} state={item.name} count={item.count} />
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

// Helper Components

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  suffix?: string
  color: string
  trend?: 'up' | 'down'
}

function SummaryCard({ icon, label, value, change, suffix = '', color, trend = 'up' }: SummaryCardProps) {
  const isPositive = trend === 'up'
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500'
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 md:p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`p-2 bg-${color}-500/20 rounded-lg shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-gray-400 text-xs md:text-sm truncate">{label}</p>
          <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
            <p className="text-white text-lg md:text-2xl font-bold">
              {value}{suffix}
            </p>
            {change && (
              <span className={`text-xs md:text-sm ${changeColor}`}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  action?: React.ReactNode
}

function ChartCard({ title, icon, children, action }: ChartCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <h2 className="text-base md:text-xl font-bold text-white truncate">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

interface DistributionCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function DistributionCard({ title, icon, children }: DistributionCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  total: number
  color: string
}

function ProgressBar({ label, value, total, color }: ProgressBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300 capitalize truncate max-w-[120px]" title={label}>
          {label}
        </span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface GeoCardProps {
  state: string
  count: number
}

function GeoCard({ state, count }: GeoCardProps) {
  return (
    <div className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 text-center transition-colors">
      <p className="text-gray-400 text-xs mb-1 truncate" title={state}>
        {state}
      </p>
      <p className="text-white text-lg md:text-xl font-bold">{count}</p>
    </div>
  )
}

function ChartActions() {
  return (
    <div className="flex items-center gap-1">
      <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
        <Maximize2 className="w-4 h-4" />
      </button>
      <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}

function getVerificationColor(status: string): string {
  switch(status) {
    case 'verified': return 'green'
    case 'pending': return 'yellow'
    case 'rejected': return 'red'
    default: return 'gray'
  }
}