# CLAUDE.md — Seja Livre

Manual operacional do projeto. Leia isto no início de toda sessão. Para o "o quê" e "porquê", veja [`PRD.md`](./PRD.md). Este arquivo é referenciado por `AGENTS.md` (`@AGENTS.md`) — as instruções de lá (ler `node_modules/next/dist/docs/` antes de codar, pois esta versão do Next.js tem breaking changes) continuam valendo e são reforçadas abaixo.

## 1. Visão do projeto

Landing page pública (pt-BR) do Pastor Xurdir e do Ministério Seja Livre — apresentação, agenda de cultos/mentorias/pregações, livros, vídeo em destaque, depoimentos e dízimos/ofertas (Pix + dados bancários nacionais/internacionais) — com uma área `/admin` restrita a ~3 administradores para manter esse conteúdo atualizado sem depender de deploy. O protótipo do Claude Design (`design/`) é a fonte de verdade visual: paleta grafite `#161A22` + azul de marca + laranja `#FF7A3D` como cor de ação, tema escuro único (sem alternância claro/escuro).

## 2. Stack e versões confirmadas

Versões lidas de `package.json` / `bun.lock` / `node_modules` neste repositório em 2026-07-18 (não da memória do modelo):

| Camada | Tecnologia | Versão instalada |
|---|---|---|
| Runtime/pacotes | Bun | 1.3.12 |
| Framework | Next.js (App Router) | 16.2.10 |
| UI | React / react-dom | 19.2.4 |
| Linguagem | TypeScript | ^5 |
| Estilo | Tailwind CSS | 4.3.3 (CSS-first, `@theme` em `globals.css`) |
| Componentes | shadcn CLI | 4.13.1 (style `base-nova`, `cssVariables: true`, `iconLibrary: lucide`) |
| Ícones | lucide-react | ^1.25.0 |
| Auth/DB/Storage | @supabase/ssr | 0.12.3 |
| Auth/DB/Storage | @supabase/supabase-js | 2.110.7 |
| Lint | oxlint | 1.74.0 |
| ORM | Prisma | **ainda não instalado** — só existe `prisma/schema.prisma` e `prisma.config.ts` placeholders. Primeira tarefa de implementação deve rodar `bun add -d prisma` + `bun add @prisma/client` e confirmar a versão via context7 antes de escrever schema real. |

> **Não é o Next.js que você conhece.** Next 16 renomeou `middleware.ts` para **`proxy.ts`** (mesma função, novo nome/arquivo — confirmado em `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`) e introduziu **Cache Components** (`cacheComponents` flag em `next.config.ts`, hoje **desligada** neste projeto — `next.config.ts` está no default). Com a flag desligada, valem as regras de cache "modelo anterior" (`fetch({cache})`, `unstable_cache`, `export const revalidate`), não as diretivas `use cache`/`cacheLife`. Não assuma nada de memória — releia `node_modules/next/dist/docs/` antes de mexer em roteamento, cache ou proxy.

## 3. Arquitetura

- **Rotas públicas** (`/`, âncoras `#sobre #agenda #livros #video #depoimentos #ofertas`): Server Components, renderizadas no servidor, dados lidos via Prisma e cacheados com `unstable_cache` (tags por seção: `about`, `agenda`, `books`, `video`, `testimonials`, `offerings`, `footer`). SEO importa — sem client-side data fetching nessas seções.
- **`/admin`**: rota protegida. `proxy.ts` faz checagem **otimista** (lê a sessão do cookie do Supabase via `@supabase/ssr`, redireciona não-autenticados para `/admin/login`) — isso é só a primeira barreira, nunca a fonte de verdade (ver §7).
- **Prisma** roda só em código de servidor (Server Actions, Route Handlers, Server Components) — nunca importar o client gerado num Client Component.
- **Supabase Auth** autentica os ~3 admins (email/senha ou magic link — decidir na Fase 1). **Supabase Storage** guarda as imagens de todas as seções (bucket público para leitura, escrita restrita a `service_role`/admin autenticado).
- **shadcn/ui** é a única camada de componentes visuais — sem CSS solto reinventando o que um primitivo já resolve.
- **Revalidação sob demanda**: toda Server Action de admin que salva conteúdo chama `revalidateTag('<seção>')` (e/ou `revalidatePath('/')`) ao final, para o site público refletir a mudança sem rebuild.

