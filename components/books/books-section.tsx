import { BookCard } from './book-card'
import type { Book } from '@/lib/generated/prisma/client'

export function BooksSection({ books }: { books: Book[] }) {
  return (
    <section id="livros" className="bg-background">
      <div className="divider-glow" />
      <div className="py-[88px]">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-bold tracking-[1.3px] text-blue-accent-text uppercase nav:text-xl">Livros</p>
          <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
            Leituras para a jornada
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl px-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  )
}
