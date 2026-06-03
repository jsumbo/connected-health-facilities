import { Card, CardContent } from "@/components/ui/card"

interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-none">
      <CardContent className="pt-4 text-sm text-destructive">
        {message}. Check the API is running (
        <code className="rounded bg-destructive/10 px-1 text-xs">NEXT_PUBLIC_API_URL</code>).
      </CardContent>
    </Card>
  )
}