## 4. Estrutura de diretórios

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

## 5. Design system / tokens

Fonte: `design/design-system-landing-page-pastor.pdf` (spec autoritativa) + `:root` de `design/landing-pastor-standalone.html` (idênticos — conferido). **Não inventar valores**; qualquer cor/espaçamento/raio fora desta lista exige achar no protótipo primeiro.

### Cores (hex/rgba exatos do protótipo)

| Token do protótipo | Valor | Uso |
|---|---|---|
| `--bg` | `#161A22` | fundo base |
| `--bg-panel` | `#1D222D` | seções alternadas (Sobre, Vídeo, Livros, Depoimentos, Footer) |
| `--bg-panel-2` | `#252B38` | início do gradiente de cards |
| `--bg-panel-3` | `#2D3444` | fim do gradiente de cards |
| `--blue-primary` | `#3159C7` | ícone/realces de marca |
| `--blue-primary-dim` | `#293868` | fundo de ícones em "Sobre" |
| `--blue-accent` | `#4C8CFF` | reservado / hover de links, cor do `--ring` |
| `--blue-accent-hover` | `#6A9FFF` | hover de elementos azuis |
| `--blue-accent-text` | `#8FB4FF` | cor padrão de links (AA sobre fundo escuro) |
| `--accent` | `#FF7A3D` | **CTAs, selo "Presencial", seleção de texto** |
| `--accent-hover` | `#FF9260` | hover dos botões primários |
| `--text-primary` | `#F5F6FA` | títulos/texto principal (~13:1 sobre `--bg`) |
| `--text-secondary` | `#B7BECD` | parágrafos (~8:1, AA) |
| `--text-muted` | `#8A91A3` | legendas/metadados (~4.6:1, AA para texto grande) |
| `--border` | `rgba(255,255,255,.12)` | bordas/divisores |
| `--border-strong` | `rgba(255,255,255,.24)` | bordas em hover/ênfase |

Gradientes: `--panel-gradient: linear-gradient(180deg,#1D222D 0%,#232937 100%)`; `--card-gradient: linear-gradient(160deg,#252B38 0%,#2D3444 100%)`; `--divider-glow: linear-gradient(90deg,transparent,rgba(76,140,255,.4),transparent)`; fundo do `<body>`: `radial-gradient(120% 90% at 50% 0%, #202737 0%, #161A22 48%)`.

### Tipografia (via `next/font`, `next/font/google`)

| Família | Uso | Pesos | Token Tailwind |
|---|---|---|---|
| Source Serif 4 | H1–H3 | 500, 600, 700 | `--font-heading` |
| Manrope | corpo, botões, nav | 400, 500, 600, 700, 800 | `--font-sans` |
| Caveat | 2ª linha manuscrita do H1 do hero, cor `--accent` | 600, 700 | `--font-caveat` |

Escalas: H1 hero `clamp(36px,5vw,58px)/1.1` peso 600 (serif + Caveat na 2ª linha a `1.25em`); H2 `clamp(28px,3.6vw,40px)` peso 600 serif; H3 card 18–20px peso 600 serif; corpo 14.5–17px/1.65–1.7 peso 400 Manrope; label/eyebrow 11–12px uppercase, `letter-spacing` 1.2–1.4px, peso 700 Manrope; botão 14–15px peso 700 Manrope.

### Espaçamento, radius, sombra

Micro 6–12px · pequeno 16–24px · médio 28–44px · padding vertical de seção **88px** · gap entre cards **24px**.
Radius: `--radius-sm 8px` · `--radius-md 14px` · `--radius-lg 24px` · `--radius-pill 999px`.
Sombras: `--shadow-sm 0 2px 8px rgba(0,0,0,.35)` · `--shadow-md 0 12px 32px rgba(0,0,0,.45)` · `--shadow-glow 0 0 0 1px rgba(76,140,255,.3), 0 16px 48px rgba(30,40,70,.4)`.

