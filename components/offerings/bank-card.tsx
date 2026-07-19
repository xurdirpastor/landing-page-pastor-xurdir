import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

type Row = { label: string; value: string }

export function BankCard({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card className="bg-card-gradient p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={row.label}>
            {index > 0 && <Separator className="mb-3" />}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold text-foreground">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
