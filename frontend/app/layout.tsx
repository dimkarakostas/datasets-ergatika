import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TopNav } from "@/components/top-nav"
import { FooterNav } from "@/components/footer-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Εργατικά Ατυχήματα στην Ελλάδα",
  description: "Διαδραστική απεικόνιση των ιστορικών δεδομένων εργατικών ατυχημάτων στην Ελλάδα",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNav />
          <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4">{children}</div>
          </main>
          <FooterNav />
        </ThemeProvider>
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "ce2dcd0284694cc0be72996bd485c7b7"}'></script>
      </body>
    </html>
  )
}
