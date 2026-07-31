type LogoMarkSize = 'nav' | 'footer'

const IMAGE_HEIGHT_CLASS: Record<LogoMarkSize, string> = {
  nav: 'h-9',
  footer: 'h-12',
}

const FALLBACK_SIZE_CLASS: Record<LogoMarkSize, string> = {
  nav: 'size-9',
  footer: 'size-12',
}

export function LogoMark({
  logoUrl,
  size = 'nav',
}: {
  logoUrl?: string | null
  size?: LogoMarkSize
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Seja Livre"
        className={`w-auto shrink-0 object-contain ${IMAGE_HEIGHT_CLASS[size]}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground ${FALLBACK_SIZE_CLASS[size]}`}
    >
      SL
    </span>
  )
}
