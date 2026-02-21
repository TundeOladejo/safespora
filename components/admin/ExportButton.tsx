'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ExportButtonProps {
  data: any
}

export function ExportButton({ data }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<'json' | 'csv'>('json')

  const handleExport = () => {
    try {
      if (format === 'json') {
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // CSV export - simplified version
        const csvData = convertToCSV(data)
        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      toast.success(`Analytics exported as ${format.toUpperCase()}`)
      setOpen(false)
    } catch (error) {
      toast.error('Failed to export analytics')
      console.error(error)
    }
  }

  const convertToCSV = (data: any) => {
    const rows: string[] = []
    
    // Summary stats
    rows.push('Summary Statistics')
    rows.push('Metric,Value')
    rows.push(`Total Users,${data.totalUsers}`)
    rows.push(`Total Incidents,${data.totalIncidents}`)
    rows.push(`Total Staff,${data.totalStaff}`)
    rows.push(`Average Trust Score,${data.avgTrustScore.toFixed(2)}`)
    rows.push('')

    // User growth
    rows.push('User Growth (Monthly)')
    rows.push('Month,Count')
    data.userGrowth.forEach((item: any) => {
      rows.push(`${item.month},${item.count}`)
    })
    rows.push('')

    // Incident trends
    rows.push('Incident Trends (Monthly)')
    rows.push('Month,Count')
    data.incidentTrends.forEach((item: any) => {
      rows.push(`${item.month},${item.count}`)
    })
    rows.push('')

    // Incidents by severity
    rows.push('Incidents by Severity')
    rows.push('Severity,Count')
    data.incidentsBySeverity.forEach((item: any) => {
      rows.push(`${item.name},${item.count}`)
    })
    rows.push('')

    // Staff by type
    rows.push('Staff by Employment Type')
    rows.push('Type,Count')
    data.staffByType.forEach((item: any) => {
      rows.push(`${item.name},${item.count}`)
    })

    return rows.join('\n')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Export Analytics</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a format to export the analytics data
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Export Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                  className="text-red-600"
                />
                <span className="text-white">JSON</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                  className="text-red-600"
                />
                <span className="text-white">CSV</span>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
