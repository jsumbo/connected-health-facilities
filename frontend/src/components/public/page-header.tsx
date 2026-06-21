interface PageHeaderProps {
  title?: string
  assessed?: number
  target?: number
}

/** Single page title for auth dashboard routes (public routes use the shell header instead). */
export function PageHeader({ title, assessed, target }: PageHeaderProps) {
  if (!title && assessed == null) return null

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      {title ? (
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      ) : (
        <span />
      )}
      {assessed != null && target != null ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
          <span className="inline-block size-2 rounded-full bg-emerald-500" aria-hidden />
          {assessed} / {target}
        </p>
      ) : null}
    </div>
  )
}
