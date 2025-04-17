"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  message: string
  details?: string
}

export default function ErrorDisplay({ message, details }: ErrorDisplayProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive mr-2" />
          <h1 className="text-2xl font-bold text-destructive">Error Loading Data</h1>
        </div>
        <p className="mb-2">{message}</p>
        {details && (
          <div className="bg-background p-4 rounded-md my-4 overflow-auto max-h-[200px]">
            <pre className="text-xs">{details}</pre>
          </div>
        )}
        <p className="mt-4 mb-2">Possible solutions:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Check if the JSON files are correctly placed in the public folder</li>
          <li>Verify that the JSON files are properly formatted</li>
          <li>Try refreshing the page</li>
        </ul>
        <div className="flex gap-4">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  )
}
