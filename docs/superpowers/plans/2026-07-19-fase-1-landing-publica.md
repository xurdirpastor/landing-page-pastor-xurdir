# Fase 1 — Landing pública (read-only, dados seed) Implementation Plan

> **STATUS: COMPLETE** (2026-07-19). Todas as 33 tasks executadas e verificadas — worktree isolado, merge fast-forward pra `main`. Depois do merge, uma rodada de correções via feedback visual ao vivo (12 commits) ajustou o que o texto abaixo não previu: `lucide-react` foi totalmente removido e substituído por `react-icons` (`react-icons/lu` genérico + `react-icons/fa` só pros 3 ícones de marca do rodapé — Task 24/28 abaixo ainda descrevem a versão lucide, superada); `Button`/`SheetClose` renderizados via `render={<a/>}` precisam de `nativeButton={false}` (Base UI, não previsto no texto); o `.divider-glow` (Task 1) só passou a ser usado de fato numa correção pós-merge, como linha sólida (não gradiente) no topo de cada seção — não como planejado originalmente; `Card` usa `border border-border` em vez do `ring-1 ring-foreground/10` original do shadcn; títulos de seção e o eyebrow acima deles ficaram maiores que o texto abaixo especifica. O resumo durável de cada mudança está no `CLAUDE.md` (§2, §5, §11) e no `PRD.md` §10 — este arquivo é o registro histórico da execução, não a fonte de verdade atual.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Renderizar a home pública inteira (`/`) fiel ao protótipo (`design/`), lendo conteúdo real do Postgres via Prisma (seed, sem admin ainda).

**Architecture:** Server Components puros por seção (`components/<domínio>/`), dados via `lib/content/<entidade>.ts` (Prisma + `unstable_cache` + tag), lógica não-trivial isolada em `lib/format/` e `lib/pix/` (funções puras, testadas). shadcn/ui (`base-nova`, base `@base-ui/react`) para os primitivos.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn CLI 4.13.1, Prisma 7.8.0 (driver adapter), Bun, oxlint, `bun:test`, `react-qr-code`, `embla-carousel-react` (via shadcn Carousel).

## Global Constraints

- Bun para tudo (`bun`/`bunx`) — nunca `npm`/`yarn`/`pnpm`.
- `bunx oxlint` para lint — nunca ESLint.
- Conteúdo do site em pt-BR; identificadores/código/commits em inglês.
- Server Components por padrão; `'use client'` só em interatividade real (menu mobile, carrossel, botão copiar, QR).
- Tema escuro único (`<html class="dark">`), sem toggle.
- Breakpoint funcional único: **860px** (`--breakpoint-nav`), só pra troca desktop/hambúrguer da navbar. Resto do layout é fluido (`grid-template-columns: repeat(auto-fit, minmax(...))`).
- Sem client-side data fetching nas seções públicas (SEO) — todo dado vem de Server Component via `lib/content/`.
- shadcn/ui é a única camada visual — sem CSS solto reimplementando um primitivo (`Button`, `Card`, `Badge`, `Sheet`, `Avatar`, `Separator`, `Carousel`).
- Base do Button/Badge/Sheet/Avatar deste projeto é **`@base-ui/react`** (não Radix): polimorfismo é via prop `render={<a .../>}`, não `asChild`.
- TDD obrigatório para lógica não-trivial: gerador de payload Pix (CRC16 + BR Code), expiração de agenda por data, formatação de preço.
- Nenhuma seção pública referencia dado hardcoded — tudo vem de `prisma/seed.ts` via `lib/content/`.
- Fora de escopo: `/admin`, upload real, `revalidateTag` disparado por mutação, metadata/OpenGraph avançado (Fase 3), qualquer item do roadmap v2.

---

### Task 1: Design tokens no `app/globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: utilities Tailwind `text-text-secondary`, `bg-blue-primary`, `bg-blue-primary-dim`, `text-blue-accent`, `bg-blue-accent`, `hover:text-blue-accent-hover`/`hover:border-blue-accent`, `text-blue-accent-text`, `bg-bg-panel-2`/`bg-bg-panel-3`, `border-border-strong`, `bg-brand-accent`, `shadow-sm`/`shadow-md`/`shadow-glow`, classes `.bg-panel-gradient`, `.bg-card-gradient`, `.divider-glow`, breakpoint variant `nav:`/`max-nav:`.

- [x] **Step 1: Adicionar tokens brutos, sombras e breakpoint num novo bloco `@theme`**

Adicionar logo depois do bloco `@theme inline { ... }` existente (não misturar dentro dele, esse é referenciado por variável; este novo é valores estáticos):

```css
@theme {
  --breakpoint-nav: 860px;

  --color-text-secondary: #B7BECD;
  --color-blue-primary: #3159C7;
  --color-blue-primary-dim: #293868;
  --color-blue-accent: #4C8CFF;
  --color-blue-accent-hover: #6A9FFF;
  --color-blue-accent-text: #8FB4FF;
  --color-bg-panel-2: #252B38;
  --color-bg-panel-3: #2D3444;
  --color-border-strong: rgba(255, 255, 255, 0.24);
  --color-brand-accent: #FF7A3D;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, .35);
  --shadow-md: 0 12px 32px rgba(0, 0, 0, .45);
  --shadow-glow: 0 0 0 1px rgba(76, 140, 255, .3), 0 16px 48px rgba(30, 40, 70, .4);
}
```

- [x] **Step 2: Adicionar variáveis de gradiente (não são cores, ficam fora do `@theme`) e utilitárias**

Adicionar dentro do bloco `:root { ... }` existente, no final (antes do `}` de fechamento):

```css
  --panel-gradient: linear-gradient(180deg, #1D222D 0%, #232937 100%);
  --card-gradient: linear-gradient(160deg, #252B38 0%, #2D3444 100%);
  --divider-glow: linear-gradient(90deg, transparent, rgba(76, 140, 255, .4), transparent);
```

E adicionar um novo `@layer utilities` no final do arquivo:

```css
@layer utilities {
  .bg-panel-gradient {
    background: var(--panel-gradient);
  }
  .bg-card-gradient {
    background: var(--card-gradient);
  }
  .divider-glow {
    height: 1px;
    background: var(--divider-glow);
  }
}
```

- [x] **Step 3: Fundo radial do body + cor de seleção de texto**

Dentro do `@layer base { ... }` existente, trocar a regra `body { @apply bg-background text-foreground; }` por:

```css
  body {
    background: radial-gradient(120% 90% at 50% 0%, #202737 0%, #161A22 48%);
    @apply text-foreground;
  }
```

E adicionar, ainda dentro de `@layer base`, depois da regra de `html`:

```css
  ::selection {
    background: var(--primary);
    color: #fff;
  }
```

- [x] **Step 4: Verificar que o build não quebra**

Run: `bun run build`
Expected: build conclui sem erro (pode haver warnings sobre imagens remotas — resolvido no Task 2).

