# Fase 0 — Fundação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the technical foundation — Prisma schema, real Supabase connection/Storage, and the `/admin` auth/authorization model (magic-link login, superAdmin protection) — so Fases 1 and 2 have something to build content and screens on top of.

**Architecture:** Prisma (server-only) talks to Supabase Postgres through the Supavisor pooler; Supabase Auth issues sessions via magic link; a thin `proxy.ts` does an optimistic session check while a Prisma-backed `requireAdmin()` in `lib/dal.ts` is the one authoritative authorization gate. RLS is enabled on every app table as defense-in-depth (Prisma's connection owns the tables and bypasses it; `anon`/`authenticated` do not). No UI is built in this phase.

**Tech Stack:** Next.js 16.2.10 (App Router), TypeScript strict, Prisma (generator `prisma-client`, ESM client), `@supabase/ssr` 0.12.3 / `@supabase/supabase-js` 2.110.7, Bun 1.3.12 + `bun:test`, Tailwind CSS 4.3.3.

## Global Constraints

- Bun only for install/run/test (`bun`, `bunx`) — never npm/yarn/pnpm.
- `bunx oxlint` for lint — never ESLint.
- TypeScript strict (already on in `tsconfig.json`) — no `any` introduced by this plan.
- Prisma client code is server-only (`import 'server-only'` where applicable) — never imported from a Client Component.
- Content strings are pt-BR; identifiers, file names, commit messages are English.
- `proxy.ts` is optimistic only — every Server Action/Route Handler touching admin data must call `requireAdmin()` itself; RLS is defense-in-depth, not the primary gate (`CLAUDE.md` §7).
- Login is magic link (no password). `Admin.isSuperAdmin = true` rows can never be removed — enforced in code (`canRemoveAdmin`), not just hidden in UI.
- No secrets committed — `.env*` stays gitignored; use `.env.example` (no real values) to document required vars.
- Design tokens (colors/radius/fonts) come from `design/design-system-landing-page-pastor.pdf` / `CLAUDE.md` §5 — no invented values.
- Nothing from the v2 roadmap (AbacatePay, drag-n-drop builder, student area) gets built in this phase.

---

## Task 1: Install Prisma and wire the generator

**Files:**
- Modify: `package.json`
- Modify: `prisma.config.ts` (verify only, no change expected)
- Modify: `prisma/schema.prisma:1-13` (no change yet, just confirm generator line)

**Interfaces:**
- Produces: working `bunx prisma` CLI, `bun:x prisma generate` writing to `lib/generated/prisma`.

- [ ] **Step 1: Install packages**

```bash
bun add -d prisma
bun add @prisma/client dotenv
```

- [ ] **Step 2: Verify the CLI resolves and the existing schema is valid**

Run: `bunx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: install prisma and @prisma/client"
```

---

## Task 2: Write the full Prisma schema

> **Correction discovered during implementation (installed Prisma is 7.8.0, not the 5.x/6.x-style config this plan originally assumed):** Prisma 7 removed `url`/`directUrl` from the `datasource` block in `schema.prisma` entirely — confirmed via `bunx prisma validate` error `P1012` ("The datasource property `url` is no longer supported in schema files... pass either `adapter`... to the `PrismaClient` constructor") and via `node_modules/@prisma/config/dist/index.d.ts` (`Datasource` type only has `url?`/`shadowDatabaseUrl?`, and that URL is for the **CLI** — Migrate/introspection/seed — not for the runtime client). Runtime connections now go through a driver adapter (`@prisma/adapter-pg`) passed to `new PrismaClient({ adapter })` — confirmed from the generated client's own doc comment at `lib/generated/prisma/internal/class.ts:70-71`: `adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })`. This changes where `DATABASE_URL`/`DIRECT_URL` are each used — see the corrected steps below and Task 6.

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma.config.ts`

**Interfaces:**
- Produces: models `Admin`, `PastorProfile`, `AboutPillar`, `AgendaItem`, `Book`, `VideoHighlight`, `Testimonial`, `OfferingSettings`, `FooterSettings`; enums `Role`, `AgendaType`, `PixKeyType`. All later tasks (`lib/prisma.ts`, `lib/dal.ts`, `prisma/seed.ts`) depend on these exact field names.
- Produces: `prisma.config.ts`'s `datasource.url` pointed at `DIRECT_URL` (session-mode pooler, port 5432) — this is the connection the Prisma **CLI** uses for `migrate`/`db execute`/`db seed`'s schema step. `DATABASE_URL` (transaction-mode pooler, port 6543) is reserved for the runtime driver adapter Task 6 configures — the CLI and the app now use two entirely separate connection paths in Prisma 7, not a shared schema-level config.

- [ ] **Step 1: Replace `prisma/schema.prisma` contents**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  admin
  student // reserved for v2, unused in MVP
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
  supabaseUserId String?  @unique
  name           String
  role           Role     @default(admin)
  isSuperAdmin   Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model PastorProfile {
  id             String @id @default("singleton")
  heroPhotoUrl   String
  heroHeadline   String
  heroHighlight  String
  heroIntro      String
  familyPhotoUrl String
  aboutEyebrow   String
  aboutHeading   String
  aboutIntro     String
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
  id            String  @id @default(uuid())
  title         String
  subtitle      String
  description   String
  price         Decimal
  coverImageUrl String
  buyUrl        String
  order         Int
  isPublished   Boolean @default(true)
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

- [ ] **Step 2: Update `prisma.config.ts`'s datasource to `DIRECT_URL`**

Edit `prisma.config.ts` so the `datasource` block reads:

```typescript
  datasource: {
    // Prisma 7: this URL is used only by the CLI (migrate/introspect/db seed's
    // schema step), never by the generated PrismaClient at runtime. Uses the
    // session-mode pooler (DIRECT_URL) because migrations need session-level
    // features the transaction-mode pooler (DATABASE_URL) doesn't support.
    // The app's runtime connection is configured separately via a driver
    // adapter in lib/prisma.ts, pointed at DATABASE_URL.
    url: process.env["DIRECT_URL"],
  },
```

(Leave `schema` and `migrations.path` untouched.)

- [ ] **Step 3: Validate**

Run: `bunx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 4: Generate the client and confirm the adapter pattern**

Run: `bunx prisma generate`
Expected: `✔ Generated Prisma Client (7.8.0) to ./lib/generated/prisma`

Run: `grep -n "adapter" lib/generated/prisma/internal/class.ts | head -5`
Expected: shows the generated doc comment example `adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })` — this confirms Task 6 will use `DATABASE_URL` (not `DIRECT_URL`) for the runtime adapter.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma.config.ts
git commit -m "feat: define full prisma schema for fase 0 entities

Prisma 7 removed url/directUrl from schema.prisma's datasource block —
connection URLs for the CLI now live in prisma.config.ts only, and the
runtime PrismaClient requires a driver adapter (Task 6). prisma.config.ts
now points at DIRECT_URL for migrate/introspect; DATABASE_URL is reserved
for the runtime adapter."
```

---

## Task 3: Run the initial migration

**Files:**
- Create: `prisma/migrations/<timestamp>_init/migration.sql` (generated by Prisma, not hand-written)

**Interfaces:**
- Consumes: `prisma/schema.prisma` from Task 2.
- Produces: live tables in the `landing-page-xurdir` Supabase Postgres instance; generated client at `lib/generated/prisma`.

- [ ] **Step 1: Run the migration**

Run: `bunx prisma migrate dev --name init`
Expected: prompts complete without error, ends with `Your database is now in sync with your schema.` and `✔ Generated Prisma Client`.

- [ ] **Step 2: Verify tables exist**

> `bunx prisma db execute` runs a script but does not print `SELECT` results (confirmed empirically — it only reports "Script executed successfully" even when the query succeeds). Use the Supabase MCP tool `list_tables` instead, which returns real data.

Using the Supabase MCP tool `list_tables` with `project_id: "flcjszndmddruybziujn"`, `schemas: ["public"]`, `verbose: false`.
Expected: the `tables` array lists `Admin`, `PastorProfile`, `AboutPillar`, `AgendaItem`, `Book`, `VideoHighlight`, `Testimonial`, `OfferingSettings`, `FooterSettings`, and `_prisma_migrations`.

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations
git commit -m "feat: add initial migration for fase 0 schema"
```

---

## Task 4: Enable RLS on every app table (defense-in-depth)

**Files:**
- Create: `prisma/migrations/<timestamp>_enable_rls/migration.sql`

**Interfaces:**
- Consumes: tables created in Task 3.
- Produces: RLS enabled on all 9 app tables. No policies are added — with RLS enabled and zero policies, only the table owner (the Prisma pooler connection) can read/write; `anon`/`authenticated` (used by any future direct Supabase client) get nothing by default. `service_role` in Supabase already bypasses RLS by platform design, so it needs no explicit policy either.

- [ ] **Step 1: Create an empty migration to edit by hand**

Run: `bunx prisma migrate dev --create-only --name enable_rls`
Expected: creates `prisma/migrations/<timestamp>_enable_rls/migration.sql` with no SQL inside yet.

- [ ] **Step 2: Fill in the migration SQL**

Edit the generated `migration.sql` file to contain exactly:

```sql
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PastorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AboutPillar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgendaItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoHighlight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OfferingSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FooterSettings" ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 3: Apply it**

Run: `bunx prisma migrate dev`
Expected: `Your database is now in sync with your schema.` (applies the migration written in Step 2).

- [ ] **Step 4: Verify RLS is on**

Using the Supabase MCP tool `list_tables` with `project_id: "flcjszndmddruybziujn"`, `schemas: ["public"]`, `verbose: false` (same tool as Task 3's Step 2).
Expected: `rls_enabled: true` for all 9 app tables (it's fine if `_prisma_migrations` itself still shows `rls_enabled: false` — it's Prisma's internal bookkeeping table, not app data, and isn't in this task's list).

- [ ] **Step 5: Commit**

```bash
git add prisma/migrations
git commit -m "feat: enable row level security on all app tables"
```

---

## Task 5: Create the Supabase Storage bucket and policies

**Files:** none in the repo — this configures the Supabase project directly via the Supabase MCP tool (`apply_migration`), tracked in Supabase's own migration history (`list_migrations`), separate from Prisma's `public`-schema migrations.

**Interfaces:**
- Produces: bucket `media` (public read), with `storage.objects` policies allowing public `select` and `authenticated` `insert`/`update`/`delete` scoped to that bucket. Fase 1/2 image uploads and public `<img>`/`next/image` URLs depend on this.

- [ ] **Step 1: Apply the bucket + policy migration**

Using the Supabase MCP tool `apply_migration` on project `flcjszndmddruybziujn`, with name `create_media_bucket` and this SQL:

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read"
on storage.objects for select
to public
using (bucket_id = 'media');

create policy "media authenticated write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media');

create policy "media authenticated update"
on storage.objects for update
to authenticated
using (bucket_id = 'media');

create policy "media authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'media');
```

- [ ] **Step 2: Verify**

Using the Supabase MCP tool `list_migrations` on project `flcjszndmddruybziujn`.
Expected: `create_media_bucket` appears in the list.

No commit — nothing changes in the repo for this task.

---

## Task 6: `lib/prisma.ts` — Prisma client singleton

> **Correction (see Task 2's note):** Prisma 7's generated client requires a driver adapter for its runtime connection — plain `new PrismaClient()` with no `adapter` has no way to connect at all, since `schema.prisma` no longer carries a `url`. Confirmed via the generated client's own doc comment (`lib/generated/prisma/internal/class.ts:70-71`): `adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })`. This requires the `@prisma/adapter-pg` package (not in the original plan — install it in Step 1).
>
> **Import path gotcha:** import `PrismaClient` from `@/lib/generated/prisma/client`, not the bare `@/lib/generated/prisma` directory — the `prisma-client` generator does not emit an `index.ts` barrel (confirmed empirically: deleting a hand-made one and re-running `bunx prisma generate` did not recreate it). `client.ts` is the real file that exports `PrismaClient`.

**Files:**
- Create: `lib/prisma.ts`
- Modify: `package.json` (add `@prisma/adapter-pg`)

**Interfaces:**
- Consumes: `lib/generated/prisma` (generated by Task 3), `@prisma/adapter-pg`.
- Produces: `export const prisma: PrismaClient` — imported by `lib/dal.ts` (Task 9) and `prisma/seed.ts` (Task 11) uses its own separate instance per Prisma convention, not this one.

- [ ] **Step 1: Install the Postgres driver adapter**

```bash
bun add @prisma/adapter-pg
```

- [ ] **Step 2: Write the singleton**

```typescript
import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `bunx tsc --noEmit`
Expected: no errors mentioning `lib/prisma.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/prisma.ts package.json bun.lock
git commit -m "feat: add prisma client singleton with pg driver adapter"
```

---

## Task 7: `lib/supabase/server.ts` — server-side Supabase client

**Files:**
- Create: `lib/supabase/server.ts`

**Interfaces:**
- Produces: `export async function createClient(): Promise<SupabaseClient>` — used by `lib/dal.ts` (Task 9).

- [ ] **Step 1: Write the client factory**

```typescript
import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component that can't set cookies;
            // safe to ignore because proxy.ts refreshes the session.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `bunx tsc --noEmit`
Expected: no errors mentioning `lib/supabase/server.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "feat: add server-side supabase client factory"
```

---

## Task 8: `lib/dal.ts` — pure authorization decisions (TDD)

**Files:**
- Create: `lib/dal.ts`
- Test: `lib/dal.test.ts`

**Interfaces:**
- Produces: `resolveAdminAccess(session, adminRecord): AdminAccessResult`, `canRemoveAdmin(target: { isSuperAdmin: boolean }): boolean`, and the types `AdminSession`, `AdminRecord`, `AdminAccessResult`. Task 9 adds the I/O wrapper `requireAdmin()` to this same file, consuming these two functions.

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/dal.test.ts
import { describe, it, expect } from 'bun:test'
import { resolveAdminAccess, canRemoveAdmin } from './dal'

describe('resolveAdminAccess', () => {
  it('returns unauthenticated when there is no session', () => {
    const result = resolveAdminAccess(null, null)
    expect(result).toEqual({ status: 'unauthenticated' })
  })

  it('returns forbidden when the session has no matching Admin row', () => {
    const session = { id: 'user-1', email: 'nao-admin@example.com' }
    const result = resolveAdminAccess(session, null)
    expect(result).toEqual({ status: 'forbidden' })
  })

  it('returns ok with the admin data when both session and record exist', () => {
    const session = { id: 'user-1', email: 'admin@example.com' }
    const adminRecord = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Fred',
      supabaseUserId: 'user-1',
      isSuperAdmin: true,
    }
    const result = resolveAdminAccess(session, adminRecord)
    expect(result).toEqual({
      status: 'ok',
      admin: { id: 'admin-1', email: 'admin@example.com', name: 'Fred', isSuperAdmin: true },
    })
  })
})

describe('canRemoveAdmin', () => {
  it('is false for a superAdmin', () => {
    expect(canRemoveAdmin({ isSuperAdmin: true })).toBe(false)
  })

  it('is true for a regular admin', () => {
    expect(canRemoveAdmin({ isSuperAdmin: false })).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test lib/dal.test.ts`
Expected: FAIL — `Cannot find module './dal'` (file doesn't exist yet).

- [ ] **Step 3: Write the minimal implementation**

```typescript
// lib/dal.ts
export type AdminSession = { id: string; email: string } | null

export type AdminRecord = {
  id: string
  email: string
  name: string
  supabaseUserId: string | null
  isSuperAdmin: boolean
} | null

export type AdminAccessResult =
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | {
      status: 'ok'
      admin: { id: string; email: string; name: string; isSuperAdmin: boolean }
    }

export function resolveAdminAccess(
  session: AdminSession,
  adminRecord: AdminRecord
): AdminAccessResult {
  if (!session) return { status: 'unauthenticated' }
  if (!adminRecord) return { status: 'forbidden' }

  return {
    status: 'ok',
    admin: {
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      isSuperAdmin: adminRecord.isSuperAdmin,
    },
  }
}

export function canRemoveAdmin(target: { isSuperAdmin: boolean }): boolean {
  return !target.isSuperAdmin
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test lib/dal.test.ts`
Expected: `5 pass, 0 fail`.

- [ ] **Step 5: Commit**

```bash
git add lib/dal.ts lib/dal.test.ts
git commit -m "feat: add pure admin authorization decisions with tests"
```

---

## Task 9: `requireAdmin()` — I/O wrapper (first-login linking)

**Files:**
- Modify: `lib/dal.ts` (append to the file created in Task 8)

**Interfaces:**
- Consumes: `prisma` (Task 6), `createClient` from `lib/supabase/server` (Task 7), `resolveAdminAccess` (Task 8).
- Produces: `export const requireAdmin: () => Promise<{ id: string; email: string; name: string; isSuperAdmin: boolean }>` — every admin Server Action/Route Handler in Fase 2 calls this first.

This wrapper glues already-tested pure logic to Next/Supabase/Prisma I/O — per `CLAUDE.md` §14 and the approved spec (`docs/superpowers/specs/2026-07-18-fase-0-fundacao-design.md` §6), it is not unit-tested directly; its correctness rides on the Task 8 tests plus manual verification once `/admin` exists (Fase 2).

- [ ] **Step 1: Append the wrapper to `lib/dal.ts`**

```typescript
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const session: AdminSession =
    !error && data?.claims ? { id: data.claims.sub as string, email: data.claims.email as string } : null

  let adminRecord: AdminRecord = session
    ? await prisma.admin.findUnique({ where: { supabaseUserId: session.id } })
    : null

  if (session && !adminRecord) {
    const unlinked = await prisma.admin.findFirst({
      where: { email: session.email, supabaseUserId: null },
    })
    if (unlinked) {
      adminRecord = await prisma.admin.update({
        where: { id: unlinked.id },
        data: { supabaseUserId: session.id },
      })
    }
  }

  const result = resolveAdminAccess(session, adminRecord)

  if (result.status === 'unauthenticated') {
    redirect('/admin/login')
  }
  if (result.status === 'forbidden') {
    redirect('/?deniedAccess=1')
  }

  return result.admin
})
```

Note: add the `import 'server-only'` line only once at the top of `lib/dal.ts` (not duplicated from Task 8, which had no imports yet).

- [ ] **Step 2: Verify it type-checks**

Run: `bunx tsc --noEmit`
Expected: no errors mentioning `lib/dal.ts`.

- [ ] **Step 3: Run the Task 8 tests again to confirm nothing broke**

Run: `bun test lib/dal.test.ts`
Expected: `5 pass, 0 fail`.

- [ ] **Step 4: Commit**

```bash
git add lib/dal.ts
git commit -m "feat: add requireAdmin with first-login supabase linking"
```

---

## Task 10: `proxy.ts` — optimistic session redirect

**Files:**
- Create: `proxy.ts` (repo root, next to `app/`)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
- Produces: redirect to `/admin/login` for any unauthenticated request under `/admin/**`. This is the Next 16 rename of `middleware.ts` — same file position, same `config.matcher` mechanism.

- [ ] **Step 1: Write `proxy.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `bunx tsc --noEmit`
Expected: no errors mentioning `proxy.ts`.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: add optimistic session proxy for /admin routes"
```

---

## Task 11: `prisma/seed.ts` — superAdmin + placeholder content

> **Correction (see Task 2/6's notes):** like `lib/prisma.ts`, the seed script instantiates its own runtime `PrismaClient` — it also needs the `@prisma/adapter-pg` adapter (already installed in Task 6), pointed at `DATABASE_URL`. `prisma.config.ts`'s `datasource.url` (`DIRECT_URL`, set in Task 2) is only consulted by the `prisma db seed` CLI wrapper to locate/run the script — not by the client the script itself constructs.

**Files:**
- Create: `prisma/seed.ts`
- Modify: `prisma.config.ts`

**Interfaces:**
- Consumes: `lib/generated/prisma` (Task 3), all 9 models (Task 2), `@prisma/adapter-pg` (installed in Task 6).
- Produces: 1 `Admin` row (`isSuperAdmin: true`), 1 row each in the 4 singleton tables. Fase 1 reads these to render the public page without waiting for real content.

- [ ] **Step 1: Write `prisma/seed.ts`**

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.admin.upsert({
    where: { email: 'fred.rlopes@gmail.com' },
    update: {},
    create: {
      email: 'fred.rlopes@gmail.com',
      name: 'Fred',
      isSuperAdmin: true,
    },
  })

  await prisma.pastorProfile.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      heroPhotoUrl: 'https://picsum.photos/seed/pastor-hero/1200/800',
      heroHeadline: 'Uma palavra que liberta.',
      heroHighlight: 'Uma família que acolhe.',
      heroIntro: 'Conteúdo placeholder — editar no admin.',
      familyPhotoUrl: 'https://picsum.photos/seed/pastor-familia/460/320',
      aboutEyebrow: 'Sobre o Ministério',
      aboutHeading: 'Uma missão, três frentes',
      aboutIntro: 'Conteúdo placeholder — editar no admin.',
    },
  })

  await prisma.videoHighlight.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      eyebrow: 'Palavra Recente',
      title: 'Libertos para libertar',
      description: 'Conteúdo placeholder — editar no admin.',
      thumbnailUrl: 'https://picsum.photos/seed/pastor-video/900/640',
      videoUrl: 'https://youtube.com',
      durationLabel: '42 min',
      ctaLabel: 'Assistir agora',
    },
  })

  await prisma.offeringSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      pixKey: 'financeiro@example.org',
      pixKeyType: 'email',
      pixMerchantName: 'Ministerio Seja Livre',
      pixMerchantCity: 'SAO PAULO',
      nationalBank: 'Banco Exemplo S.A.',
      nationalAgency: '0000',
      nationalAccount: '00000-0',
      nationalCnpj: '00.000.000/0001-00',
      intlBank: 'Global Trust Bank',
      intlIban: 'BR00 0000 0000 0000 0000',
      intlSwift: 'EXAMPLEXXX',
      intlAccountHolder: 'Ministerio Seja Livre',
    },
  })

  await prisma.footerSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      cnpj: '00.000.000/0001-00',
      address: 'Endereço placeholder — editar no admin.',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      whatsappUrl: 'https://wa.me/5500000000000',
      copyrightText: '© 2026 Ministério Seja Livre. Todos os direitos reservados.',
    },
  })

  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 2: Wire the seed command into `prisma.config.ts`**

Read the current file first (`prisma.config.ts`), then add a `seed` key inside the existing `migrations` object so it reads:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

If `bunx prisma db seed` (Step 3) errors saying it doesn't recognize a `seed` key in `migrations`, that's the "prisma.config.ts seed format" risk flagged in the spec (§8) — in that case fall back to running the seed directly with `bun run prisma/seed.ts` instead of `bunx prisma db seed`, and note the discrepancy in the task's commit message.

- [ ] **Step 3: Run the seed**

Run: `bunx prisma db seed`
Expected: prints `Seed concluído.` with no errors.

- [ ] **Step 4: Verify the superAdmin row**

> `bunx prisma db execute` does not print `SELECT` results (confirmed empirically in Task 3 — it only reports "Script executed successfully"). Use the Supabase MCP tool `execute_sql` instead, which returns real query results.

Using the Supabase MCP tool `execute_sql` with `project_id: "flcjszndmddruybziujn"` and query `select email, "isSuperAdmin", "supabaseUserId" from "Admin";`.
Expected: one row, `email = fred.rlopes@gmail.com`, `isSuperAdmin = true`, `supabaseUserId` is null.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts prisma.config.ts
git commit -m "feat: add seed for initial superAdmin and placeholder content"
```

---

## Task 12: Design tokens in `app/globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: token values from `CLAUDE.md` §5 (already documented, sourced from `design/design-system-landing-page-pastor.pdf`).
- Produces: shadcn CSS variables (`--background`, `--primary`, etc.) and Tailwind theme tokens (`--radius-sm/-lg/-full`, `--font-heading`, `--font-caveat`) matching the prototype. Task 13 (fonts) depends on `--font-heading`/`--font-caveat` existing here.

- [ ] **Step 1: Replace the `@theme inline` block's radius lines**

In `app/globals.css`, replace:

```css
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
```

with:

```css
  --radius-sm: 8px;
  --radius-md: var(--radius);
  --radius-lg: 24px;
  --radius-full: 999px;
```

(The prototype only defines sm/md/lg/pill radii — the extra xl/2xl/3xl/4xl tiers from the scaffold don't correspond to any design token, so they're dropped rather than kept unused.)

- [ ] **Step 2: Add font theme tokens**

In the same `@theme inline` block, replace:

```css
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
```

with:

```css
  --font-sans: var(--font-sans);
  --font-heading: var(--font-heading);
  --font-caveat: var(--font-caveat);
```

- [ ] **Step 3: Replace `:root` with the prototype's dark tokens**

Replace the entire `:root { ... }` block with:

```css
:root {
  --background: #161A22;
  --foreground: #F5F6FA;
  --card: #252B38;
  --card-foreground: #F5F6FA;
  --popover: #1D222D;
  --popover-foreground: #F5F6FA;
  --primary: #FF7A3D;
  --primary-foreground: #FFFFFF;
  --secondary: #293868;
  --secondary-foreground: #8FB4FF;
  --muted: #1D222D;
  --muted-foreground: #8A91A3;
  --accent: #293868;
  --accent-foreground: #8FB4FF;
  --destructive: #EC2030;
  --destructive-foreground: #FFFFFF;
  --border: rgba(255, 255, 255, 0.12);
  --input: rgba(255, 255, 255, 0.12);
  --ring: #4C8CFF;
  --radius: 14px;
}
```

- [ ] **Step 4: Replace `.dark` with the same values**

Replace the entire `.dark { ... }` block with:

```css
.dark {
  --background: #161A22;
  --foreground: #F5F6FA;
  --card: #252B38;
  --card-foreground: #F5F6FA;
  --popover: #1D222D;
  --popover-foreground: #F5F6FA;
  --primary: #FF7A3D;
  --primary-foreground: #FFFFFF;
  --secondary: #293868;
  --secondary-foreground: #8FB4FF;
  --muted: #1D222D;
  --muted-foreground: #8A91A3;
  --accent: #293868;
  --accent-foreground: #8FB4FF;
  --destructive: #EC2030;
  --destructive-foreground: #FFFFFF;
  --border: rgba(255, 255, 255, 0.12);
  --input: rgba(255, 255, 255, 0.12);
  --ring: #4C8CFF;
}
```

(Values are intentionally identical to `:root` — this is a dark-only site with no light/dark toggle; both blocks exist only so shadcn primitives that key off the `.dark` class selector still match, per `CLAUDE.md` §5.)

Leave the `@layer base { ... }` block at the bottom of the file unchanged.

- [ ] **Step 5: Verify the build picks it up**

Run: `bun run build`
Expected: build completes with no CSS errors (unrelated warnings about missing pages are fine — no route depends on these tokens yet).

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat: apply prototype design tokens to globals.css"
```

---

## Task 13: Fonts and dark mode in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `--font-heading`, `--font-caveat`, `--font-sans` theme tokens from Task 12.
- Produces: `<html lang="pt-BR" class="dark ...">` with Source Serif 4 / Manrope / Caveat loaded and exposed as the CSS variables the tokens reference.

- [ ] **Step 1: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Source_Serif_4, Manrope, Caveat } from "next/font/google";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Seja Livre",
  description: "Ministério Seja Livre — Pastor Xurdir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${sourceSerif4.variable} ${manrope.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `bun run build`
Expected: build completes with no errors related to font loading or `app/layout.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: load prototype fonts and force dark mode in root layout"
```

---

## Task 14: `.env.example`

**Files:**
- Create: `.env.example`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Write `.env.example`**

```bash
# Supavisor pooler (transaction mode) — runtime connection used by the app
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"

# Supavisor pooler (session mode) — used only by `prisma migrate`
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres"

# Supabase project API
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Public site URL (used in metadata/absolute links)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example for fase 0 environment variables"
```

---

## Self-Review Notes

- **Spec coverage**: schema (Task 2) ✓, connection (Task 1/3) ✓, Storage (Task 5) ✓, magic-link auth + first-login linking (Task 9) ✓, `proxy.ts` (Task 10) ✓, superAdmin protection (Task 8 `canRemoveAdmin`) ✓, RLS (Task 4) ✓, seed (Task 11) ✓, design tokens (Task 12) ✓, fonts/dark mode (Task 13) ✓. Not covered here (correctly deferred to Fase 2 per spec §7): `/admin/login` page, add/remove-admin UI, any content CRUD screen.
- **Placeholder scan**: no "TBD"/"TODO" left; the one open uncertainty (`prisma.config.ts` seed key format) has an explicit fallback command, not a placeholder.
- **Type consistency**: `AdminSession`/`AdminRecord`/`AdminAccessResult` (Task 8) are reused verbatim by `requireAdmin()` (Task 9) with no renaming; `resolveAdminAccess`/`canRemoveAdmin` signatures match between definition and test calls.
