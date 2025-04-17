"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

interface TimeSeriesChartProps {
  data: Array<{ year: string; total: number }>
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="w-full h-[400px] flex items-center justify-center">Loading chart...</div>
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} tickMargin={10} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
            width={80}
            tickFormatter={(value) => new Intl.NumberFormat("en").format(value)}
          />
          <Tooltip
            formatter={(value: number) => new Intl.NumberFormat("en").format(value)}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
