# Fase 2 — Admin: design

Data: 2026-07-19. Relacionado: [`PRD.md`](../../../PRD.md) (§4.8, §6 modelo de dados, §9 área admin, §10 roadmap Fase 2, §12 questões em aberto, §13 critérios de aceite), [`CLAUDE.md`](../../../CLAUDE.md) (§3 arquitetura, §5 design tokens/primitivos, §6 convenções, §7 modelo de autorização). Pré-requisito: Fase 0 e Fase 1 concluídas — [`2026-07-18-fase-0-fundacao-design.md`](./2026-07-18-fase-0-fundacao-design.md), [`2026-07-19-fase-1-landing-publica-design.md`](./2026-07-19-fase-1-landing-publica-design.md).

## Objetivo

Dar aos ~3 admins um painel em `/admin` pra manter todo o conteúdo público (Sobre, Agenda, Livros, Vídeo, Depoimentos, Ofertas, Rodapé) atualizado sem depender de deploy, cobrindo PRD §4.8 (FR-21 a FR-26) por completo: login por magic link, CRUD por seção, upload de imagem direto pro Storage, revalidação sob demanda, e a tela de adicionar/remover admin com a regra de `isSuperAdmin` protegido. Fase 0 já entregou a fundação de autorização (`proxy.ts`, `lib/dal.ts`, `lib/require-admin.ts`, schema completo, bucket `media`) — esta fase constrói toda a UI e as Server Actions em cima disso; nenhuma tabela nova, nenhuma migration de schema de conteúdo é necessária.

## 1. Decisões desta fase (resumo)

- **Upload de imagem**: client sobe direto pro Supabase Storage (browser client com a sessão do admin), não via Server Action. A Server Action só recebe a URL pública resultante e grava no Prisma. Evita reenviar o binário pelo servidor Next.
- **Forms**: shadcn `Form` (Base UI + `react-hook-form` + `zod`) — validação client-side inline por campo, mesma zod schema reaproveitada dentro da Server Action como segunda camada de validação (defesa em profundidade, consistente com `CLAUDE.md` §7).
- **Edição de item de lista (Agenda/Livros/Depoimentos/Admins)**: página própria por item (`/admin/agenda/novo`, `/admin/agenda/[id]`), não modal. Formulário com upload de imagem precisa de espaço; página própria também dá URL recarregável.
- **Bucket `media`**: a policy `media public read` (SELECT amplo, `bucket_id = 'media'`) é removida nesta fase — ela habilita listagem pública do bucket inteiro (achado do Supabase advisor, `public_bucket_allows_listing`, nível WARN, confirmado em 2026-07-19), não é necessária pra servir URLs públicas de objeto (bucket já é `public = true`, isso sozinho já libera o endpoint `/object/public/...`). Fica só a policy de escrita `authenticated` (insert/update/delete), já existente desde a Fase 0.
- **Reordenação** (`order` de Agenda/Livros/Depoimentos): campo numérico no formulário de edição, não drag-and-drop. Mais simples, suficiente pro FR correspondente, e drag-and-drop reordering é um passo em direção ao construtor visual (fora de escopo, PRD §11).
- **`Testimonial.avatarColor`**: `Select` fechado com ~6 cores predefinidas extraídas da paleta do protótipo (`CLAUDE.md` §5), não color picker livre — evita admin não-técnico escolher cor fora da paleta.
- **Sobre / `AboutPillar`**: um único formulário edita `PastorProfile` inteiro + os 3 `AboutPillar` (ícone/título/descrição) inline. Sem tela de adicionar/remover pilar — PRD fixa "três frentes", nenhum FR pede um 4º.
- **Sem exclusão de imagem antiga no Storage ao trocar/remover**: fora de escopo. Arquivo órfão fica no bucket; custo irrelevante nessa escala, e nenhum FR pede isso.
- **Testando o login por magic link sem inbox real**: `supabase.auth.admin.generateLink({ type: 'magiclink', email })` (service role, novo `lib/supabase/admin.ts`) gera um `token_hash` diretamente, usado em Playwright pra bater em `/auth/confirm` sem depender de e-mail de verdade chegar.
- **Avaliado e descartado**: modal (`Dialog`) pra criar/editar item de lista — cabe usar `Dialog` só pra confirmação de exclusão, não pro formulário inteiro.

## 2. Estrutura de arquivos

