"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface YearSelectorProps {
  years: string[]
  selectedYear: string | null
  onSelectYear: (year: string) => void
}

export default function YearSelector({ years, selectedYear, onSelectYear }: YearSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Select Year:</h3>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex p-4 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={year === selectedYear ? "default" : "outline"}
              onClick={() => onSelectYear(year)}
              size="sm"
            >
              {year}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
