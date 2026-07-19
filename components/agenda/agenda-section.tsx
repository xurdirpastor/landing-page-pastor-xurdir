import { AgendaCarousel } from './agenda-carousel'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaSection({ items }: { items: AgendaItem[] }) {
  return (
    <section id="agenda" className="bg-background py-[88px]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
              Agenda
            </p>
            <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
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
