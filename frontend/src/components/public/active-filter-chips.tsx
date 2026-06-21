"use client"

import { X } from "lucide-react"

interface ActiveFilterChipsProps {
  county?: string
  tier?: string
  cluster?: string
  onClearCounty?: () => void
  onClearTier?: () => void
  onClearCluster?: () => void
  onClearAll: () => void
}

export function ActiveFilterChips({
  county,
  tier,
  cluster,
  onClearCounty,
  onClearTier,
  onClearCluster,
  onClearAll,
}: ActiveFilterChipsProps) {
  const hasFilters = Boolean(county || tier || cluster)
  if (!hasFilters) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="status" aria-label="Active filters">
      <span className="text-xs font-medium text-muted-foreground">Filters:</span>
      {county ? (
        <FilterChip label={`County: ${county}`} onRemove={onClearCounty ?? onClearAll} />
      ) : null}
      {tier ? (
        <FilterChip label={`Tier: ${tier.replace(" — ", " · ")}`} onRemove={onClearTier ?? onClearAll} />
      ) : null}
      {cluster ? (
        <FilterChip label={`Cluster: ${cluster}`} onRemove={onClearCluster ?? onClearAll} />
      ) : null}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-primary hover:underline underline-offset-2"
      >
        Reset all
      </button>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-muted"
        aria-label={`Remove filter ${label}`}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}
