# Fase 1 — Landing pública (read-only, dados seed): design

Data: 2026-07-19. Relacionado: [`PRD.md`](../../../PRD.md) (§4.1–4.7, §10 roadmap Fase 1, §13 critérios de aceite), [`CLAUDE.md`](../../../CLAUDE.md) (§3 arquitetura, §5 design tokens, §6 convenções). Pré-requisito: Fase 0 concluída — [`2026-07-18-fase-0-fundacao-design.md`](./2026-07-18-fase-0-fundacao-design.md).

## Objetivo

Renderizar a home pública inteira (`/`) fiel ao protótipo, lendo conteúdo real do Postgres (via Prisma) em vez de placeholder hardcoded — mas ainda sem admin: quem povoa o banco nesta fase é `prisma/seed.ts`. Cobre PRD §4.1–4.7 (Sobre, Agenda, Livros, Vídeo, Depoimentos, Ofertas, Rodapé) + Navbar. Não cobre §4.8 (admin) — isso é Fase 2.

## 1. Decisões desta fase (resumo)

- **Estrutura de componentes**: `components/<domínio>/`, não `app/(public)/_sections/` como o CLAUDE.md §4 documentava até agora. Justificativa: alinha com o inventário de componentes do §5, que já organiza por domínio (agenda/, ofertas/, admin/); `app/(public)/_sections/` nunca chegou a ser usado na Fase 0. CLAUDE.md §4 será atualizado nesta fase com essa mudança e a nota de justificativa.
- **Camada de dados**: `lib/content/<entidade>.ts`, um arquivo por entidade, cada um exportando uma função cacheada (`unstable_cache` + tag), não Prisma direto dentro dos componentes de seção.
- **QR Pix**: decidido agora, não adiado — `react-qr-code` (renderiza SVG a partir de uma string) + gerador de payload BR Code/EMV com CRC16 escrito à mão (`lib/pix/br-code.ts`), função pura, testada via TDD. A lib só desenha o QR; o payload (chave + nome + cidade do `OfferingSettings`) é montado pelo nosso código.
- **Seed**: `prisma/seed.ts` expande de "só singletons" para incluir dados realistas de `AboutPillar`, `AgendaItem`, `Book`, `Testimonial` — necessário pra testar carrossel, grid, badge Presencial/Online e a expiração automática por data (FR-7) de verdade.
- **Fora de escopo, avaliado e descartado**: TanStack Query e Zustand — nenhuma seção pública faz client-side fetch (proibido pelo CLAUDE.md §3, SEO) e o único estado client desta fase (menu mobile, índice do carrossel, feedback do botão copiar) é local, `useState` resolve.

## 2. Estrutura de arquivos

```
components/
  navbar/
    navbar.tsx            # header sticky, logo + wordmark + nav + CTA "Fale Conosco" (→ #agenda)
    mobile-menu.tsx        # 'use client' — Sheet, abaixo de 860px
  about/
    about-section.tsx      # hero (#sobre) + "Uma missão, três frentes" (3 AboutPillar)
    pillar-icon.ts          # mapa slug→ícone lucide (icon field do AboutPillar)
  agenda/
    agenda-section.tsx
    agenda-carousel.tsx     # 'use client' — shadcn Carousel (Embla), setas prev/next
    agenda-card.tsx
    agenda-badge.tsx        # Presencial (laranja sólido) | Online (escuro translúcido)
  books/
    books-section.tsx
    book-card.tsx
  video/
    video-section.tsx       # thumbnail + overlay play + duração + CTA
  testimonials/
    testimonials-section.tsx
    testimonial-card.tsx    # Avatar com fallback de iniciais
  offerings/
    offerings-section.tsx
    pix-card.tsx            # 'use client' — gera QR a partir do payload
    bank-card.tsx            # conta nacional / internacional (sem estado client)
    copy-button.tsx          # 'use client' — copia chave Pix, feedback visual
  footer/
    footer.tsx

lib/content/
  about.ts            # getPastorProfile() + getAboutPillars(), tag "about"
  agenda.ts           # getAgendaItems() — filtra isPublished && date >= now, ordena por order, tag "agenda"
  books.ts            # getBooks(), tag "books"
  video.ts            # getVideoHighlight(), tag "video"
  testimonials.ts     # getTestimonials(), tag "testimonials"
  offerings.ts        # getOfferingSettings(), tag "offerings"
  footer.ts           # getFooterSettings(), tag "footer"

lib/pix/
  br-code.ts          # buildPixPayload({ key, merchantName, merchantCity }) → string EMV+CRC16
  br-code.test.ts

lib/format/
  date.ts             # isAgendaItemVisible(item, now), sortByOrder()
  date.test.ts
  price.ts            # formatPriceBRL(decimal) → "R$ 00,00"
  price.test.ts
```

`app/page.tsx` passa a compor as seções na ordem do protótipo (Navbar → Sobre → Agenda → Livros → Vídeo → Depoimentos → Ofertas → Footer), cada seção chamando sua própria função de `lib/content/`.

## 3. Camada de dados (cache)

