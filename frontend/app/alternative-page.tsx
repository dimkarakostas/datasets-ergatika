import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ClientWrapper from "@/components/client-wrapper"
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
    name: "Injuries by Type",
    description: "Workplace injuries categorized by injury type",
    file: "injuries_by_type-uDpOe3kouuqSrakz1PpzDYItHiStAs.json",
  },
  {
    id: "injuries_by_age",
    name: "Injuries by Age",
    description: "Workplace injuries categorized by age groups",
    file: "injuries_by_age-ixyiUWof2vAMXxBPmaD66ojcH4oiDF.json",
  },
  {
    id: "injuries_by_body_part",
    name: "Injuries by Body Part",
    description: "Workplace injuries categorized by affected body part",
    file: "injuries_by_body_part-z04cD67vNLWLPjYGvxRDEtjDp0JPwm.json",
  },
  {
    id: "injuries_by_workplace_type",
    name: "Injuries by Workplace",
    description: "Workplace injuries categorized by industry/workplace type",
    file: "injuries_by_workplace_type-uZBNxZUErvTjVt5KBHtR12cjnel4mE.json",
  },
  {
    id: "injuries_by_profession",
    name: "Injuries by Profession",
    description: "Workplace injuries categorized by profession",
    file: "injuries_by_profession-HxqNCU4gDtEDU9tc36CB3GH2ZUf1eL.json",
  },
]

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Workplace Injuries in Greece (2000-2022)</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Interactive visualization of workplace injuries data across different categories
      </p>

      {/* Time Series Chart wrapped in a Client Component */}
      <ClientWrapper>
        <HomeTimeSeries />
      </ClientWrapper>

      <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>{dataset.name}</CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                View detailed breakdowns of workplace injuries categorized by{" "}
                {dataset.id.split("_by_")[1].replace("_", " ")}.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/dataset/${dataset.id}`} className="w-full">
                <Button className="w-full">View Data</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