Breakpoint funcional único do protótipo: **860px** (navbar troca entre desktop/hambúrguer via `matchMedia`). O resto do layout é fluido (`grid-template-columns: repeat(auto-fit, minmax(...))`, sem outros breakpoints fixos). Decisão: declarar esse valor como breakpoint customizado no `@theme` do Tailwind v4 (`--breakpoint-nav: 860px`, usado só para o padrão desktop/mobile da navbar) em vez de forçar o layout inteiro aos breakpoints padrão do Tailwind (que não batem com 860px) — os grids continuam usando `auto-fit/minmax` puro, sem depender de breakpoint.

### Mapeamento tokens → CSS variables do shadcn (`app/globals.css`, dark, tema único — sem light mode)

O projeto é **dark-only**: `<html class="dark">` fixo no `layout.tsx`, sem toggle. Os valores abaixo substituem os `oklch(...)` de placeholder que o `shadcn init` gerou em `:root`/`.dark` — usar hex/rgba direto, Tailwind v4 aceita qualquer função de cor válida.

| Var shadcn | Valor | Origem / observação |
|---|---|---|
| `--background` | `#161A22` | `--bg` |
| `--foreground` | `#F5F6FA` | `--text-primary` |
| `--card` | `#252B38` | `--bg-panel-2` (cor sólida de fallback; o gradiente real `--card-gradient` é aplicado via classe utilitária extra nos componentes de Card que precisam do visual exato do protótipo — `--card` sozinho não expressa gradiente) |
| `--card-foreground` | `#F5F6FA` | `--text-primary` |
| `--popover` | `#1D222D` | `--bg-panel` |
| `--popover-foreground` | `#F5F6FA` | `--text-primary` |
| `--primary` | `#FF7A3D` | `--accent` — **o laranja é o `primary` do shadcn**, pois é a cor de todo CTA/botão principal |
| `--primary-foreground` | `#FFFFFF` | texto sobre laranja |
| `--secondary` | `#293868` | `--blue-primary-dim` — usado nos fundos de ícone/realces secundários (ex.: ícones do "Sobre") |
| `--secondary-foreground` | `#8FB4FF` | `--blue-accent-text` |
| `--muted` | `#1D222D` | `--bg-panel` |
| `--muted-foreground` | `#8A91A3` | `--text-muted` |
| `--accent` (var do shadcn) | `#293868` | **⚠️ colisão de nomes**: o protótipo também tem um token `--accent`, mas é o laranja (mapeado acima para `--primary`). A var `--accent` do shadcn tem semântica diferente (fundo sutil de hover/estado, não CTA) — mapeada para `--blue-primary-dim`, não para o laranja. Não confundir os dois "`--accent`". |
| `--accent-foreground` | `#8FB4FF` | `--blue-accent-text` |
| `--destructive` | `#EC2030` (proposto) | protótipo não define cor de erro/estado destrutivo — `#EC2030` é proposta nossa (vermelho puro, deliberadamente afastado do laranja `--accent` para não ser confundido com CTA), não um token do protótipo; validar com o time ao ver a tela real do admin (PRD §12) |
| `--border` | `rgba(255,255,255,.12)` | `--border` |
| `--input` | `rgba(255,255,255,.12)` | igual a `--border` |
| `--ring` | `#4C8CFF` | `--blue-accent` |
| `--radius` | `14px` | **não usar** a escala proporcional que o `shadcn init` gerou (`--radius-sm: calc(var(--radius)*0.6)` etc. não bate com 8/14/24/999 do protótipo) — sobrescrever `--radius-sm/-md/-lg` com os valores fixos abaixo |
| `--radius-sm` | `8px` | fixo, não calculado |
| `--radius-lg` | `24px` | fixo, não calculado |
| `--radius-pill` (novo, custom) | `999px` | token novo, adicionar ao `@theme` para pills de botão/badge |

Além da tabela do shadcn, manter os tokens **brutos** do protótipo disponíveis no `@theme` do Tailwind (`--color-brand-accent`, `--color-blue-primary`, `--color-blue-primary-dim`, `--color-blue-accent`, `--color-blue-accent-hover`, `--color-blue-accent-text`, `--color-bg-panel-2/3`) para os casos que não têm um slot shadcn 1:1 (selos, gradientes, cor de seleção de texto `::selection`).