Padrão único, repetido em cada arquivo de `lib/content/`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getAgendaItems = unstable_cache(
  async () => {
    const items = await prisma.agendaItem.findMany({ orderBy: { order: 'asc' } })
    return items.filter((item) => isAgendaItemVisible(item, new Date()))
  },
  ['agenda-items'],
  { tags: ['agenda'] },
)
```

Tags por seção (já previstas no CLAUDE.md §3): `about`, `agenda`, `books`, `video`, `testimonials`, `offerings`, `footer`. Nesta fase ninguém chama `revalidateTag` (não existe admin ainda) — a forma fica pronta pra Fase 2 usar sem retrabalho.

Filtragem de visibilidade (`isPublished` + `date >= now` para agenda; `isPublished` para books/testimonials) acontece na função de `lib/content/`, não no componente — mantém os componentes de seção "burros" (só recebem uma lista já filtrada/ordenada).

## 4. Lógica não-trivial (TDD obrigatório, `bun test`)

- **`lib/pix/br-code.ts`**: monta o payload BR Code (EMV, tags `00`/`26`/`52`/`53`/`58`/`59`/`60`/`62`/`63`) a partir de chave Pix + nome + cidade, com CRC16-CCITT no final. Teste: payload gerado bate byte-a-byte com um payload de referência conhecido (fixture), e o CRC16 confere com o resto da string.
- **`lib/format/date.ts`**: `isAgendaItemVisible` — testa os 4 casos (publicado+futuro → true; publicado+passado → false; despublicado+futuro → false; despublicado+passado → false), garante FR-7 (expiração automática).
- **`lib/format/price.ts`**: `formatPriceBRL(new Prisma.Decimal("49.9"))` → `"R$ 49,90"` (vírgula decimal, símbolo `R$`).

Resto (JSX, layout, responsividade, Carousel) é verificado manualmente num browser (Playwright), comparando com `design/screenshots/` — não é lógica, é fidelidade visual.

## 5. Seed expandido (`prisma/seed.ts`)

Mantém os `upsert` de singleton já existentes (`PastorProfile`, `VideoHighlight`, `OfferingSettings`, `FooterSettings`) e adiciona:

- **3 `AboutPillar`**: "Palavra viva", "Libertação e cura interior", "Formação de líderes" (ícones lucide a escolher no plano), `order` 0–2.
- **4 `AgendaItem`**: mistura `presencial`/`online`; pelo menos 1 com `date` no passado e `isPublished: true` (prova que a expiração por data funciona mesmo sem o admin despublicar) e 1 com `isPublished: false` (prova que despublicado some independente da data).
- **1 `Book`** (FR-10 — só um no lançamento).
- **4 `Testimonial`**, `order` 0–3, `avatarColor` variando (testa fallback de iniciais do `Avatar`).

Fotos: `picsum.photos` com seed determinístico por item (mesmo padrão já usado na Fase 0), evita depender de upload real antes da Fase 2.

## 6. Infra pendente (tokens, imagens, shadcn)

- **`app/globals.css`**: hoje só tem os slots shadcn (`--background`, `--primary` etc.) mapeados na Fase 0. Faltam os tokens "crus" do protótipo que não têm slot 1:1 (CLAUDE.md §5): `--color-blue-primary`, `--color-blue-primary-dim`, `--color-blue-accent`, `--color-blue-accent-hover`, `--color-blue-accent-text`, `--color-bg-panel-2`, `--color-bg-panel-3` — usados em `::selection`, ícones de "Sobre", links. Mais `--breakpoint-nav: 860px` no `@theme` (só pro breakpoint da navbar, grids continuam `auto-fit/minmax`).
- **`next.config.ts`**: `images.remotePatterns` liberando `picsum.photos` (seed desta fase) e o host do bucket Supabase Storage (ainda sem uso, mas evita retrabalho quando a Fase 2 fizer upload real).
- **`bunx shadcn@latest add carousel sheet card badge avatar separator button`**: primeira vez rodando o CLI 4.13.1 neste projeto — confirmar que as flags/output batem com `components.json` (`style: base-nova`) antes de aceitar; `Carousel` traz `embla-carousel-react` como dependência transitiva.

## 7. Testando fidelidade visual

Para cada seção: abrir `bun run dev` ao lado de `design/landing-pastor-standalone.html` (ou os frames em `design/screenshots/desktop|mobile/`), comparar cor/tipografia/espaçamento, testar em ambos os lados do breakpoint 860px (resize ou Playwright `browser_resize`). Qualquer diferença é um desvio a justificar explicitamente (CLAUDE.md §13), não uma inconsistência a ignorar.

## 8. Critérios de aceite (herdados do PRD §13, aplicáveis a esta fase)

- Sobre, Agenda, Livros, Vídeo, Depoimentos, Ofertas, Rodapé cada um renderiza exatamente o conteúdo do seed atual, sem cache stale entre um `bun run dev` restart e outro.
- Agenda: item despublicado ou com data passada não aparece; badge correto por `type`; carrossel navega por setas e swipe/touch; card ~340px, gap 24px.
- Livros: preço formatado em `R$`; "Comprar agora" abre `buyUrl` em nova aba.
- Ofertas: QR gerado no client decodifica pro payload esperado (teste automatizado); botão "Copiar" funciona; nenhuma request de rede busca "imagem de QR".
- Rodapé: CNPJ/endereço/links/ícones batem com `FooterSettings` do seed.
- Fidelidade visual lado a lado, desktop e mobile, sem diferença perceptível não-justificada.

## 9. Fora de escopo desta fase

Admin (`/admin`, login, CRUD, upload de imagem, `revalidateTag` disparado por mutação real) — Fase 2. Metadata avançado/OpenGraph por seção-âncora — Fase 3. Qualquer coisa do roadmap v2 (§11 do PRD).

## 10. Riscos / follow-ups

- Primeira execução real de `bunx shadcn@latest add` no projeto — se as flags do CLI 4.13.1 divergirem do esperado, ajustar `components.json` manualmente e registrar aqui.
- CRC16 do BR Code é o tipo de lógica fácil de acertar "quase" — validar contra um payload de referência real (gerado por uma ferramenta Pix confiável), não só contra o próprio código.
- Ícones dos 3 `AboutPillar` (`icon` slug) precisam de um mapeamento fixo slug→componente lucide; se um slug do seed não existir no mapa, decidir fallback (ícone genérico vs. erro de build) no plano.