```
app/
  auth/
    confirm/route.ts          # callback do magic link (verifyOtp), fora do proxy matcher (/admin/:path*)
  admin/
    login/page.tsx            # público — form de e-mail, redireciona pro dashboard se já logado
    (dashboard)/               # route group — isola requireAdmin() num único layout
      layout.tsx                # requireAdmin() + shell (sidebar, header com nome do admin + logout)
      page.tsx                   # home do dashboard — links pras 8 seções
      sobre/page.tsx
      agenda/
        page.tsx                 # Table (EntityTable) com toggle publicar/despublicar + excluir
        novo/page.tsx
        [id]/page.tsx
      livros/
        page.tsx
        novo/page.tsx
        [id]/page.tsx
      video/page.tsx
      depoimentos/
        page.tsx
        novo/page.tsx
        [id]/page.tsx
      ofertas/page.tsx
      rodape/page.tsx
      admins/page.tsx           # lista + form de adicionar + excluir (FR-26)
components/
  admin/
    sidebar.tsx                 # nav lateral, 'use client' só pro item ativo (usePathname)
    entity-table.tsx             # genérico: colunas + toggle publicado + link editar + excluir (Agenda/Livros/Depoimentos)
    image-upload-field.tsx       # 'use client' — upload direto pro Storage, preview, integra com RHF
    delete-confirm-dialog.tsx    # 'use client' — Dialog de confirmação antes de Server Action destrutiva
    about-form.tsx
    agenda-form.tsx
    book-form.tsx
    video-form.tsx
    testimonial-form.tsx
    offerings-form.tsx
    footer-form.tsx
    admin-form.tsx                # adicionar admin (email + nome)
    logout-button.tsx
lib/
  supabase/
    client.ts                   # createBrowserClient — novo, usado pro login (signInWithOtp) e upload
    admin.ts                     # createClient com service_role — novo, só pra generateLink (testes) e futuras necessidades server-only que precisem bypassar RLS explicitamente
  schemas/
    pastor-profile.ts  agenda-item.ts  book.ts  video-highlight.ts
    testimonial.ts  offering-settings.ts  footer-settings.ts  admin.ts
    # cada um: zod schema exportado, reusado como resolver do RHF (client) e dentro da Server Action (server)
  actions/
    auth.ts                      # signInWithOtp (login), signOut (logout)
    pastor-profile.ts  agenda-item.ts  book.ts  video-highlight.ts
    testimonial.ts  offering-settings.ts  footer-settings.ts  admin.ts
    # cada action: requireAdmin() → zod.parse → prisma write → revalidateTag(<seção>) → redirect (listas) | return state (singletons)
  storage/
    upload-path.ts                # função pura: (section, filename) → path "section/<uuid>-<slug>" — testada via TDD
```

`lib/content/*.ts` (leitura pública cacheada, Fase 1) não muda — as Server Actions de escrita ficam em `lib/actions/`, arquivo separado por domínio, para não misturar `'use server'` (que torna todo export do arquivo uma action) com os helpers de leitura de `lib/content/`.

## 3. Fluxo de autenticação (magic link)

1. `/admin/login`: campo de e-mail → `lib/actions/auth.ts` `signIn(email)` → confere se existe `Admin` com esse e-mail (mensagem genérica de sucesso em qualquer caso, nunca revela se o e-mail é admin) → se existe, `supabase.auth.signInWithOtp({ email })`.
2. Template padrão do Supabase Auth aponta pro link `{{ .SiteURL }}/auth/confirm?token_hash=...&type=email` (padrão documentado do `@supabase/ssr`). **Passo manual, não código**: confirmar no dashboard do Supabase que o template/redirect URL realmente aponta pra cá — task explícita no plano de implementação, não assumir.
3. `app/auth/confirm/route.ts`: lê `token_hash`/`type` da query, chama `supabase.auth.verifyOtp(...)`, redireciona pra `/admin`.
4. Primeiro acesso: `requireAdmin()` (já implementado na Fase 0) faz o backfill de `Admin.supabaseUserId` a partir do e-mail da sessão — nada novo aqui.
5. Logout: `lib/actions/auth.ts` `signOut()` → `supabase.auth.signOut()` → redirect `/admin/login`.
6. `app/admin/login/page.tsx` (Server Component): se já existe sessão válida, redireciona pra `/admin` direto (evita reexibir o form de login pra quem já está logado).

## 4. Upload de imagem

- `components/admin/image-upload-field.tsx`: client component integrado a um campo RHF. Ao selecionar um arquivo: valida tipo/tamanho no client → `supabase.storage.from('media').upload('<seção>/<uuid>-<nome>', file)` usando `lib/supabase/client.ts` (sessão do admin logado, autorizada pela policy `authenticated` insert) → `getPublicUrl` → seta o valor do campo RHF com a URL pública e mostra preview. O "Salvar" da página só grava a URL já resolvida — nenhuma Server Action lida com binário.
- Path por seção: `media/<profile|agenda|books|video|testimonials>/<uuid>-<filename-slugificado>` (pastas já definidas na Fase 0, `lib/storage/upload-path.ts` formaliza a função pura).
- Falha de upload: toast de erro, campo mantém a URL anterior (edição) ou fica vazio (criação, bloqueia submit via validação zod de URL obrigatória).