### Inventário de componentes (protótipo → shadcn)

| Componente visual | Primitivo shadcn | Observação |
|---|---|---|
| Navbar (sticky, blur, logo circular 36px + wordmark serif) | header custom + `Button` (CTA pill) | sem primitivo shadcn de navbar; compor manualmente |
| Menu mobile (abaixo de 860px, hambúrguer 44×44px) | `Sheet` | substitui o `matchMedia` + estado manual do protótipo por CSS responsivo + `Sheet`, preservando o visual |
| Botão primário (pill laranja) | `Button` variant `default` | `rounded-full`, `bg-primary` |
| Botão secundário (outline translúcido) | `Button` variant `outline` | borda `--border-strong`, hover `--ring`/`--secondary-foreground` |
| Card de Agenda (340px, scroll horizontal + setas) | `Carousel` (shadcn, base Embla) + `Card` + `Badge` | protótipo usa scroll manual com `ref`/`scrollBy`; adaptar para `Carousel` do shadcn preservando largura de item, gap 24px e snap — **desvio justificado**: reaproveita um primitivo já testado em vez de reimplementar scroll manual |
| Selo Presencial/Online | `Badge` (variants custom `presencial`/`online`) | `presencial` = laranja sólido, `online` = escuro translúcido — ambos com sombra e borda 1px |
| Card de Livro | `Card` + `Button` | capa 220×320px via `next/image` |
| Bloco de Vídeo | custom (sem primitivo) + `Button` | thumb com overlay de play + duração |
| Card de Depoimento | `Card` + `Avatar` (fallback com iniciais) | |
| Bloco de Ofertas (Pix / conta nacional / internacional) | 3× `Card` + `Button` ("Copiar") + `Separator` entre pares label/valor | QR gerado client-side (§7 do PRD), nunca armazenado como imagem |
| Rodapé | custom + ícones | ícones sociais do protótipo são SVGs desenhados à mão (Instagram/YouTube/WhatsApp) — **desvio justificado**: usar `lucide-react` (`MessageCircle` para WhatsApp), já que é a `iconLibrary` configurada em `components.json`; manter tamanho 40×40px circular e hover azul. **Atualização Fase 1**: `lucide-react` 1.25 removeu todos os ícones de marca/logo (confirmado empiricamente — não há `Instagram`, `Youtube`, `Twitter`, `Facebook` etc. nos exports do pacote instalado, só `MessageCircle` sobreviveu por ser um ícone genérico), então Instagram e YouTube voltam a ser SVGs inline em `components/footer/footer.tsx` (glifo genérico câmera-em-moldura / retângulo-com-play, não o logotipo exato) — não é possível seguir a diretriz original de "tudo via lucide" para esses dois. |

Regra geral: **reproduzir o protótipo fielmente** (paleta, tipografia, espaçamento, layout, responsividade). O HTML standalone é meta visual, não é para colar verbatim — ele usa uma sintaxe de template proprietária (`sc-for`, `sc-camel-on-click`, `x-import`) que não existe em Next/React; a estrutura de código segue App Router + Server Components + shadcn. Qualquer desvio do visual do protótipo (como os dois acima) precisa da mesma justificativa explícita registrada aqui — não é permitido "melhorar" o design sem essa nota.

## 6. Convenções de código

