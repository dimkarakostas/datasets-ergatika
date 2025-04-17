"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sampleData } from "@/lib/sample-data"

// We'll focus only on the injuries by age dataset
const targetDataset = {
  id: "injuries_by_age",
  name: "Injuries by Age",
  file: "/injuries_by_age.json",
  color: "hsl(var(--primary))",
}

export default function HomeTimeSeries() {
  const [isMounted, setIsMounted] = useState(false)
  const [chartData, setChartData] = useState<Array<{ year: string; total: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    try {
      console.log(`Fetching data from ${targetDataset.file}`)
      const response = await fetch(targetDataset.file)

      if (!response.ok) {
        console.warn(`Failed to fetch data: ${response.statusText}. Using sample data.`)
        processFallbackData()
        return
      }

      const text = await response.text()

      // Check if the response is empty
      if (!text.trim()) {
        console.warn("Empty response received. Using sample data.")
        processFallbackData()
        return
      }

      try {
        const jsonData = JSON.parse(text)
        processData(jsonData)
        setUsingSampleData(false)
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        processFallbackData()
      }
    } catch (fetchError) {
      console.error("Error fetching data:", fetchError)
      processFallbackData()
    } finally {
      setLoading(false)
    }
  }

  const processData = (data: Record<string, Record<string, number>>) => {
    // Extract years and calculate totals
    const timeSeriesData = Object.entries(data)
      .map(([year, yearData]) => {
        const total = Object.values(yearData).reduce((sum, value) => sum + (typeof value === "number" ? value : 0), 0)
        return { year, total }
      })
      .sort((a, b) => a.year.localeCompare(b.year)) // Sort by year

    setChartData(timeSeriesData)
  }

  const processFallbackData = () => {
    const fallbackData = sampleData[targetDataset.id as keyof typeof sampleData]
    if (fallbackData) {
      processData(fallbackData)
      setUsingSampleData(true)
    } else {
      setError("No sample data available")
    }
  }

  // Custom tooltip that only shows "Total: [number]"
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="text-sm font-medium">Έτος: {label}</p>
          <p className="text-sm">
            <span className="font-medium">Σύνολο:</span> {new Intl.NumberFormat("en").format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (!isMounted) {
    return <div className="w-full h-[400px] flex items-center justify-center">Loading chart...</div>
  }

  if (loading) {
    return (
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Total Workplace Injuries by Age in Greece (2000-2022)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Total Workplace Injuries by Age in Greece (2000-2022)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive">Error loading data: {error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Retry
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Εργατικά Ατυχήματα στην Ελλάδα</span>
          {usingSampleData && (
            <span className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md">Using sample data</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickMargin={10}
                width={80}
                tickFormatter={(value) => new Intl.NumberFormat("en").format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={targetDataset.color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
