import Link from "next/link"
import { Home, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNav() {
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Αρχική</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="https://datasets.gr" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Άλλα δεδομένα</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