- TypeScript **strict** (já configurado em `tsconfig.json`).
- Server Components por padrão; `'use client'` só onde há interatividade real (menu mobile, carrossel de agenda, botão "Copiar" do Pix, formulários do admin).
- Mutações via **Server Actions** (`'use server'`), não Route Handlers, exceto quando o consumidor não é um form React (ex.: webhook futuro do AbacatePay na v2).
- Nomenclatura: arquivos/pastas em `kebab-case`, componentes em `PascalCase`, tudo em inglês no código (identificadores, props, nomes de tabela/coluna Prisma); conteúdo (texto renderizado) em pt-BR.
- Compor UI a partir de primitivos shadcn (`bunx shadcn@latest add <componente>`) em vez de `className` soltas reimplementando algo que já existe como primitivo (`Button`, `Card`, `Badge`, `Sheet`, `Avatar`, `Separator`, `Carousel`, `Table`, `Dialog`, `Form`, `Input`, `Textarea`, `Select`, `Sonner`).
- Ao adaptar o HTML standalone de `design/`: extrair valores (cor, espaçamento, tamanho) diretamente das regras `style="..."` inline dele, mas **nunca** copiar sua sintaxe de template (`sc-for`, `x-import`, `ref="{{ ... }}"`) — reescrever como JSX/TSX idiomático usando os dados vindos do Prisma no lugar dos arrays mockados (`agendaItems`, `testimonials`) do protótipo.

## 7. Modelo de autorização (Prisma + Supabase)

Prisma conecta no Postgres do Supabase com uma connection string privilegiada e **ignora RLS na prática** — RLS não pode ser a defesa primária para nada que passe por Prisma.

**Fonte de verdade do controle de acesso: a aplicação**, em duas camadas:

1. `proxy.ts` (raiz do projeto — nome novo do antigo `middleware.ts` no Next 16) faz uma checagem **otimista**: lê a sessão do Supabase a partir do cookie (via `@supabase/ssr`, método `getAll`/`setAll`, não os `get`/`set` deprecados) e redireciona requisições não autenticadas em `/admin/**` (exceto `/admin/login`) para o login. Roda em toda navegação, então **não** deve bater no banco — só lê o cookie.
2. Toda Server Action e Route Handler que lê ou muta conteúdo de admin chama `requireAdmin()` (`lib/require-admin.ts`) que **revalida a sessão no servidor** (`supabase.auth.getClaims()`) **e** confere a tabela `Admin` do Prisma para o papel. Essa é a checagem **autoritativa** — a do proxy é só UX (evita um flash de conteúdo protegido / redireciona cedo).

`requireAdmin()` fica em `lib/require-admin.ts`, **não** em `lib/dal.ts` — `lib/dal.ts` guarda só a decisão pura (`resolveAdminAccess`, `canRemoveAdmin`, sem nenhum import), e `lib/require-admin.ts` importa dessas funções para fazer a parte de I/O (Supabase + Prisma). Não junte os dois de volta no mesmo arquivo: fizemos isso na Fase 0 e quebrou o objetivo de testar a lógica de autorização sem precisar de um runtime Next/Prisma/Supabase.

RLS nas tabelas do Supabase fica **ligada como defesa em profundidade**, com **zero policy** em todas — nega tudo para `anon`/`authenticated` por padrão (não é um TODO, é o estado final desejado até a Fase 2 precisar de alguma leitura pública via um client Supabase direto, o que hoje não existe), permitindo só `service_role`. Protege contra qualquer uso futuro do client Supabase direto do browser sem passar pelo Prisma. Deixar isso explícito em qualquer PR que mexer em `/admin`: **RLS aqui é cinto de segurança extra, não o cinto principal.**

`role` já modelado desde já: `admin` (ativo) e `student` (reservado para v2, não implementar nada que dependa dele agora).

Login do admin é por **magic link** (sem senha) — `Admin` é cadastrado pelo e-mail antes de existir usuário no Supabase Auth; `supabaseUserId` fica nulo até o primeiro acesso, quando é preenchido. Um admin marcado `isSuperAdmin` nunca pode ser removido (regra aplicada na Server Action de remoção, não só na UI). Detalhe completo do fluxo em `docs/superpowers/specs/2026-07-18-fase-0-fundacao-design.md`.

## 8. Banco / ORM

Prisma instalado é **7.8.0** — confirmado empiricamente na Fase 0 que isso é uma reformulação real de como conexão funciona, não só um bump de versão. Registrado aqui porque quebraria de novo se alguém confiar em memória de Prisma 5/6:

- **`schema.prisma` não tem mais `url`/`directUrl`** no bloco `datasource` — Prisma 7 removeu isso (erro `P1012` se tentar). O bloco é só:
  ```prisma
  datasource db {
    provider = "postgresql"
  }
  ```
