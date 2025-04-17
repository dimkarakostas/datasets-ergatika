"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Import chart components with no SSR to avoid hydration issues
const TimeSeriesChart = dynamic(() => import("@/components/time-series-chart"), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center">Loading chart...</div>,
})

const PieChartView = dynamic(() => import("@/components/pie-chart-view"), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center">Loading chart...</div>,
})

// Define the sample data with proper TypeScript types
const sampleData: Record<string, Record<string, Record<string, number>>> = {
  file1: {
    "2018": { "Type A": 150, "Type B": 230, "Type C": 90 },
    "2019": { "Type A": 180, "Type B": 250, "Type C": 110 },
    "2020": { "Type A": 210, "Type B": 200, "Type C": 150 },
    "2021": { "Type A": 240, "Type B": 280, "Type C": 170 },
    "2022": { "Type A": 270, "Type B": 300, "Type C": 200 },
  },
  file2: {
    "2018": { "Category X": 500, "Category Y": 300, "Category Z": 200 },
    "2019": { "Category X": 550, "Category Y": 320, "Category Z": 230 },
    "2020": { "Category X": 600, "Category Y": 340, "Category Z": 260 },
    "2021": { "Category X": 650, "Category Y": 360, "Category Z": 290 },
    "2022": { "Category X": 700, "Category Y": 380, "Category Z": 320 },
  },
  file3: {
    "2018": { "Metric 1": 75, "Metric 2": 120, "Metric 3": 45 },
    "2019": { "Metric 1": 85, "Metric 2": 130, "Metric 3": 55 },
    "2020": { "Metric 1": 95, "Metric 2": 140, "Metric 3": 65 },
    "2021": { "Metric 1": 105, "Metric 2": 150, "Metric 3": 75 },
    "2022": { "Metric 1": 115, "Metric 2": 160, "Metric 3": 85 },
  },
}

// File name mapping
const fileNames: Record<string, string> = {
  file1: "Economic Data",
  file2: "Population Statistics",
  file3: "Environmental Metrics",
}

interface YearSelectorProps {
  years: string[]
  selectedYear: string | null
  onSelectYear: (year: string) => void
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selectedYear, onSelectYear }) => {
  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="year"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Select Year:
      </label>
      <select
        id="year"
        className="flex h-10 w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={selectedYear || ""}
        onChange={(e) => onSelectYear(e.target.value)}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function DataPage() {
  const params = useParams()
  const fileId = params.fileId as string
  const [data, setData] = useState<Record<string, Record<string, number>> | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ year: string; total: number }>>([])
  const [pieChartData, setPieChartData] = useState<Array<{ name: string; value: number }>>([])
  const [years, setYears] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch the data from an API or import the JSON file
    // For this example, we're using the sample data
    setLoading(true)

    // Check if the fileId exists in sampleData
    if (sampleData[fileId]) {
      const fileData = sampleData[fileId]
      setData(fileData)

      // Extract years and set the first year as selected by default
      const yearsList = Object.keys(fileData)
      setYears(yearsList)
      setSelectedYear(yearsList[0])

      // Prepare time series data
      const timeSeries = yearsList.map((year) => {
        const yearData = fileData[year]
        const total = Object.values(yearData).reduce((sum, value) => sum + value, 0)
        return { year, total }
      })
      setTimeSeriesData(timeSeries)
      setLoading(false)
    } else {
      setError(`Data for ${fileId} not found`)
      setLoading(false)
    }
  }, [fileId])

  useEffect(() => {
    // Update pie chart data when selected year changes
    if (data && selectedYear) {
      const yearData = data[selectedYear]
      const pieData = Object.entries(yearData).map(([name, value]) => ({
        name,
        value,
      }))
      setPieChartData(pieData)
    }
  }, [data, selectedYear])

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
          <p>{error}</p>
          <Link href="/">
            <Button className="mt-4">Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!data || !selectedYear) {
    return <div className="container mx-auto py-10">No data available</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{fileNames[fileId] || fileId}</h1>
      </div>

      <Tabs defaultValue="timeSeries" className="mb-8">
        <TabsList>
          <TabsTrigger value="timeSeries">Time Series</TabsTrigger>
          <TabsTrigger value="yearlyBreakdown">Yearly Breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="timeSeries">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={timeSeriesData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearlyBreakdown">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <YearSelector years={years} selectedYear={selectedYear} onSelectYear={setSelectedYear} />
              <div className="mt-6">
                <PieChartView data={pieChartData} year={selectedYear} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
