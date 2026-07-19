'use client'

import QRCode from 'react-qr-code'
import { Card } from '@/components/ui/card'
import { CopyButton } from './copy-button'
import { buildPixPayload } from '@/lib/pix/br-code'
import type { OfferingSettings } from '@/lib/generated/prisma/client'

export function PixCard({ settings }: { settings: OfferingSettings }) {
  const payload = buildPixPayload({
    key: settings.pixKey,
    merchantName: settings.pixMerchantName,
    merchantCity: settings.pixMerchantCity,
  })

  return (
    <Card className="items-center bg-card-gradient p-6 text-center">
      <h3 className="font-heading text-lg font-semibold text-foreground">Pix</h3>
      <div className="mt-4 rounded-md bg-white p-3">
        <QRCode value={payload} size={168} />
      </div>
      <div className="mt-4 flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
          {settings.pixKey}
        </span>
        <CopyButton value={settings.pixKey} />
      </div>
    </Card>
  )
}
