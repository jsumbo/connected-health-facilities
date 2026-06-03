import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { rootMetadata } from "@/lib/site-metadata"
import { cn } from "@/lib/utils"
import "./globals.css"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
})

export const metadata = rootMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(plexSans.variable, sourceSerif.variable, "font-sans")}
    >
      <body suppressHydrationWarning>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
