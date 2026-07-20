import Image from 'next/image'

export function LogoMark({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <span className="relative block size-9 shrink-0 overflow-hidden rounded-full">
        <Image src={logoUrl} alt="Seja Livre" fill sizes="36px" className="object-cover" />
      </span>
    )
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
      SL
    </span>
  )
}
