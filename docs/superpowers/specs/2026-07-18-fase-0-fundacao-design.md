# Fase 0 — Fundação: design

Data: 2026-07-18. Relacionado: [`PRD.md`](../../../PRD.md) (Fase 0 do roadmap, §10), [`CLAUDE.md`](../../../CLAUDE.md) (arquitetura, §3/§7/§8).

## Objetivo

Deixar a base técnica pronta antes de qualquer seção pública ou tela de admin existir: schema Prisma completo, conexão real com o Supabase (`landing-page-xurdir`, projeto `flcjszndmddruybziujn`), Storage, e o modelo de autenticação/autorização do `/admin` (login por magic link, RBAC com superAdmin protegido). Nada de UI de conteúdo aqui — só o que as Fases 1 e 2 vão precisar para existir.

## 1. Schema Prisma

Um arquivo só (`prisma/schema.prisma`), generator `prisma-client` (já configurado, `output = "../lib/generated/prisma"`), datasource com `url` (pooler) e `directUrl` (a adicionar).

```prisma
enum Role {
  admin
  student // reservado p/ v2, sem uso
}

enum AgendaType {
  presencial
  online
}

enum PixKeyType {
  email
  cpf
  cnpj
  phone
  random
}

model Admin {
  id             String   @id @default(uuid())
  email          String   @unique
  supabaseUserId String?  @unique // nulo até o primeiro login (magic link)
  name           String
  role           Role     @default(admin)
  isSuperAdmin   Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model PastorProfile {
  id           String @id @default("singleton")
  heroPhotoUrl String
  heroHeadline String
  heroHighlight String
  heroIntro    String
  familyPhotoUrl String
  aboutEyebrow String
  aboutHeading String
  aboutIntro   String
}

model AboutPillar {
  id          String @id @default(uuid())
  icon        String
  title       String
  description String
  order       Int
}

model AgendaItem {
  id          String     @id @default(uuid())
  title       String
  type        AgendaType
  date        DateTime
  dateLabel   String
  location    String
  imageUrl    String
  linkUrl     String
  order       Int
  isPublished Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Book {
  id           String  @id @default(uuid())
  title        String
  subtitle     String
  description  String
  price        Decimal
  coverImageUrl String
  buyUrl       String
  order        Int
  isPublished  Boolean @default(true)
}

model VideoHighlight {
  id            String @id @default("singleton")
  eyebrow       String
  title         String
  description   String
  thumbnailUrl  String
  videoUrl      String
  durationLabel String
  ctaLabel      String
}

model Testimonial {
  id          String  @id @default(uuid())
  quote       String
  name        String
  role        String
  initials    String
  avatarColor String
  order       Int
  isPublished Boolean @default(true)
}

model OfferingSettings {
  id                String     @id @default("singleton")
  pixKey            String
  pixKeyType        PixKeyType
  pixMerchantName   String
  pixMerchantCity   String
  nationalBank      String
  nationalAgency    String
  nationalAccount   String
  nationalCnpj      String
  intlBank          String
  intlIban          String
  intlSwift         String
  intlAccountHolder String
}

model FooterSettings {
  id            String @id @default("singleton")
  cnpj          String
  address       String
  instagramUrl  String
  youtubeUrl    String
  whatsappUrl   String
  copyrightText String
}
```

Singletons usam `id` fixo (`"singleton"`) em vez de uma tabela separada de "settings" — mais simples de fazer `upsert` (`update` se existir, `create` se não) e não precisa de uma segunda tabela genérica chave-valor.

`Admin.id` **não** é igual a `auth.users.id` desde o início (diferente do desenho original do CLAUDE.md/PRD antes desta rodada de brainstorming) — porque um admin é cadastrado pelo e-mail antes de qualquer usuário existir no Supabase Auth. `supabaseUserId` é preenchido no primeiro login.

## 2. Conexão Supabase