## 5. Validação e Server Actions

- Uma zod schema por domínio em `lib/schemas/`, espelhando os campos do model Prisma correspondente (PRD §6). Reusada como resolver do `useForm` (shadcn `Form`) e dentro da Server Action via `schema.parse(formValues)`.
- Toda Server Action de mutação: `requireAdmin()` primeiro (autoritativo, CLAUDE §7) → parse zod → escrita Prisma → `revalidateTag('<seção>')` (mesma tag usada em `lib/content/`) → para listas, `redirect()` de volta pra `/admin/<seção>` com toast de sucesso via search param lido no client; para singletons (Sobre, Vídeo, Ofertas, Rodapé), retorna `{ success, errors }` via `useActionState`, toast (`sonner`) sem navegação.
- Erros de constraint do Prisma (ex.: `Admin.email` duplicado) capturados na action, retornados como erro de campo, não stack trace genérico.

## 6. Componentes compartilhados

`EntityTable` cobre Agenda/Livros/Depoimentos (mesma forma: tabela + badge publicado/despublicado + link editar + botão excluir com `DeleteConfirmDialog`) — as 3 seções são estruturalmente idênticas o bastante pra justificar 1 componente genérico em vez de 3 quase-duplicatas. `Sidebar`, `ImageUploadField`, `DeleteConfirmDialog`, `LogoutButton` são usados por praticamente toda página do dashboard.

Novos primitivos shadcn a instalar: `form input textarea select table dialog sonner` (Base UI, conferir código gerado antes de usar — `components.json` já está em `base-nova`, não Radix).

## 7. Mapeamento FR → implementação

| FR | Onde |
|---|---|
| FR-21 (login restrito) | `proxy.ts` (já existe) + `requireAdmin()` (já existe) + `(dashboard)/layout.tsx` (novo) |
| FR-22 (CRUD por seção) | `app/admin/(dashboard)/<seção>/*` + `lib/actions/<seção>.ts` |
| FR-23 (upload direto) | `ImageUploadField` + `lib/supabase/client.ts` |
| FR-24 (revalidação sob demanda) | `revalidateTag()` em toda action, tags iguais às de `lib/content/` |
| FR-25 (RBAC simples) | nenhuma checagem extra além de `requireAdmin()` — todo admin autenticado tem acesso total |
| FR-26 (add/remover admin, superAdmin protegido) | `app/admin/(dashboard)/admins/page.tsx` + `lib/actions/admin.ts` (usa `canRemoveAdmin()` de `lib/dal.ts`, já existente e testado) |

## 8. Testes e verificação

- **TDD** (lógica pura nova): `lib/storage/upload-path.ts`. Zod schemas são declarativas, não exigem TDD à parte — cobertas indiretamente pelos testes de action/E2E.
- **Verificação principal**: `bun run dev` + Playwright, por seção — preencher formulário (incl. upload real de imagem contra o bucket `media` do projeto Supabase configurado), salvar, conferir que a home pública (`/`) reflete a mudança sem rebuild (é o próprio critério de aceite "Admin" do PRD §13, testado literalmente). Login por magic link verificado via `generateLink` (service role), não e-mail real.
- `bunx oxlint`, `bunx tsc --noEmit`, `bun test` antes de cada commit (`CLAUDE.md` §14).
- Fidelidade visual: como o protótipo (`design/`) não tem tela de admin, os formulários seguem os tokens/primitivos shadcn já mapeados (`CLAUDE.md` §5) sem inventar visual novo — validar `--destructive` (`#EC2030`, ainda não visto em tela real, PRD §12) contra o `Dialog`/erro de formulário de verdade nesta fase.
- Re-rodar `get_advisors` (Supabase MCP) ao final da fase — confirmar que `public_bucket_allows_listing` some depois do `DROP POLICY`.

## 9. Fora de escopo

Exclusão de imagem antiga no Storage ao substituir/remover · drag-and-drop de reordenação · RBAC granular por seção (FR-25 já decide isso) · bloqueio especial de auto-remoção de admin (só `isSuperAdmin` é protegido, por FR-26) · qualquer coisa do papel `student` · AbacatePay / construtor visual / área do aluno (v2, PRD §11).
