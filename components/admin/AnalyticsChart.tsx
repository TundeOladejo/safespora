// components/admin/AnalyticsChart.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'

interface AnalyticsChartProps {
  data: any[]
  dataKey: string
  secondaryKey?: string
  color: string
  type?: 'line' | 'bar' | 'pie' | 'area' | 'composed'
  showGrid?: boolean
  showTooltip?: boolean
  height?: string | number
  className?: string
}

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7',
  '#ec4899', '#06b6d4', '#eab308', '#6b7280', '#8b5cf6'
]

export function AnalyticsChart({
  data,
  dataKey,
  secondaryKey,
  color,
  type = 'line',
  showGrid = true,
  showTooltip = true,
  height = '100%',
  className = ''
}: AnalyticsChartProps) {
  const [isMobile, setIsMobile] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500">
        No data available
      </div>
    )
  }

  // Custom tooltip to show both month and full date if available
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.month === label)
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm mb-2">
            {dataPoint?.fullDate || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value}</span>
              {entry.name === 'count' && dataPoint?.newCount !== undefined && (
                <span className="text-gray-500 text-xs">
                  (+{dataPoint.newCount} new)
                </span>
              )}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch(type) {
      case 'line':
        return (
          <LineChart 
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />}
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 11 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 11 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              width={isMobile ? 35 : 45}
              allowDecimals={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2.5}
              dot={{ fill: color, strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, stroke: '#fff', strokeWidth: 2 }}
            />
            {secondaryKey && (
              <Line 
                type="monotone" 
                dataKey={secondaryKey} 
                stroke="#9CA3AF" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#9CA3AF', r: isMobile ? 2 : 3 }}
              />
            )}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart 
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />}
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 10 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              interval={0}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 10 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              width={isMobile ? 35 : 45}
              allowDecimals={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 50}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart 
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />}
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 11 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              interval={0}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isMobile ? 11 : 12 }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              width={isMobile ? 35 : 45}
              allowDecimals={false}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#gradient-${color})`}
              dot={{ fill: color, r: isMobile ? 3 : 4 }}
            />
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 70 : 90}
              innerRadius={isMobile ? 30 : 40}
              paddingAngle={2}
              label={!isMobile ? ({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index
              }) => {
                // Type guard for midAngle
                if (typeof midAngle !== 'number') return null
                
                const RADIAN = Math.PI / 180
                const radius = 25 + innerRadius + (outerRadius - innerRadius)
                const x = cx + radius * Math.cos(-midAngle * RADIAN)
                const y = cy + radius * Math.sin(-midAngle * RADIAN)
                
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#9CA3AF"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={11}
                    className="text-xs"
                  >
                    {`${data[index].name} (${value})`}
                  </text>
                )
              } : false}
              labelLine={!isMobile}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                        <p className="text-gray-300 text-sm">
                          {payload[0].name}: <span className="text-white font-medium">{payload[0].value}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            )}
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <div ref={chartRef} className={`w-full h-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}