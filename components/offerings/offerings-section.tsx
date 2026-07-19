import { PixCard } from './pix-card'
import { BankCard } from './bank-card'
import type { OfferingSettings } from '@/lib/generated/prisma/client'

export function OfferingsSection({ settings }: { settings: OfferingSettings }) {
  return (
    <section id="ofertas" className="bg-background">
      <div className="divider-glow" />
      <div className="py-[88px]">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-bold tracking-[1.3px] text-blue-accent-text uppercase">
            Dízimos e ofertas
          </p>
          <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
            Semeie com um coração generoso
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-[1.7] text-text-secondary">
            &ldquo;Cada um dê conforme determinou em seu coração.&rdquo; Sua contribuição sustenta a
            pregação, as mentorias e o cuidado com quem busca libertação.
          </p>
        </div>

        <div
          className="mx-auto mt-10 grid max-w-6xl gap-6 px-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <PixCard settings={settings} />
          <BankCard
            title="Conta nacional"
            rows={[
              { label: 'Banco', value: settings.nationalBank },
              { label: 'Agência', value: settings.nationalAgency },
              { label: 'Conta corrente', value: settings.nationalAccount },
              { label: 'CNPJ', value: settings.nationalCnpj },
            ]}
          />
          <BankCard
            title="Conta internacional"
            rows={[
              { label: 'Banco', value: settings.intlBank },
              { label: 'IBAN', value: settings.intlIban },
              { label: 'SWIFT/BIC', value: settings.intlSwift },
              { label: 'Titular', value: settings.intlAccountHolder },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
