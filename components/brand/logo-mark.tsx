type LogoMarkSize = 'nav' | 'footer'

const IMAGE_HEIGHT_CLASS: Record<LogoMarkSize, string> = {
  nav: 'max-h-6',
  footer: 'max-h-12',
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
        alt="Pastor Xurdir"
        className={`w-auto max-w-full object-contain ${IMAGE_HEIGHT_CLASS[size]}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground ${FALLBACK_SIZE_CLASS[size]}`}
    >
      PX
    </span>
  )
}
