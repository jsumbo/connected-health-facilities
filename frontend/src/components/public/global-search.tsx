"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { Input } from "@/components/ui/input"

interface GlobalSearchProps {
  facilities: ProgrammeFacility[]
}

export function GlobalSearch({ facilities }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return facilities
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.county.toLowerCase().includes(q) ||
          f.cluster.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [facilities, query])

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search facilities…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          className="h-8 pl-8 text-xs"
          aria-label="Search facilities globally"
          aria-expanded={open && results.length > 0}
          aria-controls="global-search-results"
        />
      </div>
      {open && query.trim().length >= 2 && results.length > 0 ? (
        <ul
          id="global-search-results"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-md"
          role="listbox"
        >
          {results.map((f) => (
            <li key={f.slug} role="option">
              <Link
                href={`/facility/${f.slug}`}
                className="block px-3 py-2 text-xs hover:bg-muted"
                onClick={() => {
                  setQuery("")
                  setOpen(false)
                }}
              >
                <span className="font-medium text-foreground">{f.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {f.county}
                  {f.overall_score != null ? ` · ${f.overall_score}%` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
