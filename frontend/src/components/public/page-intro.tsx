interface PageIntroProps {
  title: string
  description?: string
}

export function PageIntro({ title, description }: PageIntroProps) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
