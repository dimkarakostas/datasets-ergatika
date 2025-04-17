"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps {
  data: Array<{ name: string; value: number }>
  year: string | null
}

export default function DataTable({ data, year }: DataTableProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-[400px] flex items-center justify-center">Loading table...</div>
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Sort data by value (second column) in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-center">Αναλυτική Κατανομή για το έτος {year}</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Κατηγορία</TableHead>
              <TableHead className="text-right">Τραυματισμοί</TableHead>
              <TableHead className="text-right">Ποσοστό</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">{new Intl.NumberFormat("en").format(item.value)}</TableCell>
                <TableCell className="text-right">{((item.value / total) * 100).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{new Intl.NumberFormat("en").format(total)}</TableCell>
              <TableCell className="text-right font-bold">100.0%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
