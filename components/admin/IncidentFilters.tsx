'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export function IncidentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setStatus(searchParams.get('status') || 'all')
    setSeverity(searchParams.get('severity') || 'all')
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
    
    router.push(`/admin/incidents?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateFilters({ search: value, status, severity })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateFilters({ search, status: value, severity })
  }

  const handleSeverityChange = (value: string) => {
    setSeverity(value)
    updateFilters({ search, status, severity: value })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search incidents..."
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="false_report">False Report</option>
        </select>

        <select
          value={severity}
          onChange={(e) => handleSeverityChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  )
}
