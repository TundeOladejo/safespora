'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export function StaffFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [verificationStatus, setVerificationStatus] = useState(searchParams.get('verification_status') || 'all')
  const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || 'all')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setVerificationStatus(searchParams.get('verification_status') || 'all')
    setEmploymentType(searchParams.get('employment_type') || 'all')
  }, [searchParams])

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    router.push(`/admin/staff?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateFilters({ search: value, verification_status: verificationStatus, employment_type: employmentType })
  }

  const handleVerificationChange = (value: string) => {
    setVerificationStatus(value)
    updateFilters({ search, verification_status: value, employment_type: employmentType })
  }

  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentType(value)
    updateFilters({ search, verification_status: verificationStatus, employment_type: value })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search staff..."
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <select
          value={verificationStatus}
          onChange={(e) => handleVerificationChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
        >
          <option value="all">All Verification Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>

        <select
          value={employmentType}
          onChange={(e) => handleEmploymentTypeChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
        >
          <option value="all">All Employment Types</option>
          <option value="domestic_worker">Domestic Worker</option>
          <option value="security_guard">Security Guard</option>
          <option value="driver">Driver</option>
          <option value="gardener">Gardener</option>
          <option value="cleaner">Cleaner</option>
          <option value="nanny">Nanny</option>
          <option value="cook">Cook</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  )
}