Projeto já criado e conectado via MCP: `landing-page-xurdir` (`flcjszndmddruybziujn`, us-west-2). `.env` já populado:

- `DATABASE_URL` — pooler Supavisor, modo transação, porta `6543`, `pgbouncer=true`.
- `DIRECT_URL` — pooler Supavisor, modo sessão, porta `5432` (usado por `prisma migrate`).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — obtidos via MCP (`get_project_url`, `get_publishable_keys`).
- `SUPABASE_SERVICE_ROLE_KEY` — preenchido manualmente pelo usuário (não exposto via MCP, por design).
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` em dev.

Adicionar `directUrl = env("DIRECT_URL")` ao bloco `datasource db` do `schema.prisma` (hoje só tem `url`).

## 3. Storage

1 bucket `media`, público para leitura, escrita restrita a usuários autenticados (qualquer admin — sem granularidade por seção). Pastas por seção: `media/profile/`, `media/agenda/`, `media/books/`, `media/video/`, `media/testimonials/`.

## 4. Autenticação e autorização

### 4.1 Login por magic link

- Tela `/admin/login`: campo de e-mail → chama uma Server Action que primeiro confere se o e-mail existe em `Admin` (senão, mensagem genérica — não revelar se o e-mail existe ou não, para não vazar quem é admin) → se existe, chama `supabase.auth.signInWithOtp({ email })`.
- Supabase cria o `auth.users` automaticamente no primeiro envio de OTP para aquele e-mail (comportamento padrão do Supabase Auth).
- Ao clicar no link e a sessão ser criada, uma checagem de "primeiro acesso" (dentro do `requireAdmin()` ou de um passo dedicado logo após o callback de auth) faz `UPDATE Admin SET supabaseUserId = <id da sessão> WHERE email = <email da sessão> AND supabaseUserId IS NULL` — idempotente, só roda de fato uma vez por admin.

### 4.2 `proxy.ts` (checagem otimista)

Raiz do projeto, `matcher: ['/admin/:path*']`. Lê a sessão via `@supabase/ssr` (client de proxy dedicado, que também escreve cookies de refresh na response). Sem sessão válida e rota ≠ `/admin/login` → redireciona para `/admin/login`. Não bate no Postgres aqui.

### 4.3 `lib/supabase/server.ts`

`createServerClient` com `cookies()` do `next/headers`, usando `getAll`/`setAll` (não os métodos depreciados `get`/`set`).

### 4.4 `lib/dal.ts` — `requireAdmin()`

Memoizado por request via `cache()` do React.

1. `supabase.auth.getClaims()` / `getUser()` — sem sessão válida → redireciona `/admin/login`.
2. Busca `Admin` por `supabaseUserId` igual ao `id` da sessão. Se não encontrar, busca por `email` da claim **com `supabaseUserId IS NULL`** — se achar, é o primeiro acesso: faz o `UPDATE` de linkagem (§4.1) ali mesmo e segue como encontrado. Se nenhuma das duas buscas encontrar nada, é caso 3.
3. Sem registro correspondente (nas duas buscas) → redireciona para **`/`** (home pública) com um **toast "Acesso negado"** — autenticado no Supabase, mas sem linha em `Admin`. Não redireciona pro `/admin/login` (evitaria loop de redirect).
4. Registro encontrado → retorna `{ id, email, name, role, isSuperAdmin }`. Essa é a checagem **autoritativa**, chamada em toda Server Action/Route Handler de admin.

A decisão pura fica isolada de I/O: `resolveAdminAccess(session, adminRecord): 'ok' | 'unauthenticated' | 'forbidden'` — é essa função que ganha teste unitário (TDD), `requireAdmin()` é só o wrapper que busca os dados e chama ela.

### 4.5 Gestão de admins (schema/regra agora, tela na Fase 2)

- Qualquer admin pode criar outro (`email` + `name`, sem senha) e remover um admin existente.
- Remover um admin com `isSuperAdmin = true` é **sempre bloqueado** — validado na Server Action (não só escondendo o botão na UI).
- A tela em si (formulário de adicionar/remover) é conteúdo de admin como qualquer outro CRUD → entra na Fase 2, junto dos demais. Fase 0 só garante que o schema e a regra de bloqueio existem e são testáveis.

### 4.6 RLS

RLS ligado em todas as 9 tabelas, política deny-all para `anon`/`authenticated` (só `service_role` passa). Como Prisma não tem DSL de policy, isso entra como SQL puro dentro de uma migration (`prisma migrate dev --create-only`, edito o SQL gerado antes de aplicar) — fica versionado no mesmo histórico de migrations do schema. Defesa em profundidade: Prisma nem passa por PostgREST, então isso protege contra um uso futuro do client Supabase direto do browser, não é a checagem principal (essa é `requireAdmin()`, §4.4).

## 5. Seed

`prisma/seed.ts` cria:

- **1 linha** em `Admin`: `{ email: "fred.rlopes@gmail.com", name: "Fred", isSuperAdmin: true }` — sem `supabaseUserId` (fica nulo até o primeiro login). Não precisa mais de convite manual pelo dashboard do Supabase, nem para esse primeiro registro.
- Linhas singleton (`PastorProfile`, `VideoHighlight`, `OfferingSettings`, `FooterSettings`) com conteúdo placeholder, para a Fase 1 ter algo para renderizar sem esperar conteúdo real.

Formato exato de disparo do seed (`prisma.config.ts` vs. chave antiga `"prisma"` do `package.json`) fica marcado para conferir no momento da implementação — Prisma mudou esse formato recentemente e não temos o context7 rodado para essa biblioteca ainda (ver `CLAUDE.md` §10).

## 6. Testes desta fase

- **TDD real**: `resolveAdminAccess()` — 3 casos (sem sessão → `unauthenticated`; sessão sem `Admin` correspondente → `forbidden`; sessão com `Admin` encontrado → `ok`), mais o caso de bloqueio de remoção do superAdmin (função pura equivalente, ex. `canRemoveAdmin(target): boolean`).
- **Integração**: seed roda + round-trip de leitura de um singleton (ex. `PastorProfile`) confirma que schema + `DATABASE_URL`/`DIRECT_URL` funcionam ponta a ponta.
- **Isolamento**: usar branches do Supabase (`create_branch`/`reset_branch`, já disponíveis via MCP nesta sessão) como banco descartável para essas rodadas, em vez de rodar contra o banco de dev real.
- `proxy.ts` fica intencionalmente fino (delega a leitura de sessão) — não ganha teste unitário próprio; verificar manualmente (ou via Playwright, já disponível) que `/admin` redireciona sem sessão entra na "definição de pronto", não no TDD desta fase.

## 7. Fora de escopo desta fase

Qualquer tela (login, dashboard, CRUD de seção, formulário de adicionar/remover admin) — isso é Fase 1/2. Fase 0 entrega schema, conexão, Storage, `proxy.ts`, `lib/dal.ts`, RLS e seed — nada renderizável ainda.

## 8. Riscos / follow-ups

- Sintaxe/config exata do seed no `prisma.config.ts` novo — confirmar via context7 antes de escrever o código (não nesta fase de spec).
- API atual de `createServerClient`/cookies do `@supabase/ssr` 0.12.3 — mesma ressalva.
- `Admin.id @default("singleton")`-style default fixo em tabelas singleton: Prisma aceita `@default("singleton")` em campo `String @id`? Confirmar sintaxe exata (`@default(dbgenerated(...))` vs. valor literal) na implementação — se não for suportado assim, alternativa é `id Int @id @default(1)` com `check` constraint, ou simplesmente sempre buscar/criar a única linha via `findFirst`/`create` sem depender de um valor de PK fixo.
