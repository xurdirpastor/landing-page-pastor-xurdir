import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPriceBRL } from '@/lib/format/price'
import type { Book } from '@/lib/generated/prisma/client'

export function BookCard({ book }: { book: Book }) {
  return (
    <Card className="grid gap-8 bg-card-gradient p-6 nav:grid-cols-[220px_1fr] nav:p-8">
      <div className="relative mx-auto aspect-11/16 w-full max-w-[220px] overflow-hidden rounded-md shadow-md">
        <Image src={book.coverImageUrl} alt={book.title} fill sizes="220px" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-heading text-2xl font-semibold text-foreground">{book.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground italic">{book.subtitle}</p>
        <p className="mt-4 text-base leading-[1.7] text-text-secondary">{book.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="font-heading text-xl font-semibold text-foreground">
            {formatPriceBRL(book.price.toString())}
          </span>
          <Button
            render={<a href={book.buyUrl} target="_blank" rel="noopener noreferrer" />}
            className="rounded-full"
          >
            Comprar agora
          </Button>
        </div>
      </div>
    </Card>
  )
}
