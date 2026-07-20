export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-5">
      <legend className="-mt-1 mb-1 px-1 font-heading text-base font-semibold text-foreground">
        {title}
      </legend>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  )
}
