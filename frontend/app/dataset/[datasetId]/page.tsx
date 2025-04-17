"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"
import DatasetLoader from "@/components/dataset-loader"
import ErrorDisplay from "@/components/error-display"
import { sampleData } from "@/lib/sample-data"

// Import chart components with no SSR to avoid hydration issues
const PieChartView = dynamic(() => import("@/components/pie-chart-view"), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center">Loading chart...</div>,
})

const DataTable = dynamic(() => import("@/components/data-table"), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center">Loading table...</div>,
})

// Define the dataset mapping
const datasetInfo = {
  injuries_by_type: {
    name: "Τύπος Τραυματισμού",
    description: "Εργατικά ατυχήματα ανά τύπο τραυματισμού",
    file: "/injuries_by_type.json",
  },
  injuries_by_age: {
    name: "Ηλικία",
    description: "Εργατικά ατυχήματα ανά ηλικιακή ομάδα",
    file: "/injuries_by_age.json",
  },
  injuries_by_body_part: {
    name: "Μέρος του Σώματος",
    description: "Εργατικά ατυχήματα ανά μέρος του σώματος",
    file: "/injuries_by_body_part.json",
  },
  injuries_by_workplace_type: {
    name: "Εργασιακός Χώρος",
    description: "Εργατικά ατυχήματα ανά εργασιακό χώρο",
    file: "/injuries_by_workplace_type.json",
  },
  injuries_by_profession: {
    name: "Επάγγελμα",
    description: "Εργατικά ατυχήματα ανά επάγγελμα",
    file: "/injuries_by_profession.json",
  },
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
        Έτος:
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

export default function DatasetPage() {
  const params = useParams()
  const router = useRouter()
  const datasetId = params.datasetId as string

  const [data, setData] = useState<Record<string, Record<string, number>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [pieChartData, setPieChartData] = useState<Array<{ name: string; value: number }>>([])
  const [years, setYears] = useState<string[]>([])
  const [datasetExists, setDatasetExists] = useState(true)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    setDatasetExists(!!datasetInfo[datasetId as keyof typeof datasetInfo])
  }, [datasetId])

  const dataset = datasetInfo[datasetId as keyof typeof datasetInfo]

  const processData = useCallback((jsonData: Record<string, Record<string, number>>) => {
    // Extract years and sort them
    const yearsList = Object.keys(jsonData).sort()
    setYears(yearsList)

    // Set the last year (most recent) as selected by default
    setSelectedYear(yearsList[yearsList.length - 1])
    setData(jsonData)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Try to fetch the data from the file
      try {
        console.log(`Fetching data from: ${dataset.file}`)
        const response = await fetch(dataset.file)

        if (!response.ok) {
          console.warn(`Failed to fetch data: ${response.statusText}. Using sample data instead.`)
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const text = await response.text()

        // Check if the response is empty
        if (!text.trim()) {
          console.warn("Empty response received. Using sample data instead.")
          throw new Error("Empty response received")
        }

        try {
          const jsonData = JSON.parse(text)
          processData(jsonData)
          setUsingSampleData(false)
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError)
          console.error("First 100 characters of response:", text.substring(0, 100))
          throw new Error("Failed to parse JSON data. The file may be corrupted or not in JSON format.")
        }
      } catch (fetchError) {
        // If fetching fails, use sample data as fallback
        console.log(`Using sample data for ${datasetId}`)
        const fallbackData = sampleData[datasetId as keyof typeof sampleData]

        if (fallbackData) {
          processData(fallbackData)
          setUsingSampleData(true)
        } else {
          throw new Error(`No sample data available for ${datasetId}`)
        }
      }

      setLoading(false)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setErrorDetails(err instanceof Error ? err.stack || null : null)
      setLoading(false)
    }
  }, [dataset?.file, datasetId, processData])

  useEffect(() => {
    // Check if the dataset exists
    if (!datasetExists) {
      return
    }
    if (dataset) {
      fetchData()
    }
  }, [datasetExists, dataset, fetchData])

  useEffect(() => {
    // Update pie chart data when selected year changes
    if (data && selectedYear) {
      const yearData = data[selectedYear]
      const pieData = Object.entries(yearData)
        .map(([name, value]) => ({
          name,
          value: typeof value === "number" ? value : 0,
        }))
        .sort((a, b) => b.value - a.value) // Sort by value in descending order

      setPieChartData(pieData)
    }
  }, [data, selectedYear])

  if (!datasetExists) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Dataset not found</h1>
        <p>The requested dataset does not exist.</p>
        <Link href="/">
          <Button className="mt-4">Return to Home</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return <DatasetLoader />
  }

  if (error && !usingSampleData) {
    return <ErrorDisplay message={error} details={errorDetails || undefined} />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{dataset.name}</h1>
          <p className="text-muted-foreground">{dataset.description}</p>
          {usingSampleData && (
            <div className="mt-2 text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md inline-block">
              Using sample data (JSON files not found)
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="pieChart" className="mb-8">
        <TabsList>
          <TabsTrigger value="pieChart">Κατανομή</TabsTrigger>
          <TabsTrigger value="tableView">Πίνακας</TabsTrigger>
        </TabsList>
        <TabsContent value="pieChart">
          <Card>
            <CardHeader>
              <CardTitle>Κατανομή</CardTitle>
            </CardHeader>
            <CardContent>
              <YearSelector years={years} selectedYear={selectedYear} onSelectYear={setSelectedYear} />
              <div className="mt-6">
                <PieChartView data={pieChartData} year={selectedYear} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tableView">
          <Card>
            <CardHeader>
              <CardTitle>Αναλυτικός Πίνακας</CardTitle>
            </CardHeader>
            <CardContent>
              <YearSelector years={years} selectedYear={selectedYear} onSelectYear={setSelectedYear} />
              <div className="mt-6">
                <DataTable data={pieChartData} year={selectedYear} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