- [x] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add prototype design tokens (raw colors, shadows, breakpoint) to globals.css"
```

---

### Task 2: `next.config.ts` — liberar imagens remotas

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `next/image` funcional para URLs `picsum.photos` (seed) e do bucket Supabase Storage (`*.supabase.co/storage/v1/object/public/**`, ainda sem uso nesta fase, mas necessário assim que a Fase 2 subir imagem real).

- [x] **Step 1: Editar `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

- [x] **Step 2: Verificar**

Run: `bun run build`
Expected: build conclui sem erro de configuração de imagem.

- [x] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow remote images from picsum.photos and Supabase Storage"
```

---

### Task 3: Instalar primitivos shadcn necessários

**Files:**
- Create: `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/avatar.tsx`, `components/ui/separator.tsx`, `components/ui/sheet.tsx`, `components/ui/carousel.tsx`
- Modify: `package.json`, `bun.lock` (dependência transitiva `embla-carousel-react`)

**Interfaces:**
- Produces: `Card`/`CardHeader`/`CardContent`/`CardFooter` (de `@/components/ui/card`), `Badge`/`badgeVariants` (de `@/components/ui/badge`), `Avatar`/`AvatarImage`/`AvatarFallback` (de `@/components/ui/avatar`), `Separator` (de `@/components/ui/separator`), `Sheet`/`SheetTrigger`/`SheetContent`/`SheetHeader`/`SheetTitle`/`SheetClose` (de `@/components/ui/sheet`), `Carousel`/`CarouselContent`/`CarouselItem`/`CarouselPrevious`/`CarouselNext` (de `@/components/ui/carousel`).

Já verificado nesta sessão (primeira execução real do CLI 4.13.1 neste projeto — pendência do CLAUDE.md §10): `--yes` evita qualquer prompt interativo.

- [x] **Step 1: Rodar o instalador**

Run: `bunx shadcn@latest add card badge avatar separator sheet carousel --yes`
Expected (confirmado nesta sessão):
```
✔ Checking registry.
✔ Installing dependencies.
✔ Created 6 files:
  - components/ui/card.tsx
  - components/ui/badge.tsx
  - components/ui/avatar.tsx
  - components/ui/separator.tsx
  - components/ui/sheet.tsx
  - components/ui/carousel.tsx
ℹ Skipped 1 file: (files might be identical, use --overwrite to overwrite)
  - components/ui/button.tsx
```
(`embla-carousel-react` entra como dependência nova em `package.json`.)

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erros novos introduzidos pelos arquivos gerados.

- [x] **Step 3: Commit**

```bash
git add components/ui/card.tsx components/ui/badge.tsx components/ui/avatar.tsx components/ui/separator.tsx components/ui/sheet.tsx components/ui/carousel.tsx package.json bun.lock
git commit -m "feat: add shadcn card, badge, avatar, separator, sheet and carousel primitives"
```

---

### Task 4: Variantes `presencial`/`online` no Badge

**Files:**
- Modify: `components/ui/badge.tsx`

**Interfaces:**
- Consumes: `badgeVariants` cva object já gerado no Task 3.
- Produces: `<Badge variant="presencial">`/`<Badge variant="online">` — usados por `AgendaBadge` (Task 21).

Ajuste de tema explicitamente permitido pelo CLAUDE.md §4/§6 em arquivos `components/ui/` (gerado, mas "ajustes de tema" são ok).

- [x] **Step 1: Adicionar as duas variantes**

Em `components/ui/badge.tsx`, dentro de `variants.variant`, adicionar (depois de `link: ...`):

```ts
        presencial: "bg-primary text-primary-foreground shadow-sm",
        online:
          "border border-border-strong bg-background/70 text-foreground backdrop-blur-sm",
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro (as duas chaves novas em `variants.variant` são inferidas automaticamente por `VariantProps<typeof badgeVariants>`).

- [x] **Step 3: Commit**

```bash
git add components/ui/badge.tsx
git commit -m "feat: add presencial/online badge variants for agenda items"
```

---

### Task 5: `lib/format/price.ts` — formatação de preço (TDD)

**Files:**
- Create: `lib/format/price.ts`
- Test: `lib/format/price.test.ts`

**Interfaces:**
- Produces: `formatPriceBRL(price: number | string): string`.

- [x] **Step 1: Escrever o teste que falha**

```ts
// lib/format/price.test.ts
import { describe, it, expect } from 'bun:test'
import { formatPriceBRL } from './price'

describe('formatPriceBRL', () => {
  it('formats a decimal string as BRL currency', () => {
    expect(formatPriceBRL('49.9')).toMatch(/^R\$\s?49,90$/)
  })

  it('formats a whole number without cent rounding errors', () => {
    expect(formatPriceBRL(120)).toMatch(/^R\$\s?120,00$/)
  })
})
```

- [x] **Step 2: Rodar e confirmar que falha**

Run: `bun test lib/format/price.test.ts`
Expected: FAIL — `Cannot find module './price'`.

- [x] **Step 3: Implementar**

```ts
// lib/format/price.ts
export function formatPriceBRL(price: number | string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(price))
}
```

- [x] **Step 4: Rodar e confirmar que passa**

Run: `bun test lib/format/price.test.ts`
Expected: PASS (2 testes).

- [x] **Step 5: Commit**

```bash
git add lib/format/price.ts lib/format/price.test.ts
git commit -m "feat: add formatPriceBRL pure formatter with tests"
```

---

### Task 6: `lib/format/date.ts` — expiração de agenda (TDD, FR-7)

**Files:**
- Create: `lib/format/date.ts`
- Test: `lib/format/date.test.ts`

**Interfaces:**
- Produces: `isAgendaItemVisible(item: { isPublished: boolean; date: Date }, now: Date): boolean`, `sortByOrder<T extends { order: number }>(items: T[]): T[]`.

- [x] **Step 1: Escrever os testes que falham**

```ts
// lib/format/date.test.ts
import { describe, it, expect } from 'bun:test'
import { isAgendaItemVisible, sortByOrder } from './date'

describe('isAgendaItemVisible', () => {
  const now = new Date('2026-07-19T12:00:00Z')

  it('is true when published and date is in the future', () => {
    expect(
      isAgendaItemVisible({ isPublished: true, date: new Date('2026-08-01') }, now),
    ).toBe(true)
  })

  it('is false when published but date already passed', () => {
    expect(
      isAgendaItemVisible({ isPublished: true, date: new Date('2026-01-01') }, now),
    ).toBe(false)
  })

  it('is false when unpublished even if date is in the future', () => {
    expect(
      isAgendaItemVisible({ isPublished: false, date: new Date('2026-08-01') }, now),
    ).toBe(false)
  })

  it('is false when unpublished and date already passed', () => {
    expect(
      isAgendaItemVisible({ isPublished: false, date: new Date('2026-01-01') }, now),
    ).toBe(false)
  })
})

describe('sortByOrder', () => {
  it('sorts ascending by the order field without mutating the input', () => {
    const input = [
      { order: 2, id: 'b' },
      { order: 0, id: 'a' },
      { order: 1, id: 'c' },
    ]
    const result = sortByOrder(input)
    expect(result.map((item) => item.id)).toEqual(['a', 'c', 'b'])
    expect(input.map((item) => item.id)).toEqual(['b', 'a', 'c'])
  })
})
```

- [x] **Step 2: Rodar e confirmar que falha**

Run: `bun test lib/format/date.test.ts`
Expected: FAIL — `Cannot find module './date'`.

- [x] **Step 3: Implementar**

```ts
// lib/format/date.ts
export function isAgendaItemVisible(
  item: { isPublished: boolean; date: Date },
  now: Date,
): boolean {
  return item.isPublished && item.date.getTime() >= now.getTime()
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}
```

- [x] **Step 4: Rodar e confirmar que passa**

Run: `bun test lib/format/date.test.ts`
Expected: PASS (5 testes).

- [x] **Step 5: Commit**

```bash
git add lib/format/date.ts lib/format/date.test.ts
git commit -m "feat: add agenda visibility/sort pure helpers with tests"
```

---

### Task 7: `lib/pix/crc16.ts` — checksum CRC16-CCITT-FALSE (TDD)

**Files:**
- Create: `lib/pix/crc16.ts`
- Test: `lib/pix/crc16.test.ts`

**Interfaces:**
- Produces: `crc16ccitt(input: string): string` (retorna 4 chars hex maiúsculo).

- [x] **Step 1: Escrever o teste que falha**

Usamos o valor de referência padrão (documentado publicamente) do CRC-16/CCITT-FALSE para a string de teste `"123456789"` — não é um fixture nosso, é a constante de verificação do algoritmo em si.

```ts
// lib/pix/crc16.test.ts
import { describe, it, expect } from 'bun:test'
import { crc16ccitt } from './crc16'

describe('crc16ccitt', () => {
  it('matches the standard CRC-16/CCITT-FALSE check value for "123456789"', () => {
    expect(crc16ccitt('123456789')).toBe('29B1')
  })

  it('returns a 4-character uppercase hex string', () => {
    expect(crc16ccitt('abc')).toMatch(/^[0-9A-F]{4}$/)
  })
})
```

- [x] **Step 2: Rodar e confirmar que falha**

Run: `bun test lib/pix/crc16.test.ts`
Expected: FAIL — `Cannot find module './crc16'`.

- [x] **Step 3: Implementar**

```ts
// lib/pix/crc16.ts
export function crc16ccitt(input: string): string {
  let crc = 0xffff

  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8

    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}
```

- [x] **Step 4: Rodar e confirmar que passa**

Run: `bun test lib/pix/crc16.test.ts`
Expected: PASS (2 testes).

- [x] **Step 5: Commit**

```bash
git add lib/pix/crc16.ts lib/pix/crc16.test.ts
git commit -m "feat: add CRC16/CCITT-FALSE checksum with standard test vector"
```

---

### Task 8: `lib/pix/br-code.ts` — payload BR Code/EMV (TDD, FR-16)

**Files:**
- Create: `lib/pix/br-code.ts`
- Test: `lib/pix/br-code.test.ts`

**Interfaces:**
- Consumes: `crc16ccitt` de `./crc16` (Task 7).
- Produces: `buildPixPayload(params: { key: string; merchantName: string; merchantCity: string }): string` — usado por `PixCard` (Task 29).

- [x] **Step 1: Escrever os testes que falham**

```ts
// lib/pix/br-code.test.ts
import { describe, it, expect } from 'bun:test'
import { buildPixPayload } from './br-code'
import { crc16ccitt } from './crc16'

describe('buildPixPayload', () => {
  const payload = buildPixPayload({
    key: 'financeiro@example.org',
    merchantName: 'Ministerio Seja Livre',
    merchantCity: 'SAO PAULO',
  })

  it('starts with the fixed payload format indicator (tag 00, value "01")', () => {
    expect(payload.startsWith('000201')).toBe(true)
  })

  it('embeds the Pix key inside the merchant account info field', () => {
    expect(payload).toContain('financeiro@example.org')
  })

  it('embeds merchant name and city in upper case', () => {
    expect(payload).toContain('MINISTERIO SEJA LIVRE')
    expect(payload).toContain('SAO PAULO')
  })

  it('ends with a CRC16 that matches a recomputation over the rest of the payload', () => {
    const withoutCrc = payload.slice(0, -4)
    const crc = payload.slice(-4)
    expect(crc).toBe(crc16ccitt(withoutCrc))
  })
})
```

- [x] **Step 2: Rodar e confirmar que falha**

Run: `bun test lib/pix/br-code.test.ts`
Expected: FAIL — `Cannot find module './br-code'`.

- [x] **Step 3: Implementar**

```ts
// lib/pix/br-code.ts
import { crc16ccitt } from './crc16'

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`
}

export function buildPixPayload(params: {
  key: string
  merchantName: string
  merchantCity: string
}): string {
  const merchantAccountInfo = emvField('00', 'br.gov.bcb.pix') + emvField('01', params.key)
  const additionalData = emvField('05', '***')

  const payloadWithoutCrc =
    emvField('00', '01') +
    emvField('26', merchantAccountInfo) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('58', 'BR') +
    emvField('59', params.merchantName.slice(0, 25).toUpperCase()) +
    emvField('60', params.merchantCity.slice(0, 15).toUpperCase()) +
    emvField('62', additionalData) +
    '6304'

  return payloadWithoutCrc + crc16ccitt(payloadWithoutCrc)
}
```

- [x] **Step 4: Rodar e confirmar que passa**

Run: `bun test lib/pix/br-code.test.ts`
Expected: PASS (4 testes).

- [x] **Step 5: Commit**

```bash
git add lib/pix/br-code.ts lib/pix/br-code.test.ts
git commit -m "feat: add Pix BR Code/EMV payload builder with tests"
```

**Nota de verificação manual (não automatizável em CI):** depois que o `PixCard` (Task 29) estiver renderizando, escanear o QR de verdade com um app bancário no celular (via `bun run dev` + rede local) e confirmar que ele reconhece a chave/nome/cidade cadastrados. Isso valida a interoperabilidade real com apps Pix, coisa que um teste unitário não cobre. Fazer isso no Task 34 (verificação visual mobile).

---

### Task 9: Expandir `prisma/seed.ts`

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces: 3 `AboutPillar` (`icon` ∈ `'file-text' | 'clock' | 'user-plus'`, consumidos pelo mapa de ícones do Task 17), 4 `AgendaItem` (mistura `presencial`/`online`, com casos de expiração), 1 `Book`, 4 `Testimonial`.

- [x] **Step 1: Adicionar os novos upserts em `prisma/seed.ts`**

Adicionar dentro de `main()`, depois do upsert de `pastorProfile` e antes do de `videoHighlight`:

```ts
  await prisma.aboutPillar.createMany({
    data: [
      {
        icon: 'file-text',
        title: 'Palavra viva',
        description: 'Pregação bíblica clara e aplicável, semana após semana, presencial e online.',
        order: 0,
      },
      {
        icon: 'clock',
        title: 'Libertação e cura interior',
        description: 'Cultos e mentorias dedicados a restaurar corações e romper ciclos de dor.',
        order: 1,
      },
      {
        icon: 'user-plus',
        title: 'Formação de líderes',
        description: 'Mentorias que preparam novos libertadores para servir suas próprias comunidades.',
        order: 2,
      },
    ],
    skipDuplicates: true,
  })

  const now = Date.now()
  const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000)

  await prisma.agendaItem.createMany({
    data: [
      {
        title: 'Culto de Libertação',
        type: 'presencial',
        date: days(-3),
        dateLabel: 'Qui, 17 de julho · 19h30',
        location: 'Templo Vida em Aliança — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-culto/680/510',
        linkUrl: '#agenda',
        order: 0,
        isPublished: true,
      },
      {
        title: 'Mentoria de Líderes',
        type: 'presencial',
        date: days(7),
        dateLabel: 'Sáb, 26 de julho · 09h00',
        location: 'Centro de Treinamento — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-mentoria/680/510',
        linkUrl: '#agenda',
        order: 1,
        isPublished: true,
      },
      {
        title: 'Pregação: Vidas Restauradas',
        type: 'online',
        date: days(15),
        dateLabel: 'Dom, 3 de agosto · 18h00',
        location: 'Transmissão ao vivo — YouTube',
        imageUrl: 'https://picsum.photos/seed/agenda-pregacao/680/510',
        linkUrl: '#agenda',
        order: 2,
        isPublished: true,
      },
      {
        title: 'Culto de Celebração (encerrado)',
        type: 'presencial',
        date: days(-30),
        dateLabel: 'Dom, 21 de junho · 10h00',
        location: 'Templo Vida em Aliança — São Paulo/SP',
        imageUrl: 'https://picsum.photos/seed/agenda-celebracao/680/510',
        linkUrl: '#agenda',
        order: 3,
        isPublished: false,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.book.createMany({
    data: [
      {
        title: 'Libertos Para Libertar',
        subtitle: 'Um chamado para formar novos libertadores',
        description:
          'Neste livro, o Pastor Xurdir compartilha histórias reais de restauração e apresenta um caminho prático para quem deseja não apenas ser curado, mas se tornar instrumento de cura para outros.',
        price: '49.90',
        coverImageUrl: 'https://picsum.photos/seed/livro-capa/440/640',
        buyUrl: 'https://example.org/comprar/libertos-para-libertar',
        order: 0,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.testimonial.createMany({
    data: [
      {
        quote:
          'Encontrei libertação de anos de ansiedade depois de participar das mentorias. Minha família nunca mais foi a mesma.',
        name: 'Mariana Alves',
        role: 'Membro desde 2021',
        initials: 'MA',
        avatarColor: '#3159C7',
        order: 0,
        isPublished: true,
      },
      {
        quote:
          'O Pastor Xurdir me ensinou não só a receber cura, mas a levar essa cura para outros. Hoje sirvo como líder de célula.',
        name: 'Roberto Lima',
        role: 'Líder de célula',
        initials: 'RL',
        avatarColor: '#4C8CFF',
        order: 1,
        isPublished: true,
      },
      {
        quote:
          'A palavra pregada aqui é direta e transformadora. Cada culto renova minha esperança.',
        name: 'Fernanda Costa',
        role: 'Membro desde 2019',
        initials: 'FC',
        avatarColor: '#293868',
        order: 2,
        isPublished: true,
      },
      {
        quote:
          'Cheguei sem esperança e encontrei uma família. A mentoria de líderes mudou o rumo do meu ministério.',
        name: 'Diego Santos',
        role: 'Membro desde 2022',
        initials: 'DS',
        avatarColor: '#6A9FFF',
        order: 3,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  })
```

- [x] **Step 2: Rodar o seed contra o banco real**

Run: `bunx prisma db seed`
Expected: log final `Seed concluído.` sem erro.

- [x] **Step 3: Conferir contagem via Supabase MCP**

Usar a tool `mcp__plugin_supabase_supabase__execute_sql` com:
```sql
select
  (select count(*) from "AboutPillar") as pillars,
  (select count(*) from "AgendaItem") as agenda,
  (select count(*) from "Book") as books,
  (select count(*) from "Testimonial") as testimonials;
```
Expected: `pillars=3, agenda=4, books=1, testimonials=4`.

- [x] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: expand seed with realistic AboutPillar, AgendaItem, Book and Testimonial data"
```

---

### Task 10: `lib/content/about.ts`

**Files:**
- Create: `lib/content/about.ts`

**Interfaces:**
- Consumes: `prisma` de `@/lib/prisma` (Fase 0).
- Produces: `getPastorProfile(): Promise<PastorProfile>`, `getAboutPillars(): Promise<AboutPillar[]>` — tag de cache `"about"`.

- [x] **Step 1: Implementar**

```ts
// lib/content/about.ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { PastorProfile, AboutPillar } from '@/lib/generated/prisma/client'

export const getPastorProfile = unstable_cache(
  async (): Promise<PastorProfile> => {
    return prisma.pastorProfile.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['pastor-profile'],
  { tags: ['about'] },
)

export const getAboutPillars = unstable_cache(
  async (): Promise<AboutPillar[]> => {
    return prisma.aboutPillar.findMany({ orderBy: { order: 'asc' } })
  },
  ['about-pillars'],
  { tags: ['about'] },
)
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add lib/content/about.ts
git commit -m "feat: add cached content readers for pastor profile and about pillars"
```

---

### Task 11: `lib/content/agenda.ts`

**Files:**
- Create: `lib/content/agenda.ts`

**Interfaces:**
- Consumes: `isAgendaItemVisible` de `@/lib/format/date` (Task 6).
- Produces: `getAgendaItems(): Promise<AgendaItem[]>` — já filtrado por `isPublished`+data e ordenado, tag `"agenda"`.

- [x] **Step 1: Implementar**

```ts
// lib/content/agenda.ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isAgendaItemVisible } from '@/lib/format/date'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export const getAgendaItems = unstable_cache(
  async (): Promise<AgendaItem[]> => {
    const items = await prisma.agendaItem.findMany({ orderBy: { order: 'asc' } })
    const now = new Date()
    return items.filter((item) => isAgendaItemVisible(item, now))
  },
  ['agenda-items'],
  { tags: ['agenda'] },
)
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add lib/content/agenda.ts
git commit -m "feat: add cached agenda reader with visibility filter"
```

---

### Task 12: `lib/content/books.ts`, `lib/content/video.ts`, `lib/content/testimonials.ts`, `lib/content/offerings.ts`, `lib/content/footer.ts`

**Files:**
- Create: `lib/content/books.ts`, `lib/content/video.ts`, `lib/content/testimonials.ts`, `lib/content/offerings.ts`, `lib/content/footer.ts`

**Interfaces:**
- Produces: `getBooks(): Promise<Book[]>` (tag `"books"`), `getVideoHighlight(): Promise<VideoHighlight>` (tag `"video"`), `getTestimonials(): Promise<Testimonial[]>` (tag `"testimonials"`), `getOfferingSettings(): Promise<OfferingSettings>` (tag `"offerings"`), `getFooterSettings(): Promise<FooterSettings>` (tag `"footer"`).

- [x] **Step 1: `lib/content/books.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Book } from '@/lib/generated/prisma/client'

export const getBooks = unstable_cache(
  async (): Promise<Book[]> => {
    return prisma.book.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } })
  },
  ['books'],
  { tags: ['books'] },
)
```

- [x] **Step 2: `lib/content/video.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export const getVideoHighlight = unstable_cache(
  async (): Promise<VideoHighlight> => {
    return prisma.videoHighlight.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['video-highlight'],
  { tags: ['video'] },
)
```

- [x] **Step 3: `lib/content/testimonials.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Testimonial } from '@/lib/generated/prisma/client'

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    return prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    })
  },
  ['testimonials'],
  { tags: ['testimonials'] },
)
```

- [x] **Step 4: `lib/content/offerings.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { OfferingSettings } from '@/lib/generated/prisma/client'

export const getOfferingSettings = unstable_cache(
  async (): Promise<OfferingSettings> => {
    return prisma.offeringSettings.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['offering-settings'],
  { tags: ['offerings'] },
)
```

- [x] **Step 5: `lib/content/footer.ts`**

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { FooterSettings } from '@/lib/generated/prisma/client'

export const getFooterSettings = unstable_cache(
  async (): Promise<FooterSettings> => {
    return prisma.footerSettings.findUniqueOrThrow({ where: { id: 'singleton' } })
  },
  ['footer-settings'],
  { tags: ['footer'] },
)
```

- [x] **Step 6: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 7: Commit**

```bash
git add lib/content/books.ts lib/content/video.ts lib/content/testimonials.ts lib/content/offerings.ts lib/content/footer.ts
git commit -m "feat: add cached content readers for books, video, testimonials, offerings and footer"
```

---

### Task 13: `lib/icons/pillar-icons.tsx`

**Files:**
- Create: `lib/icons/pillar-icons.tsx`

**Interfaces:**
- Produces: `getPillarIcon(slug: string): LucideIcon` — usado por `AboutSection` (Task 19). Slugs suportados: `'file-text' | 'clock' | 'user-plus'` (batem com o seed do Task 9); qualquer outro slug cai no fallback `Sparkles`.

- [x] **Step 1: Implementar**

```tsx
// lib/icons/pillar-icons.tsx
import { FileText, Clock, UserPlus, Sparkles, type LucideIcon } from 'lucide-react'

const PILLAR_ICONS: Record<string, LucideIcon> = {
  'file-text': FileText,
  clock: Clock,
  'user-plus': UserPlus,
}

export function getPillarIcon(slug: string): LucideIcon {
  return PILLAR_ICONS[slug] ?? Sparkles
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add lib/icons/pillar-icons.tsx
git commit -m "feat: add slug-to-lucide-icon map for about pillars"
```

---

### Task 14: `components/navbar/navbar.tsx` + `mobile-menu.tsx`

**Files:**
- Create: `components/navbar/navbar.tsx`, `components/navbar/mobile-menu.tsx`

**Interfaces:**
- Consumes: `Button`/`buttonVariants` de `@/components/ui/button`, `Sheet*` de `@/components/ui/sheet` (Task 3), `cn` de `@/lib/utils`.
- Produces: `<Navbar />` (Server Component, sem props) — usado por `app/page.tsx` (Task 31). Itens de navegação (confirmado contra o protótipo, não só o texto do PRD §4 — ver spec §1): Sobre `#sobre`, Agenda `#agenda`, Palavra `#video`, Livros `#livros`, Depoimentos `#depoimentos`, Ofertas `#ofertas`.

- [x] **Step 1: `components/navbar/mobile-menu.tsx`**

```tsx
'use client'

import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type NavItem = { label: string; href: string }

export function MobileMenu({ items }: { items: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'nav:hidden')}
      >
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Seja Livre</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <SheetClose
              key={item.href}
              render={<a href={item.href} />}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <SheetClose
            render={<a href="#agenda" />}
            className={cn(buttonVariants(), 'w-full rounded-full')}
          >
            Fale Conosco
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [x] **Step 2: `components/navbar/navbar.tsx`**

```tsx
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'

const NAV_ITEMS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Palavra', href: '#video' },
  { label: 'Livros', href: '#livros' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Ofertas', href: '#ofertas' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#hero" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
            SL
          </span>
          <span className="font-heading text-lg font-semibold text-foreground">Seja Livre</span>
        </a>

        <nav className="hidden items-center gap-8 nav:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden nav:block">
          <Button render={<a href="#agenda" />} className="rounded-full">
            Fale Conosco
          </Button>
        </div>

        <MobileMenu items={NAV_ITEMS} />
      </div>
    </header>
  )
}
```

- [x] **Step 3: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 4: Commit**

```bash
git add components/navbar/navbar.tsx components/navbar/mobile-menu.tsx
git commit -m "feat: add navbar with mobile Sheet menu"
```

---

### Task 15: `components/about/hero-section.tsx`

**Files:**
- Create: `components/about/hero-section.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/button`, tipo `PastorProfile` de `@/lib/generated/prisma/client`.
- Produces: `<HeroSection profile={profile} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/about/hero-section.tsx
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { PastorProfile } from '@/lib/generated/prisma/client'

export function HeroSection({ profile }: { profile: PastorProfile }) {
  return (
    <section id="hero" className="relative flex min-h-[640px] items-center overflow-hidden">
      <Image
        src={profile.heroPhotoUrl}
        alt="Pastor Xurdir"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-popover to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-background/60 px-4 py-1.5 text-xs font-bold tracking-wide text-foreground uppercase">
          <span className="size-1.5 rounded-full bg-blue-accent" />
          Ministério Seja Livre
        </span>

        <h1 className="max-w-2xl font-heading text-[clamp(36px,5vw,58px)] leading-[1.1] font-semibold text-foreground">
          {profile.heroHeadline}
        </h1>
        <p className="max-w-2xl font-caveat text-[1.25em] leading-[1.25em] text-primary">
          {profile.heroHighlight}
        </p>

        <p className="mt-6 max-w-xl text-base leading-[1.7] text-text-secondary">
          {profile.heroIntro}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button render={<a href="#video" />} className="rounded-full">
            Assista à última pregação
          </Button>
          <Button
            render={<a href="#agenda" />}
            variant="outline"
            className="rounded-full border-border-strong"
          >
            Ver agenda completa
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/about/hero-section.tsx
git commit -m "feat: add hero section reading PastorProfile"
```

---

### Task 16: `components/about/about-section.tsx`

**Files:**
- Create: `components/about/about-section.tsx`

**Interfaces:**
- Consumes: `Card` de `@/components/ui/card`, `getPillarIcon` de `@/lib/icons/pillar-icons` (Task 13), tipos `PastorProfile`/`AboutPillar`.
- Produces: `<AboutSection profile={profile} pillars={pillars} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/about/about-section.tsx
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { getPillarIcon } from '@/lib/icons/pillar-icons'
import type { PastorProfile, AboutPillar } from '@/lib/generated/prisma/client'

export function AboutSection({
  profile,
  pillars,
}: {
  profile: PastorProfile
  pillars: AboutPillar[]
}) {
  return (
    <section id="sobre" className="bg-popover py-[88px]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 nav:grid-cols-[1fr_320px]">
          <div className="text-center nav:text-left">
            <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
              {profile.aboutEyebrow}
            </p>
            <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
              {profile.aboutHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-text-secondary nav:mx-0">
              {profile.aboutIntro}
            </p>
          </div>

          <div className="relative mx-auto aspect-4/3 w-full max-w-[280px] overflow-hidden rounded-lg shadow-md">
            <Image
              src={profile.familyPhotoUrl}
              alt="Família do Pastor Xurdir"
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>
        </div>

        <div
          className="mt-12 grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.icon)
            return (
              <Card key={pillar.id} className="bg-card-gradient p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.65] text-text-secondary">
                  {pillar.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/about/about-section.tsx
git commit -m "feat: add about section with family photo and pillar cards"
```

---

### Task 17: `components/agenda/agenda-badge.tsx`

**Files:**
- Create: `components/agenda/agenda-badge.tsx`

**Interfaces:**
- Consumes: `Badge` de `@/components/ui/badge` com variants `presencial`/`online` (Task 4), tipo `AgendaType` de `@/lib/generated/prisma/client`.
- Produces: `<AgendaBadge type={item.type} />` — usado por `AgendaCard` (Task 18).

- [x] **Step 1: Implementar**

```tsx
// components/agenda/agenda-badge.tsx
import { Badge } from '@/components/ui/badge'
import type { AgendaType } from '@/lib/generated/prisma/client'

const LABELS: Record<AgendaType, string> = {
  presencial: 'Presencial',
  online: 'Online',
}

export function AgendaBadge({ type }: { type: AgendaType }) {
  return (
    <Badge variant={type} className="absolute top-4 left-4 uppercase">
      {LABELS[type]}
    </Badge>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/agenda/agenda-badge.tsx
git commit -m "feat: add agenda badge for presencial/online types"
```

---

### Task 18: `components/agenda/agenda-card.tsx`

**Files:**
- Create: `components/agenda/agenda-card.tsx`

**Interfaces:**
- Consumes: `Card` de `@/components/ui/card`, `AgendaBadge` (Task 17), tipo `AgendaItem`.
- Produces: `<AgendaCard item={item} />` — usado por `AgendaCarousel` (Task 20).

- [x] **Step 1: Implementar**

```tsx
// components/agenda/agenda-card.tsx
import Image from 'next/image'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AgendaBadge } from './agenda-badge'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaCard({ item }: { item: AgendaItem }) {
  return (
    <Card className="w-[340px] shrink-0 gap-0 bg-card-gradient p-0">
      <div className="relative aspect-4/3 w-full">
        <Image src={item.imageUrl} alt={item.title} fill sizes="340px" className="object-cover" />
        <AgendaBadge type={item.type} />
      </div>
      <div className="flex flex-col gap-3 px-5 py-5">
        <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="size-4" /> {item.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" /> {item.location}
          </span>
        </div>
        <a
          href={item.linkUrl}
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-accent-text hover:text-blue-accent-hover"
        >
          Saiba mais <ArrowRight className="size-4" />
        </a>
      </div>
    </Card>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/agenda/agenda-card.tsx
git commit -m "feat: add agenda card"
```

---

### Task 19: `components/agenda/agenda-carousel.tsx`

**Files:**
- Create: `components/agenda/agenda-carousel.tsx`

**Interfaces:**
- Consumes: `Carousel`/`CarouselContent`/`CarouselItem`/`CarouselPrevious`/`CarouselNext` de `@/components/ui/carousel` (Task 3), `AgendaCard` (Task 18).
- Produces: `<AgendaCarousel items={items} />` (client) — usado por `AgendaSection` (Task 20).

- [x] **Step 1: Implementar**

```tsx
// components/agenda/agenda-carousel.tsx
'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { AgendaCard } from './agenda-card'
import type { AgendaItem } from '@/lib/generated/prisma/client'

export function AgendaCarousel({ items }: { items: AgendaItem[] }) {
  return (
    <Carousel opts={{ align: 'start', dragFree: true }} className="mt-8">
      <CarouselContent className="-ml-6">
        {items.map((item) => (
          <CarouselItem key={item.id} className="basis-auto pl-6">
            <AgendaCard item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-end gap-2">
        <CarouselPrevious className="static translate-x-0" />
        <CarouselNext className="static translate-x-0" />
      </div>
    </Carousel>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/agenda/agenda-carousel.tsx
git commit -m "feat: add agenda carousel using shadcn Carousel (Embla)"
```

---

### Task 20: `components/agenda/agenda-section.tsx`

**Files:**
- Create: `components/agenda/agenda-section.tsx`

**Interfaces:**
- Consumes: `AgendaCarousel` (Task 19).
- Produces: `<AgendaSection items={items} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/agenda/agenda-section.tsx
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
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/agenda/agenda-section.tsx
git commit -m "feat: add agenda section"
```

---

### Task 21: `components/video/video-section.tsx`

**Files:**
- Create: `components/video/video-section.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/button`, tipo `VideoHighlight`.
- Produces: `<VideoSection video={video} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/video/video-section.tsx
import Image from 'next/image'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export function VideoSection({ video }: { video: VideoHighlight }) {
  return (
    <section id="video" className="bg-popover py-[88px]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 nav:grid-cols-2">
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-video overflow-hidden rounded-lg shadow-md"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 860px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-background">
              <Play className="size-6 fill-current" />
            </span>
          </div>
          <span className="absolute right-4 bottom-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground">
            {video.durationLabel}
          </span>
        </a>

        <div>
          <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
            {video.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
            {video.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-[1.7] text-text-secondary">
            {video.description}
          </p>
          <Button
            render={<a href={video.videoUrl} target="_blank" rel="noopener noreferrer" />}
            className="mt-6 rounded-full"
          >
            {video.ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/video/video-section.tsx
git commit -m "feat: add video highlight section"
```

---

### Task 22: `components/books/book-card.tsx` + `books-section.tsx`

**Files:**
- Create: `components/books/book-card.tsx`, `components/books/books-section.tsx`

**Interfaces:**
- Consumes: `Card`/`Button` de `@/components/ui`, `formatPriceBRL` de `@/lib/format/price` (Task 5).
- Produces: `<BooksSection books={books} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: `components/books/book-card.tsx`**

```tsx
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
```

- [x] **Step 2: `components/books/books-section.tsx`**

```tsx
import { BookCard } from './book-card'
import type { Book } from '@/lib/generated/prisma/client'

export function BooksSection({ books }: { books: Book[] }) {
  return (
    <section id="livros" className="bg-background py-[88px]">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">Livros</p>
        <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
          Leituras para a jornada
        </h2>
      </div>
      <div className="mx-auto mt-10 max-w-4xl px-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}
```

- [x] **Step 3: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 4: Commit**

```bash
git add components/books/book-card.tsx components/books/books-section.tsx
git commit -m "feat: add books section"
```

---

### Task 23: `components/testimonials/testimonial-card.tsx` + `testimonials-section.tsx`

**Files:**
- Create: `components/testimonials/testimonial-card.tsx`, `components/testimonials/testimonials-section.tsx`

**Interfaces:**
- Consumes: `Avatar`/`AvatarFallback`/`Card` de `@/components/ui` (Task 3).
- Produces: `<TestimonialsSection testimonials={testimonials} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: `components/testimonials/testimonial-card.tsx`**

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-card-gradient p-6">
      <p className="text-sm leading-[1.65] text-text-secondary">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <Avatar>
          <AvatarFallback
            style={{ backgroundColor: testimonial.avatarColor }}
            className="font-semibold text-white"
          >
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  )
}
```

- [x] **Step 2: `components/testimonials/testimonials-section.tsx`**

```tsx
import { TestimonialCard } from './testimonial-card'
import type { Testimonial } from '@/lib/generated/prisma/client'

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="depoimentos" className="bg-popover py-[88px]">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
          Depoimentos
        </p>
        <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
          Vidas transformadas
        </h2>
      </div>
      <div
        className="mx-auto mt-10 grid max-w-6xl gap-6 px-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </section>
  )
}
```

- [x] **Step 3: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 4: Commit**

```bash
git add components/testimonials/testimonial-card.tsx components/testimonials/testimonials-section.tsx
git commit -m "feat: add testimonials section"
```

---

### Task 24: `bun add react-qr-code` + `components/offerings/copy-button.tsx`

**Files:**
- Modify: `package.json`, `bun.lock`
- Create: `components/offerings/copy-button.tsx`

**Interfaces:**
- Produces: `<CopyButton value={string} />` (client) — usado por `PixCard` (Task 25).

- [x] **Step 1: Instalar a lib de QR**

Run: `bun add react-qr-code`
Expected: `package.json`/`bun.lock` atualizados, sem erro.

- [x] **Step 2: Implementar o botão de copiar**

```tsx
// components/offerings/copy-button.tsx
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button onClick={handleCopy} size="sm" className="rounded-full">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  )
}
```

- [x] **Step 3: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 4: Commit**

```bash
git add package.json bun.lock components/offerings/copy-button.tsx
git commit -m "feat: add copy-to-clipboard button for the Pix key"
```

---

### Task 25: `components/offerings/pix-card.tsx`

**Files:**
- Create: `components/offerings/pix-card.tsx`

**Interfaces:**
- Consumes: `buildPixPayload` de `@/lib/pix/br-code` (Task 8), `CopyButton` (Task 24), `react-qr-code`.
- Produces: `<PixCard settings={settings} />` (client) — usado por `OfferingsSection` (Task 27).

- [x] **Step 1: Implementar**

```tsx
// components/offerings/pix-card.tsx
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
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/offerings/pix-card.tsx
git commit -m "feat: add Pix card with client-generated QR"
```

---

### Task 26: `components/offerings/bank-card.tsx`

**Files:**
- Create: `components/offerings/bank-card.tsx`

**Interfaces:**
- Consumes: `Card`/`Separator` de `@/components/ui`.
- Produces: `<BankCard title={string} rows={{ label: string; value: string }[]} />` — usado por `OfferingsSection` (Task 27).

- [x] **Step 1: Implementar**

```tsx
// components/offerings/bank-card.tsx
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
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/offerings/bank-card.tsx
git commit -m "feat: add bank details card for offerings section"
```

---

### Task 27: `components/offerings/offerings-section.tsx`

**Files:**
- Create: `components/offerings/offerings-section.tsx`

**Interfaces:**
- Consumes: `PixCard` (Task 25), `BankCard` (Task 26).
- Produces: `<OfferingsSection settings={settings} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/offerings/offerings-section.tsx
import { PixCard } from './pix-card'
import { BankCard } from './bank-card'
import type { OfferingSettings } from '@/lib/generated/prisma/client'

export function OfferingsSection({ settings }: { settings: OfferingSettings }) {
  return (
    <section id="ofertas" className="bg-background py-[88px]">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-bold tracking-[1.3px] text-blue-accent-text uppercase">
          Dízimos e ofertas
        </p>
        <h2 className="mt-3 font-heading text-[clamp(28px,3.6vw,40px)] font-semibold text-foreground">
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
    </section>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/offerings/offerings-section.tsx
git commit -m "feat: add offerings section (Pix + national + international accounts)"
```

---

### Task 28: `components/footer/footer.tsx`

**Files:**
- Create: `components/footer/footer.tsx`

**Interfaces:**
- Produces: `<Footer settings={settings} />` — usado por `app/page.tsx` (Task 31).

- [x] **Step 1: Implementar**

```tsx
// components/footer/footer.tsx
import { Instagram, Youtube, MessageCircle } from 'lucide-react'
import type { FooterSettings } from '@/lib/generated/prisma/client'

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Livros', href: '#livros' },
  { label: 'Ofertas', href: '#ofertas' },
]

export function Footer({ settings }: { settings: FooterSettings }) {
  return (
    <footer className="bg-popover">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 nav:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
                SL
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">Seja Livre</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ministério Seja Livre — CNPJ {settings.cnpj}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{settings.address}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Ministério</h3>
            <nav className="mt-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Redes sociais</h3>
            <div className="mt-4 flex gap-3">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-blue-accent hover:text-blue-accent"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 nav:flex-row nav:items-center nav:justify-between">
          <p className="text-xs text-muted-foreground">{settings.copyrightText}</p>
          <p className="text-xs text-muted-foreground">Feito com fé e propósito.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [x] **Step 2: Verificar tipos**

Run: `bunx tsc --noEmit`
Expected: sem erro.

- [x] **Step 3: Commit**

```bash
git add components/footer/footer.tsx
git commit -m "feat: add footer with social links and copyright"
```

---

### Task 29: Montar `app/page.tsx`

**Files:**
- Modify: `app/page.tsx` (substitui o conteúdo placeholder do `create-next-app`)

**Interfaces:**
- Consumes: todas as seções (Tasks 14–28) e todos os `lib/content/*` (Tasks 10–12).
- Produces: página `/` completa.

- [x] **Step 1: Substituir `app/page.tsx`**

```tsx
import { Navbar } from '@/components/navbar/navbar'
import { HeroSection } from '@/components/about/hero-section'
import { AboutSection } from '@/components/about/about-section'
import { AgendaSection } from '@/components/agenda/agenda-section'
import { VideoSection } from '@/components/video/video-section'
import { BooksSection } from '@/components/books/books-section'
import { TestimonialsSection } from '@/components/testimonials/testimonials-section'
import { OfferingsSection } from '@/components/offerings/offerings-section'
import { Footer } from '@/components/footer/footer'
import { getPastorProfile, getAboutPillars } from '@/lib/content/about'
import { getAgendaItems } from '@/lib/content/agenda'
import { getBooks } from '@/lib/content/books'
import { getVideoHighlight } from '@/lib/content/video'
import { getTestimonials } from '@/lib/content/testimonials'
import { getOfferingSettings } from '@/lib/content/offerings'
import { getFooterSettings } from '@/lib/content/footer'

export default async function Home() {
  const [profile, pillars, agendaItems, books, video, testimonials, offerings, footer] =
    await Promise.all([
      getPastorProfile(),
      getAboutPillars(),
      getAgendaItems(),
      getBooks(),
      getVideoHighlight(),
      getTestimonials(),
      getOfferingSettings(),
      getFooterSettings(),
    ])

  return (
    <>
      <Navbar />
      <main>
        <HeroSection profile={profile} />
        <AboutSection profile={profile} pillars={pillars} />
        <AgendaSection items={agendaItems} />
        <VideoSection video={video} />
        <BooksSection books={books} />
        <TestimonialsSection testimonials={testimonials} />
        <OfferingsSection settings={offerings} />
      </main>
      <Footer settings={footer} />
    </>
  )
}
```

- [x] **Step 2: Rodar o build**

Run: `bun run build`
Expected: build conclui com sucesso, `/` prerenderizada (Server Component, sem erro de tipo/import).

- [x] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble public homepage from all Fase 1 sections"
```

---

### Task 30: Atualizar `CLAUDE.md` §4 (estrutura de diretórios)

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** nenhuma (documentação).

- [x] **Step 1: Substituir o bloco da árvore de diretórios em `CLAUDE.md` §4**

Trocar:
```
app/
  (public)/            # página única "/", seções como componentes de app/(public)/_sections
  admin/                # rotas protegidas: login, dashboard, CRUD por seção
  layout.tsx            # fontes via next/font, <html class="dark">
components/
  ui/                   # shadcn — gerado via `bunx shadcn@latest add`, não editar à mão além de ajustes de tema
  (demais pastas por domínio, ex.: agenda/, ofertas/, admin/)
lib/
  prisma.ts             # client Prisma singleton (server-only), com driver adapter @prisma/adapter-pg
  supabase/              # server.ts (createServerClient p/ RSC/Actions); client.ts, admin.ts a criar quando precisar
  dal.ts                 # SÓ decisões puras de autorização (resolveAdminAccess, canRemoveAdmin) — zero import, testável sem runtime
  require-admin.ts       # requireAdmin() — wrapper de I/O (Supabase + Prisma) que usa lib/dal.ts; NÃO junte de volta no mesmo arquivo (ver §7)
  generated/prisma/      # output do generator `prisma-client` (não editar, gerado) — importar de `lib/generated/prisma/client`, não do diretório bare (não existe index.ts)
  utils.ts               # cn() já existente
prisma/
  schema.prisma           # datasource sem url/directUrl (Prisma 7) — só `provider = "postgresql"`
  seed.ts
  migrations/
design/                 # NÃO editar — fonte de verdade visual (PDF de tokens + HTML standalone)
proxy.ts                # checagem otimista de sessão para /admin (substitui o antigo middleware.ts)
```

Por:
```
app/
  page.tsx              # home pública "/", compõe as seções de components/<domínio>/
  admin/                # rotas protegidas: login, dashboard, CRUD por seção
  layout.tsx            # fontes via next/font, <html class="dark">
components/
  ui/                   # shadcn — gerado via `bunx shadcn@latest add`, não editar à mão além de ajustes de tema
  navbar/, about/, agenda/, video/, books/, testimonials/, offerings/, footer/, admin/
                        # 1 pasta por domínio (decisão da Fase 1: substitui o app/(public)/_sections/
                        # planejado na Fase 0, nunca chegou a ser usado — alinha com o inventário de
                        # componentes do §5, que já organiza por domínio)
lib/
  prisma.ts             # client Prisma singleton (server-only), com driver adapter @prisma/adapter-pg
  content/              # 1 arquivo por entidade (about.ts, agenda.ts, books.ts, video.ts,
                        # testimonials.ts, offerings.ts, footer.ts) — Prisma + unstable_cache + tag
  pix/                  # crc16.ts + br-code.ts — payload BR Code/EMV do Pix, função pura testada
  format/                # date.ts (visibilidade/ordenação de agenda), price.ts (R$) — funções puras testadas
  icons/                 # pillar-icons.tsx — mapa slug→ícone lucide dos cartões de "Sobre"
  supabase/              # server.ts (createServerClient p/ RSC/Actions); client.ts, admin.ts a criar quando precisar
  dal.ts                 # SÓ decisões puras de autorização (resolveAdminAccess, canRemoveAdmin) — zero import, testável sem runtime
  require-admin.ts       # requireAdmin() — wrapper de I/O (Supabase + Prisma) que usa lib/dal.ts; NÃO junte de volta no mesmo arquivo (ver §7)
  generated/prisma/      # output do generator `prisma-client` (não editar, gerado) — importar de `lib/generated/prisma/client`, não do diretório bare (não existe index.ts)
  utils.ts               # cn() já existente
prisma/
  schema.prisma           # datasource sem url/directUrl (Prisma 7) — só `provider = "postgresql"`
  seed.ts
  migrations/
design/                 # NÃO editar — fonte de verdade visual (PDF de tokens + HTML standalone)
proxy.ts                # checagem otimista de sessão para /admin (substitui o antigo middleware.ts)
```

- [x] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md structure to match Fase 1 components/lib layout"
```

---

### Task 31: Verificação visual — desktop

**Files:** nenhum arquivo de código (verificação manual assistida por Playwright).

- [x] **Step 1: Subir o servidor de dev**

Run: `bun run dev &` (background) — aguardar `Ready` no log.

- [x] **Step 2: Abrir no Playwright em viewport desktop (1600×1200) e navegar**

Usar `mcp__plugin_playwright_playwright__browser_navigate` para `http://localhost:3000`, depois `browser_resize` para `1600x1200`, e `browser_take_screenshot` de cada seção (scroll via `browser_evaluate` com `window.scrollTo`) comparando lado a lado com:
- `design/screenshots/desktop/Screenshot 2026-07-18 at 22.03.01.png` (navbar + hero)
- `design/screenshots/desktop/Screenshot 2026-07-18 at 22.03.13.png` (sobre + agenda)
- `design/screenshots/desktop/Screenshot 2026-07-18 at 22.03.48.png` (vídeo + livros)
- `design/screenshots/desktop/Screenshot 2026-07-18 at 22.04.05.png` (depoimentos + ofertas)
- `design/screenshots/desktop/Screenshot 2026-07-18 at 22.04.18.png` (ofertas + rodapé)

- [x] **Step 3: Ajustar diferenças perceptíveis**

Para qualquer diferença de cor/espaçamento/tipografia encontrada, editar o componente correspondente (Tasks 14–28) diretamente — não é uma task nova, é fechamento das mesmas. Reexecutar Step 2 até bater.

- [x] **Step 4: Confirmar Carousel funcional**

Usar `browser_click` nas setas prev/next da agenda e `browser_snapshot` pra confirmar que o carrossel scrolla (Embla).

- [x] **Step 5: Registrar resultado**

Nenhum commit de código nesta task, a menos que Step 3 tenha gerado ajustes — nesse caso, commitar normalmente:
```bash
git add -A
git commit -m "fix: adjust visual fidelity issues found in desktop verification"
```

---

### Task 32: Verificação visual — mobile + breakpoint 860px + Pix

**Files:** nenhum arquivo de código (verificação manual assistida por Playwright), salvo ajustes.

- [x] **Step 1: Playwright em viewport mobile (390×844)**

`browser_resize` para `390x844`, navegar pela home, comparar com:
- `design/screenshots/mobile/Screenshot 2026-07-18 at 22.04.42.png` (hero)
- `design/screenshots/mobile/Screenshot 2026-07-18 at 22.04.59.png` (sobre)
- `design/screenshots/mobile/Screenshot 2026-07-18 at 22.05.13.png` (pilares + agenda)
- `design/screenshots/mobile/Screenshot 2026-07-18 at 22.07.17.png` (rodapé)

- [x] **Step 2: Testar o menu mobile (Sheet)**

`browser_click` no botão de hambúrguer, `browser_snapshot` pra confirmar que o `Sheet` abre com os 6 itens + CTA, `browser_click` num item e confirmar que fecha e rola até a âncora.

- [x] **Step 3: Testar o breakpoint 860px**

`browser_resize` para `859x900` (nav deve estar em modo hambúrguer) e depois `861x900` (nav deve estar em modo desktop) — confirmar a troca exatamente no breakpoint documentado no CLAUDE.md §5.

- [x] **Step 4: Verificação manual do Pix (nota do Task 8)**

Com o servidor rodando na rede local (`bun run dev --hostname 0.0.0.0`), abrir a seção Ofertas num celular real e escanear o QR com um app bancário — confirmar que ele reconhece a chave/nome/cidade cadastrados no seed. Testar também o botão "Copiar" (deve colar a chave Pix exata na área de transferência).

- [x] **Step 5: Ajustar diferenças perceptíveis e commitar se houve mudança**

```bash
git add -A
git commit -m "fix: adjust visual fidelity issues found in mobile/breakpoint verification"
```

---

### Task 33: Gate final — lint, typecheck, testes

**Files:** nenhum novo (só verificação).

- [x] **Step 1: Lint**

Run: `bunx oxlint`
Expected: 0 erros.

- [x] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: 0 erros.

- [x] **Step 3: Testes**

Run: `bun test`
Expected: todos os testes de `lib/format/*.test.ts`, `lib/pix/*.test.ts` e `lib/dal.test.ts` (Fase 0) passam.

- [x] **Step 4: Build de produção**

Run: `bun run build`
Expected: build conclui sem erro, `/` aparece como rota estática/dinâmica esperada no output do Next.

- [x] **Step 5: Corrigir qualquer falha encontrada**

Se lint/typecheck/teste falhar, voltar à task correspondente, corrigir, e commitar a correção isoladamente (não misturar com a próxima task).

- [x] **Step 6: Commit final (se algo mudou neste gate)**

```bash
git add -A
git commit -m "fix: address lint/typecheck/test issues found in final Fase 1 gate"
```

---

## Self-Review (executado ao escrever este plano)

- **Cobertura da spec**: FR-1/2/3 (hero + pilares) → Tasks 15–16; FR-4–7 (agenda + expiração) → Tasks 6, 11, 17–20; FR-8–10 (livros) → Tasks 5, 22; FR-11–12 (vídeo) → Task 21; FR-13–14 (depoimentos) → Task 23; FR-15–18 (ofertas/Pix) → Tasks 7, 8, 24–27; FR-19–20 (rodapé) → Task 28. Tokens/infra (§5/§6 CLAUDE.md) → Tasks 1–4. Seed → Task 9. Fidelidade visual (§13 PRD) → Tasks 31–32. Gate de qualidade (§14 CLAUDE.md) → Task 33.
- **Placeholders**: nenhum "TBD"/"implementar depois" — todo código é completo e compilável como escrito; ajustes de fidelidade visual são deliberadamente deixados para as Tasks 31–32 (não dá pra fixar CSS exato sem rodar no browser, e o próprio CLAUDE.md §14 define isso como parte do "pronto", não uma etapa a pular).
- **Consistência de tipos**: nomes conferidos entre tasks — `getPastorProfile`/`getAboutPillars` (10) ↔ uso em `page.tsx` (29) e `AboutSection` (16); `isAgendaItemVisible`/`sortByOrder` (6) ↔ uso em `lib/content/agenda.ts` (11) (nota: `sortByOrder` fica disponível mas `getAgendaItems` já busca com `orderBy: order asc` do Prisma diretamente — `sortByOrder` fica como utilitário exportado/testado, sem uso obrigatório extra); `buildPixPayload`/`crc16ccitt` (7, 8) ↔ uso em `PixCard` (25); `getPillarIcon` (13) ↔ uso em `AboutSection` (16); `AgendaBadge`/variantes `presencial`/`online` (4, 17) ↔ uso em `AgendaCard` (18).