- **Conexão do CLI** (migrate/introspect/`db seed`) vem de `prisma.config.ts`'s `datasource.url` — hoje aponta pra `DIRECT_URL` (pooler Supavisor, modo sessão, porta 5432), porque migrations precisam de recursos de sessão que o modo transação não sustenta.
- **Conexão de runtime** (o `PrismaClient` que a aplicação usa) exige um **driver adapter** — `@prisma/adapter-pg`, construído com `{ connectionString: process.env.DATABASE_URL }` (pooler Supavisor, modo transação, porta 6543) e passado como `new PrismaClient({ adapter })`. Sem adapter, o client não tem como conectar (não existe mais fallback implícito via `schema.prisma`). Exemplo real em `lib/prisma.ts`.
- CLI e runtime usam **conexões completamente separadas** agora — `DATABASE_URL` nunca aparece em `prisma.config.ts`, `DIRECT_URL` nunca aparece em `lib/prisma.ts`.
- generator `prisma-client` (client novo baseado em ESM, **não** o antigo `prisma-client-js`) com `output = "../lib/generated/prisma"`. **Importar sempre de `lib/generated/prisma/client`** (onde `PrismaClient` de fato é exportado), nunca do diretório bare `lib/generated/prisma` (não existe `index.ts` barrel — confirmado apagando um criado à mão e rodando `prisma generate` de novo, que não o recriou) nem de `@prisma/client` direto.
- Dependências reais que isso exige (fáceis de esquecer): `@prisma/adapter-pg`, `server-only` (usado por `lib/prisma.ts`/`lib/supabase/server.ts`), `@types/bun` (senão `tsc --noEmit` erra em qualquer arquivo `bun:test`).
- `prisma.config.ts` já usa o formato novo (`defineConfig` de `"prisma/config"`, não a chave `"prisma"` do `package.json`) — seed também é configurado lá (`migrations.seed`), não no `package.json`.
- Migrations: `bunx prisma migrate dev` em desenvolvimento; `bunx prisma migrate deploy` em produção/CI. Nunca `db push` em produção.
- Pra verificar dados/tabelas ao vivo no Supabase, prefira as tools MCP do Supabase (`list_tables`, `execute_sql`) — `bunx prisma db execute` **não imprime resultado de `SELECT`** (só confirma "Script executed successfully" mesmo com a query certa), então é inútil pra esse tipo de verificação.

## 9. Comandos (Bun)

```bash
bun install                    # nunca npm/yarn/pnpm
bun run dev                    # next dev
bun run build                  # next build
bun run start                  # next start
bunx oxlint                    # lint — nunca ESLint
bun test                       # testes (bun:test)
bunx prisma migrate dev        # nova migration em dev
bunx prisma generate           # regenerar client após mudar schema
bunx shadcn@latest add <comp>  # adicionar primitivo (ex.: button, card, badge, sheet, carousel, avatar, form, dialog, table, sonner)
```

## 10. Uso do context7 (regra obrigatória)

Antes de usar qualquer API, comando ou versão de Next.js, shadcn/ui, Prisma, Supabase (`@supabase/ssr`, Auth, Storage) ou Tailwind, **consulte a documentação atual via context7** (`resolve-library-id` → `get-library-docs`). Não confie na memória de treinamento — este projeto usa Next 16 (proxy em vez de middleware, Cache Components opcional) e um generator Prisma novo (`prisma-client`), ambos posteriores a boa parte do conhecimento genérico sobre essas ferramentas.

> **Atualização pós-Fase 0**: o context7 continuou indisponível durante toda a implementação da Fase 0 (nunca foi conectado nesta sessão). Os pontos (a) e (b) abaixo — Prisma+Supabase e `@supabase/ssr` — acabaram verificados sem ele, por dois caminhos que se mostraram confiáveis o bastante pra esse tipo de checagem: **lendo os `.d.ts` do pacote realmente instalado** em `node_modules/` (foi assim que a mudança do Prisma 7 em `datasource`/driver adapters e o shape de `getClaims()`/`getAll`/`setAll` do `@supabase/ssr` 0.12.3 foram confirmados — não a spec de uma versão genérica) e **testando de verdade contra o banco** (migrations rodaram, seed rodou, sessão de admin foi verificada via Supabase MCP). O Supabase MCP (`plugin:supabase:supabase`) está conectado desde a Fase 0 e tem tools (`list_tables`, `execute_sql`, `apply_migration`, `get_advisors`) melhores que `context7` pra esse projeto especificamente. Ainda falta (c): flags atuais do `shadcn` CLI 4.13.1 — nenhuma tarefa até agora rodou `bunx shadcn@latest add`, então confirmar antes da primeira vez que isso acontecer (Fase 1).

