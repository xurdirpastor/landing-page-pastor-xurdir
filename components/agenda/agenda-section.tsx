import { AgendaCarousel } from './agenda-carousel'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaSection({ items }: { items: AgendaItem[] }) {
  return (
    <section id="agenda" className="bg-background">
      <div className="divider-glow" />
      <div className="mx-auto max-w-6xl px-6 py-[88px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
              Agenda
            </p>
            <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
              Cultos, mentorias e pregações
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Participe presencialmente ou acompanhe de onde estiver — todos são bem-vindos.
          </p>
        </div>

        <AgendaCarousel items={items} />
      </div>
    </section>
  )
}
