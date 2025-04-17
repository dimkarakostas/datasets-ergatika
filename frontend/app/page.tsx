"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Import the time series chart with no SSR
const HomeTimeSeries = dynamic(() => import("@/components/home-time-series"), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center">Loading chart...</div>,
})

// Define the datasets
const datasets = [
  {
    id: "injuries_by_type",
    name: "Τύπος Τραυματισμού",
    description: "Εργατικά ατυχήματα ανά τύπο τραυματισμού",
    file: "injuries_by_type.json",
  },
  {
    id: "injuries_by_age",
    name: "Ηλικία",
    description: "Εργατικά ατυχήματα ανά ηλικιακή ομάδα",
    file: "injuries_by_age.json",
  },
  {
    id: "injuries_by_body_part",
    name: "Μέρος του Σώματος",
    description: "Εργατικά ατυχήματα ανά μέρος του σώματος",
    file: "injuries_by_body_part.json",
  },
  {
    id: "injuries_by_workplace_type",
    name: "Εργασιακός Χώρος",
    description: "Εργατικά ατυχήματα ανά εργασιακό χώρο",
    file: "injuries_by_workplace_type.json",
  },
  {
    id: "injuries_by_profession",
    name: "Επάγγελμα",
    description: "Εργατικά ατυχήματα ανά επάγγελμα",
    file: "injuries_by_profession.json",
  },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Εργατικά Ατυχήματα στην Ελλάδα</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Διαδραστική απεικόνιση των εργατικών ατυχημάτων
      </p>

      {/* Time Series Chart */}
      {mounted && <HomeTimeSeries />}

      <h2 className="text-2xl font-bold mb-6">Κατηγορίες</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>{dataset.name}</CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            {/*
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                View detailed breakdowns of workplace injuries categorized by{" "}
                {dataset.id.split("_by_")[1].replace("_", " ")}.
              </p>
            </CardContent>
            */}
            <CardFooter>
              <Link href={`/dataset/${dataset.id}`} className="w-full">
                <Button className="w-full">Δες τα δεδομένα</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
