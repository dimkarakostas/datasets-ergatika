"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts"

interface PieChartViewProps {
  data: Array<{ name: string; value: number }>
  year: string | null
}

// Custom active shape for the pie chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

// Custom colors for the pie chart
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.9)",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.75)",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.65)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.45)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.35)",
  "hsl(var(--primary) / 0.3)",
  "hsl(var(--secondary))",
  "hsl(var(--secondary) / 0.8)",
  "hsl(var(--secondary) / 0.6)",
  "hsl(var(--secondary) / 0.5)",
  "hsl(var(--secondary) / 0.4)",
  "hsl(var(--accent))",
  "hsl(var(--accent) / 0.8)",
  "hsl(var(--accent) / 0.6)",
  "hsl(var(--accent) / 0.5)",
  "hsl(var(--accent) / 0.4)",
]

export default function PieChartView({ data, year }: PieChartViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [displayData, setDisplayData] = useState<Array<{ name: string; value: number }>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Limit the number of slices in the pie chart to avoid overcrowding
  useEffect(() => {
    if (data.length > 10) {
      // Take top 9 items and group the rest as "Other"
      const topItems = data.slice(0, 9)
      const otherItems = data.slice(9)
      const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0)

      setDisplayData([...topItems, { name: "Άλλο", value: otherValue }])
    } else {
      setDisplayData(data)
    }
  }, [data])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / displayData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">
            <span className="font-medium">Πλήθος:</span> {new Intl.NumberFormat("en").format(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Ποσοστό:</span> {percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  if (!isMounted) {
    return <div className="h-[500px] flex items-center justify-center">Loading chart...</div>
  }

  // Calculate total for percentage
  const total = displayData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-center">Κατανομή Τραυματισμών για το {year}</h3>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={60}
              outerRadius={140}
              fill="hsl(var(--primary))"
              dataKey="value"
              nameKey="name"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value, entry, index) => {
                const item = displayData[index!]
                const percentage = ((item.value / total) * 100).toFixed(1)
                return `${value} (${percentage}%)`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
