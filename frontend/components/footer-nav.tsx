import Link from "next/link"

export function FooterNav() {
  return (
    <footer className="w-full border-t bg-background py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>
              © {new Date().getFullYear()} - Άδεια{" "}
              <Link
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                CC-BY-SA 4.0
              </Link>
            </span>
            <span className="hidden md:inline">•</span>
            <span>
              Πηγή δεδομένων:{" "}
              <Link
                href="https://www.statistics.gr/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Ελληνική Στατιστική Αρχή
              </Link>
            </span>
          </div>
          <div>
            <span>
              Αναπτύχθηκε με{" "}
              <Link
                href="https://v0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                v0.dev
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
