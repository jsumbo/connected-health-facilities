import { ExternalLink, FileText } from "lucide-react"
import { METHODOLOGY_DOC } from "@/lib/programme-resources"

export function MethodologyDocLink() {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{METHODOLOGY_DOC.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{METHODOLOGY_DOC.description}</p>
          </div>
        </div>
        <a
          href={METHODOLOGY_DOC.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          Open document
          <ExternalLink className="size-3.5" aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}