## 11. Fluxo com Superpowers

Não pular fases: brainstorm → spec → plano (`/superpowers:plan`, tarefas de 2–5 min com caminho de arquivo e passos test-first) → execução com subagents → review em duas etapas (primeiro contra a spec, depois qualidade/código). TDD obrigatório para lógica não-trivial (helpers de autorização, parser do payload Pix/BR Code, formatação de datas da agenda). Usar worktrees isolados (`superpowers:using-git-worktrees`) para trabalho de feature que não deve interferir no restante do repo. Fidelidade visual ao protótipo faz parte da definição de pronto (§14) — não é opcional nem “depois a gente ajusta”.

## 12. Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | pooler Supabase (Supavisor, modo transação, :6543) — só o driver adapter (`lib/prisma.ts`) usa, em runtime |
| `DIRECT_URL` | pooler Supabase (Supavisor, modo sessão, :5432) — só `prisma.config.ts` usa, pro CLI (migrate/seed) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (pública, client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave anônima do Supabase (pública, respeitada pela RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave de service role (só server-side, nunca exposta ao client, usada onde for preciso bypassar RLS explicitamente fora do Prisma) |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada em metadata/SEO e em links absolutos (ex.: compartilhamento) |

Nunca commitar segredos — `.env` já está no `.gitignore`; usar `.env.example` (sem valores reais) para documentar as chaves acima.

## 13. Guardrails / Do & Don't

- ✅ Bun para tudo (`bun`/`bunx`) · ❌ nunca `npm`/`yarn`/`pnpm`.
- ✅ oxlint (`bunx oxlint`) · ❌ nunca instalar/configurar ESLint.
- ✅ Conteúdo do site em pt-BR · ✅ código/identificadores/commits em inglês.
- ✅ SEO obrigatório nas páginas públicas (SSR/ISR, metadata, `next/image`, dados estruturados quando fizer sentido) · ❌ nenhuma seção pública vira client-only por conveniência.
- ✅ Imagens em Supabase Storage (bucket público de leitura, escrita só admin autenticado) · ❌ nunca guardar imagem como base64 no Postgres.
- ✅ QR Pix gerado no client a partir do payload BR Code · ❌ nunca armazenar o QR como arquivo de imagem.
- ❌ Não implementar nada do roadmap v2 (AbacatePay, construtor drag-n-drop, área do aluno, lembretes) — só existe hoje como texto no PRD.
- ❌ Nunca segredo (chave Supabase, connection string) commitado no repo.
- ❌ **Não desviar do protótipo do Claude Design sem justificativa explícita** registrada (como as duas exceções já documentadas em §5 — `Carousel` e ícones lucide). Qualquer outro desvio precisa da mesma explicação antes de mergear.
- ✅ Autorização de `/admin` sempre checada nas Server Actions/Route Handlers (`requireAdmin()`), nunca só no `proxy.ts` ou só no client.

## 14. Definição de "pronto"

Uma tarefa/feature só está pronta quando: `bunx oxlint` sem erros · testes relevantes passando (`bun test`) · TDD seguido (teste escrito antes da implementação para lógica não-trivial) · review em duas etapas feito (spec, depois qualidade) · **fidelidade visual ao protótipo conferida lado a lado** (comparar com os frames em `design/screenshots/` e/ou abrir `design/landing-pastor-standalone.html` no navegador ao lado do resultado) · nenhuma variável de ambiente/segredo vazado no diff · revalidação sob demanda testada manualmente quando a tarefa mexe em conteúdo do admin (salvar no admin → conferir que o público atualizou sem rebuild).
